/* ==========================================================================
   core/statusIndicator.js - API 接口就绪状态指示灯
   职责：提取自 main.js，消除与 gameController.js 的循环依赖。
   被 main.js 和 gameController.js 共同引用。
   ========================================================================== */

import { gameState } from './state.js';
import { dom } from './dom.js';

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
