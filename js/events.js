/* ==========================================================================
   events.js - 核心配置面板与控制台事件订阅注册中心 (Controller / Events)
   ========================================================================== */

import { dom } from './dom.js';
import { gameState, initGame, saveToLocalStorage, loadFromLocalStorage } from './state.js';
import { updateMyRoleOptions, updateApiModelOptions, setLanguage, useEnOrZh, updateConsoleUI } from './i18n.js';
import { showToast } from './utils.js';
import { populateScriptPreview } from './components/scriptPreview.js';
import { handleAiAnalysis } from './api.js';
import { TRANSLATIONS } from './data/translations.js';
import { clearGameState } from './services/storage.js';

export function initCoreEvents() {
    // 1. 剧本更换监听
    dom.scriptSelect.addEventListener("change", () => {
        updateMyRoleOptions();
        populateScriptPreview();
        saveToLocalStorage();
    });
    
    // 2. 厂商协议更换监听
    dom.apiProviderSelect.addEventListener("change", (e) => {
        gameState.apiProvider = e.target.value;
        
        // 切换厂商时，防止不同平台密钥混用或无意泄露
        if (gameState.apiProvider === "gemini") {
            if (dom.apiKeyInput.value.startsWith("sk-") || dom.apiKeyInput.value.startsWith("sk-or-")) {
                dom.apiKeyInput.value = "";
            }
        } else if (gameState.apiProvider === "chatgpt" || gameState.apiProvider === "deepseek" || gameState.apiProvider === "qwen" || gameState.apiProvider === "claude") {
            if (dom.apiKeyInput.value.startsWith("AIzaSy")) {
                dom.apiKeyInput.value = "";
            }
        }
        
        updateApiModelOptions();
        
        // 自动切换对应的预设 Base URL
        if (gameState.apiProvider === "chatgpt") {
            dom.apiBaseUrlInput.value = "https://api.openai.com/v1";
        } else if (gameState.apiProvider === "claude") {
            dom.apiBaseUrlInput.value = "https://api.anthropic.com/v1";
        } else if (gameState.apiProvider === "deepseek") {
            dom.apiBaseUrlInput.value = "https://api.deepseek.com/v1";
        } else if (gameState.apiProvider === "qwen") {
            dom.apiBaseUrlInput.value = "https://dashscope.aliyuncs.com/compatible-mode/v1";
        } else if (gameState.apiProvider === "zhipu") {
            dom.apiBaseUrlInput.value = "https://open.bigmodel.cn/api/paas/v4/";
        } else if (gameState.apiProvider === "doubao") {
            dom.apiBaseUrlInput.value = "https://ark.cn-beijing.volces.com/api/v3";
        } else if (gameState.apiProvider === "kimi") {
            dom.apiBaseUrlInput.value = "https://api.moonshot.cn/v1";
        } else if (gameState.apiProvider === "baidu") {
            dom.apiBaseUrlInput.value = "https://aistudio.baidu.com/llm/lmapi/v3";
        } else if (gameState.apiProvider === "custom") {
            if (!dom.apiBaseUrlInput.value || dom.apiBaseUrlInput.value.includes("api.openai.com") || dom.apiBaseUrlInput.value.includes("api.deepseek.com") || dom.apiBaseUrlInput.value.includes("dashscope.aliyuncs.com") || dom.apiBaseUrlInput.value.includes("api.anthropic.com") || dom.apiBaseUrlInput.value.includes("bigmodel.cn") || dom.apiBaseUrlInput.value.includes("volces.com") || dom.apiBaseUrlInput.value.includes("moonshot.cn") || dom.apiBaseUrlInput.value.includes("baidu.com")) {
                dom.apiBaseUrlInput.value = "http://localhost:11434/v1";
            }
        }
        
        gameState.apiBaseUrl = dom.apiBaseUrlInput.value;
        gameState.aiModel = dom.aiModelSelect.value;
        
        saveToLocalStorage();
    });

    // 3. 模型选择监听
    dom.aiModelSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val === "custom") {
            dom.apiModelCustomContainer.classList.remove("hidden");
            dom.apiModelCustomInput.focus();
            gameState.aiModel = dom.apiModelCustomInput.value.trim() || "custom";
        } else {
            dom.apiModelCustomContainer.classList.add("hidden");
            gameState.aiModel = val;
            
            // 切换模型时，如果是对应的厂商，也做一次智能预设
            if (gameState.apiProvider === "chatgpt") {
                dom.apiBaseUrlInput.value = "https://api.openai.com/v1";
            } else if (gameState.apiProvider === "claude") {
                dom.apiBaseUrlInput.value = "https://api.anthropic.com/v1";
            } else if (gameState.apiProvider === "deepseek") {
                dom.apiBaseUrlInput.value = "https://api.deepseek.com/v1";
            } else if (gameState.apiProvider === "qwen") {
                dom.apiBaseUrlInput.value = "https://dashscope.aliyuncs.com/compatible-mode/v1";
            } else if (gameState.apiProvider === "zhipu") {
                dom.apiBaseUrlInput.value = "https://open.bigmodel.cn/api/paas/v4/";
            } else if (gameState.apiProvider === "doubao") {
                dom.apiBaseUrlInput.value = "https://ark.cn-beijing.volces.com/api/v3";
            } else if (gameState.apiProvider === "kimi") {
                dom.apiBaseUrlInput.value = "https://api.moonshot.cn/v1";
            } else if (gameState.apiProvider === "baidu") {
                dom.apiBaseUrlInput.value = "https://aistudio.baidu.com/llm/lmapi/v3";
            }
            gameState.apiBaseUrl = dom.apiBaseUrlInput.value;
        }
        saveToLocalStorage();
    });

    // 4. 自定义模型名称输入监听
    dom.apiModelCustomInput.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        gameState.aiModel = val || "custom";
        gameState.apiModelCustom = val;
        saveToLocalStorage();
    });

    // 5. 接口基地址输入监听
    dom.apiBaseUrlInput.addEventListener("input", (e) => {
        gameState.apiBaseUrl = e.target.value.trim();
        saveToLocalStorage();
    });

    // 6. 输入框草稿自动保存
    dom.consoleInput.addEventListener("input", () => {
        saveToLocalStorage();
    });
    
    // 7. 阵营切换监听，如果是邪恶阵营则显示好人伪装配置框
    dom.myAlignmentSelect.addEventListener("change", (e) => {
        if (e.target.value === "evil") {
            dom.evilBluffsContainer.classList.remove("hidden");
        } else {
            dom.evilBluffsContainer.classList.add("hidden");
        }
        saveToLocalStorage();
    });

    // 8. 新对局初始化
    dom.initGameBtn.addEventListener("click", initGame);
    
    // 9. 重置所有玩家
    dom.resetPlayersBtn.addEventListener("click", () => {
        const confirmMsg = TRANSLATIONS[gameState.lang]?.confirmReset || "确定要重置当前对局所有玩家的状态吗？（日志和本地缓存也会被重置）";
        if (confirm(confirmMsg)) {
            clearGameState();
            initGame();
        }
    });

    // 10. 控制台清空按钮
    dom.clearConsoleBtn.addEventListener("click", () => {
        dom.consoleInput.value = "";
        saveToLocalStorage();
    });

    // 11. 选项卡切换
    dom.tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            dom.tabButtons.forEach(b => b.classList.remove("active"));
            dom.tabContents.forEach(c => c.classList.remove("active"));
            
            btn.classList.add("active");
            const tabId = btn.getAttribute("data-tab");
            document.getElementById(tabId).classList.add("active");
        });
    });

    // 12. 语音输入说明提示
    dom.voiceInputBtn.addEventListener("click", () => {
        const voiceHelpMsg = TRANSLATIONS[gameState.lang]?.voiceInputHelp || "语音输入支持：\n你可以使用操作系统自带的语音听写功能（Mac 快捷键：双击 Fn 或按 F5）在输入框内直接输入文字，随后点击发送分析即可！";
        alert(voiceHelpMsg);
    });

    // 13. 手动恢复上次对局
    dom.restoreGameBtn.addEventListener("click", () => {
        if (loadFromLocalStorage()) {
            dom.restoreGameBtn.classList.add("hidden");
            showToast(useEnOrZh("成功手动恢复上次对局！", "Successfully recovered the last game state!"));
        }
    });

    // 14. 发送至 AI 分析
    dom.analyzeBtn.addEventListener("click", handleAiAnalysis);

    // 15. 语言切换监听
    if (dom.langToggleBtn) {
        dom.langToggleBtn.addEventListener("click", () => {
            const nextLang = gameState.lang === "zh" ? "en" : "zh";
            setLanguage(nextLang);
            const msg = nextLang === "zh" ? "已切换至简体中文" : "Switched to English";
            showToast(msg);
        });
    }

    // 16. AI 对话模式切换监听
    if (dom.aiChatModeToggle) {
        dom.aiChatModeToggle.addEventListener("change", () => {
            updateConsoleUI();
            saveToLocalStorage();
            if (dom.aiChatModeToggle.checked) {
                // Auto switch to the "Instant Analysis" tab (where Chat is rendered) for premium interactive flow
                const analysisTabBtn = document.querySelector('.tab-btn[data-tab="tab-analysis"]');
                if (analysisTabBtn) {
                    analysisTabBtn.click();
                }
            }
        });
    }
}
