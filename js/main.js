/* ==========================================================================
   main.js - 应用程序入口、全局异常捕获与生命周期初始化引导 (Bootstrap)
   ========================================================================== */

import { gameState } from './core/state.js';
import { dom } from './core/dom.js';
import { updateApiStatusIndicator } from './core/statusIndicator.js';
import { checkSavedGame, loadFromLocalStorage, initGame } from './controllers/gameController.js';
import { updateMyRoleOptions, updateApiModelOptions, setLanguage } from './i18n/engine.js';
import { showToast } from './utils.js';
import { populateScriptPreview, initScriptPreviewEvents } from './components/scriptPreview.js';
import { initPopoverEvents } from './components/popoverModal.js';
import { initCoreEvents } from './events.js';
import { loadLanguage, loadApiKey } from './services/storage.js';
import { validateDomReferences } from './core/dom.js';

// --- 全局未捕获运行时错误兜底 ---
window.onerror = function (message, source, lineno, colno, error) {
    alert("🚨 发现未捕获的运行时错误！\n\n错误信息: " + message + "\n出错文件: " + source + "\n出错行号: " + lineno + "\n出错列号: " + colno);
    return false;
};

// --- 应用程序初始化入口 ---
document.addEventListener("DOMContentLoaded", () => {
    try {
        console.log("🚀 [Bootstrap] 正在启动血染钟楼 AI 战术助手...");
        
        // 1.0 验证静态 DOM 引用，防止任何 ID 命名失同步问题
        validateDomReferences();

        // 1. 渲染 Lucide 矢量图标
        if (typeof lucide !== "undefined" && lucide.createIcons) {
            lucide.createIcons();
            console.log("✅ [Bootstrap] Lucide 图标加载成功");
        } else {
            console.warn("⚠️ [Bootstrap] Lucide 矢量图标库未就绪，图标将采用文本备用显示。");
        }
        
        // 2. 挂载各个独立 UI 模块的高内聚事件绑定，实现真正解耦
        initCoreEvents();
        initPopoverEvents();
        initScriptPreviewEvents();
        
        // 3. 初始化板子角色与模型下拉菜单
        updateMyRoleOptions();
        updateApiModelOptions();
        
        // 3.5 载入对应厂商保存的 API Key，防止刷新丢失
        const savedKey = loadApiKey(gameState.apiProvider);
        if (savedKey) {
            if (dom.apiKeyInput) dom.apiKeyInput.value = savedKey;
            gameState.apiKey = savedKey;
        }
        
        // 4. 渲染并填充剧本板子角色对照表
        populateScriptPreview();
        
        // 5. 开启 AI 接口大盘就绪状态监控
        updateApiStatusIndicator();
        window.addEventListener('online', updateApiStatusIndicator);
        window.addEventListener('offline', updateApiStatusIndicator);
        
        // 6. 检查是否有未完成的本地持久化对局并自动加载，避免覆盖
        const hasSaved = checkSavedGame();
        if (hasSaved) {
            loadFromLocalStorage();
            const restoreMsg = gameState.lang === "en"
                ? "Successfully recovered the last game state!"
                : "已自动为您恢复上次对局状态！";
            showToast(restoreMsg);
        } else {
            initGame();
        }
        
        // 7. 载入保存的语言选择，默认中文
        const savedLang = loadLanguage();
        setLanguage(savedLang);
        
        console.log("🚀 [Bootstrap] 应用完全启动成功，祝您钟楼旗开得胜！");
    } catch (err) {
        console.error("🚨 [Bootstrap] 致命初始化异常！进程被拦截：", err);
        alert("🚨 应用程序初始化启动失败！\n\n异常详情: " + err.message + "\n\n请检查浏览器兼容性或尝试清除缓存重新加载。");
    }
});

