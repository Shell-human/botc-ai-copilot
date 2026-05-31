/* ==========================================================================
   main.js - 应用程序入口、全局异常捕获与生命周期初始化引导 (Bootstrap)
   ========================================================================== */

import {
    gameState,
    checkSavedGame,
    loadFromLocalStorage,
    initGame
} from './state.js';

import { dom } from './dom.js';
import { updateMyRoleOptions, updateApiModelOptions, setLanguage } from './i18n.js';
import { showToast } from './utils.js';
import { populateScriptPreview, initScriptPreviewEvents } from './components/scriptPreview.js';
import { initPopoverEvents } from './components/popoverModal.js';
import { initCoreEvents } from './events.js';
import { loadLanguage } from './services/storage.js';

// --- 全局未捕获运行时错误兜底 ---
window.onerror = function (message, source, lineno, colno, error) {
    alert("🚨 发现未捕获的运行时错误！\n\n错误信息: " + message + "\n出错文件: " + source + "\n出错行号: " + lineno + "\n出错列号: " + colno);
    return false;
};

// --- 网络状态指示灯更新 ---
export function updateNetworkStatus() {
    if (!dom.apiStatusIndicator || !dom.apiStatusText) return;
    if (navigator.onLine) {
        dom.apiStatusIndicator.className = "status-indicator online";
        dom.apiStatusText.textContent = gameState.lang === "en" ? "AI Engine Ready" : "AI 接口已就绪";
    } else {
        dom.apiStatusIndicator.className = "status-indicator offline";
        dom.apiStatusText.textContent = gameState.lang === "en" ? "Offline Mode (Local Cache Active)" : "离线模式 (数据已保存在本地)";
    }
}

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
    
    // 4. 渲染并填充剧本板子角色对照表
    populateScriptPreview();
    
    // 5. 开启网络状态监测
    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
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
});
