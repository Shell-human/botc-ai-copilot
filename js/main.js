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
import { loadLanguage, loadApiKey } from './services/storage.js';

// --- 全局未捕获运行时错误兜底 ---
window.onerror = function (message, source, lineno, colno, error) {
    alert("🚨 发现未捕获的运行时错误！\n\n错误信息: " + message + "\n出错文件: " + source + "\n出错行号: " + lineno + "\n出错列号: " + colno);
    return false;
};

// --- AI 接口大盘就绪状态联动更新器 (防止误导显示，并支持厂商动态提示与缺 Key 预警) ---
export function updateApiStatusIndicator() {
    if (!dom.apiStatusIndicator || !dom.apiStatusText) return;
    const isEn = gameState.lang === "en";
    
    if (!navigator.onLine) {
        dom.apiStatusIndicator.className = "status-indicator offline";
        dom.apiStatusText.textContent = isEn ? "Offline Mode (Local Cache Active)" : "离线模式 (数据已保存在本地)";
        return;
    }

    const provider = gameState.apiProvider || "gemini";
    const apiKey = (dom.apiKeyInput ? dom.apiKeyInput.value.trim() : "") || gameState.apiKey;
    const baseUrl = (dom.apiBaseUrlInput ? dom.apiBaseUrlInput.value.trim() : "") || gameState.apiBaseUrl;
    const isLocalhost = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

    // 各大厂商名称中英文映射
    const providerTitles = {
        gemini: "Gemini",
        chatgpt: "ChatGPT",
        claude: "Claude",
        deepseek: "DeepSeek",
        qwen: isEn ? "Qwen" : "通义千问",
        zhipu: isEn ? "GLM" : "智谱清言",
        doubao: isEn ? "Doubao" : "豆包",
        kimi: isEn ? "Kimi" : "月之暗面",
        baidu: isEn ? "ERNIE" : "文心一言",
        custom: isEn ? "Custom" : "自定义接口"
    };
    
    const providerName = providerTitles[provider] || provider;

    if (!apiKey && !isLocalhost) {
        dom.apiStatusIndicator.className = "status-indicator warning";
        dom.apiStatusText.textContent = isEn ? `${providerName} Key Missing` : `${providerName} 密钥未输入`;
    } else {
        dom.apiStatusIndicator.className = "status-indicator online";
        dom.apiStatusText.textContent = isEn ? `${providerName} Ready` : `${providerName} 已就绪`;
    }
}
window.updateApiStatusIndicator = updateApiStatusIndicator;

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
});
