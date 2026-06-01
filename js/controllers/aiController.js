/* ==========================================================================
   aiController.js - AI 分析流程编排器 (AI Orchestrator)
   职责：编排完整 AI 分析流程：NLP → Prompt → API → 响应分发
   ========================================================================== */

import { gameState } from '../core/state.js';
import { dom } from '../core/dom.js';
import { MODEL_FRIENDLY_NAMES } from '../core/constants.js';
import { TRANSLATIONS } from '../data/translations.js';
import { escapeHtml } from '../utils.js';
import { renderTimelineLogs } from '../components/timelineLogs.js';
import { resetAnalysisBoxes } from '../i18n/engine.js';
import { constructPrompt } from '../services/api/promptBuilder.js';
import { callAI } from '../services/api/gateway.js';
import { distributeResponse, extractAndApplyStateSync } from '../services/api/responseParser.js';
import { saveToLocalStorage, notifyStateChange } from './gameController.js';
import { appendChatMessage, showChatTyping, hideChatTyping } from '../components/chatRenderer.js';

export async function handleAiAnalysis() {
    console.log("🚨 [DEBUG] === handleAiAnalysis() 开始执行 ===");
    const rawText = dom.consoleInput.value.trim();
    // v3.0: 根据活跃 Tab 判断聊天模式（第4个Tab "tab-chat" = 对话模式）
    const activeTab = document.querySelector('.tab-btn.active');
    const isChatMode = activeTab ? activeTab.getAttribute('data-tab') === 'tab-chat' : false;
    const apiKey = dom.apiKeyInput.value.trim() || gameState.apiKey;
    const provider = gameState.apiProvider || "gemini";
    const baseUrl = gameState.apiBaseUrl || "https://api.openai.com/v1";
    let model = gameState.aiModel || "gemini-flash-latest";

    console.log("🚨 [DEBUG] 采集到的基本参数：", {
        rawText,
        apiKeyExists: !!apiKey,
        apiKeyStart: apiKey ? apiKey.substring(0, 6) : "None",
        provider,
        baseUrl,
        model
    });

    if (model === "gemini-flash-lastest") {
        model = "gemini-flash-latest";
    }

    if (!navigator.onLine) {
        console.log("🚨 [DEBUG] 检测到处于离线状态！数据暂存。");
        if (rawText) {
            const tempLog = gameState.lang === "en" ? `Day progress updates (cached): "${rawText}"` : `白天进展陈述(暂存)："${rawText}"`;
            gameState.logs.push(tempLog);
            renderTimelineLogs();
            dom.consoleInput.value = "";
        }
        saveToLocalStorage();
        const offlineAlertMsg = TRANSLATIONS[gameState.lang]?.offlineAlert || "检测到您目前处于离线状态！已为您将当前白天局势安全保存在本地。等您重新连接网络后，直接点击【发送给AI分析局势】即可恢复网络并发送线上演练。";
        alert(offlineAlertMsg);
        resetAnalysisBoxes();
        return;
    }

    const isLocalhost = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
    console.log("🚨 [DEBUG] 本地服务器判定 isLocalhost =", isLocalhost);
    
    if (!apiKey && !isLocalhost) {
        console.log("🚨 [DEBUG] 缺失 API Key，拦截。");
        const missingKeyMsg = TRANSLATIONS[gameState.lang]?.apiKeyMissingAlert || "请输入有效的 API Key 以启用分析！";
        alert(missingKeyMsg);
        const apiKeyDetails = document.getElementById("apiKeyDetails");
        if (apiKeyDetails) apiKeyDetails.open = true;
        dom.apiKeyInput.focus();
        return;
    }

    // v2.0: 立即清空输入框（UX），但日志写入和saveToLocalStorage延迟到API调用成功后
    if (rawText) {
        dom.consoleInput.value = "";
    }

    const friendlyModelName = MODEL_FRIENDLY_NAMES[model] || model;

    console.log("🚨 [DEBUG] 正在注入流光进度条与悬浮状态指示器...");
    
    document.querySelectorAll(".ai-loading-overlay, .ai-progress-bar, .ai-floating-status-badge").forEach(el => el.remove());
    
    const progressBarHtml = `
        <div class="ai-progress-bar">
            <div class="ai-progress-bar-fill"></div>
        </div>
    `;
    
    const floatingBadgeHtml = `
        <div class="ai-floating-status-badge">
            <div class="spinner-glow-mini"></div>
            <span>${friendlyModelName} 正在推演局势...</span>
        </div>
    `;
    
    const tabContainer = document.querySelector(".tab-content-container");
    if (tabContainer) {
        tabContainer.insertAdjacentHTML("afterbegin", progressBarHtml);
        tabContainer.insertAdjacentHTML("beforeend", floatingBadgeHtml);
    }

    console.log("🚨 [DEBUG] 正在构建 AI 提示词...");
    const prompt = constructPrompt(rawText, isChatMode);
    console.log("🚨 [DEBUG] 提示词构建完毕，长度为:", prompt.length);

    // v3.0: 聊天模式下显示打字指示器
    if (isChatMode) {
        showChatTyping();
    }

    try {
        console.log("🚨 [DEBUG] 进入 API 请求 try 块...");
        dom.apiStatusIndicator.className = "status-indicator online animate-pulse";
        dom.apiStatusText.textContent = `正在调用 ${friendlyModelName}...`;

        const { reply, thoughtHtml } = await callAI(prompt, {
            provider,
            apiKey,
            baseUrl,
            model,
            apiModelCustom: gameState.apiModelCustom
        });
        
        // v2.0: API 调用成功后才写入日志和持久化
        if (rawText && !isChatMode) {
            gameState.logs.push(`白天进展陈述："${rawText}"`);
            renderTimelineLogs();
        }
        
        // v3.0: 聊天模式下隐藏打字指示器
        if (isChatMode) {
            hideChatTyping();
        }
        
        // AI-driven state sync: extract structured events from AI response
        const { cleanText, hasChanges } = extractAndApplyStateSync(reply);
        
        distributeResponse(cleanText, thoughtHtml);

        document.querySelectorAll(".ai-loading-overlay, .ai-progress-bar, .ai-floating-status-badge").forEach(el => el.remove());

        if (!gameState.aiOutputs) {
            gameState.aiOutputs = [];
        }

        if (isChatMode) {
            // v3.0: 聊天模式 → 存入 chatMessages 并渲染气泡
            if (!gameState.chatMessages) {
                gameState.chatMessages = [];
            }
            // 存储用户消息
            gameState.chatMessages.push({
                role: 'user',
                content: rawText,
                timestamp: Date.now()
            });
            // 存储 AI 回复
            gameState.chatMessages.push({
                role: 'assistant',
                content: reply,
                timestamp: Date.now()
            });
            // 渲染气泡（如果当前在聊天 Tab）
            if (dom.chatBox) {
                // 追加最后两条消息
                const msgs = gameState.chatMessages;
                appendChatMessage(msgs[msgs.length - 2]); // user
                appendChatMessage(msgs[msgs.length - 1]); // assistant
            }
        } else {
            // 分析模式 → 存入 aiOutputs
            gameState.aiOutputs.push({
                type: "analysis",
                input: rawText,
                output: reply,
                timestamp: Date.now()
            });
        }

        if (hasChanges) {
            notifyStateChange();
        }

        dom.apiStatusIndicator.className = "status-indicator online";
        dom.apiStatusText.textContent = `${friendlyModelName} 已就绪`;

        saveToLocalStorage();

    } catch (error) {
        console.error("AI 分析时出错:", error);
        
        // v3.0: 聊天模式出错时也要隐藏打字指示器
        hideChatTyping();
        document.querySelectorAll(".ai-loading-overlay, .ai-progress-bar, .ai-floating-status-badge").forEach(el => el.remove());
        
        dom.apiStatusIndicator.className = "status-indicator error";
        dom.apiStatusText.textContent = "API 调用失败";

        alert("🚨 AI 调试错误提示：\n" + error.message + "\n\n请检查网络、API Key 格式及接口地址是否正确。");

        const errorHtml = `
            <div class="ai-welcome" style="color: var(--color-evil);">
                <i data-lucide="alert-triangle" style="width: 32px; height: 32px; color: var(--color-evil);"></i>
                <h3>API 调用发生错误</h3>
                <p>${escapeHtml(error.message)}</p>
                <p style="font-size: 11px; color: var(--text-muted);">提示：请检查网络连接、API 密钥以及接口基地址 (Base URL) 是否正确。</p>
            </div>
        `;
        
        if (isChatMode && dom.chatBox) {
            dom.chatBox.innerHTML = errorHtml + dom.chatBox.innerHTML;
        } else {
            dom.analysisBox.innerHTML = errorHtml;
            dom.worldlinesBox.innerHTML = errorHtml;
            dom.tipsBox.innerHTML = errorHtml;
        }
        if (typeof lucide !== "undefined" && lucide.createIcons) lucide.createIcons();
    }
}
