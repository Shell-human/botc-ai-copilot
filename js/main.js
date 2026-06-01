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

// --- 全局未捕获运行时错误兜底 ---
window.onerror = function (message, source, lineno, colno, error) {
    alert("🚨 发现未捕获的运行时错误！\n\n错误信息: " + message + "\n出错文件: " + source + "\n出错行号: " + lineno + "\n出错列号: " + colno);
    return false;
};

// --- 应用程序初始化入口 ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. 渲染 Lucide 矢量图标
    lucide.createIcons();
    
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
    
    // 8. setLanguage() 会通过 updateMyRoleOptions() 清空下拉框，也会通过 [data-i18n]
    //    覆盖 apiStatusText 的动态内容，此处重新同步状态以修正。
    updateApiStatusIndicator();
    if (gameState.evilBluffs) {
        if (gameState.evilBluffs[0] && dom.evilBluff1) dom.evilBluff1.value = gameState.evilBluffs[0];
        if (gameState.evilBluffs[1] && dom.evilBluff2) dom.evilBluff2.value = gameState.evilBluffs[1];
        if (gameState.evilBluffs[2] && dom.evilBluff3) dom.evilBluff3.value = gameState.evilBluffs[2];
    }
});
