/* ==========================================================================
   events.js - 核心配置面板与控制台事件订阅注册中心 (Controller / Events)
   ========================================================================== */

import { dom } from './core/dom.js';
import { gameState } from './core/state.js';
import { PROVIDER_BASE_URLS } from './core/constants.js';
import { updateApiStatusIndicator } from './core/statusIndicator.js';
import { initGame, saveToLocalStorage, loadFromLocalStorage } from './controllers/gameController.js';
import { handleAiAnalysis } from './controllers/aiController.js';
import { updateMyRoleOptions, updateApiModelOptions, setLanguage, useEnOrZh, updateConsoleUI, resetAnalysisBoxes } from './i18n/engine.js';
import { resetChatBox } from './components/chatRenderer.js';
import { showToast } from './utils.js';
import { populateScriptPreview } from './components/scriptPreview.js';
import { TRANSLATIONS } from './data/translations.js';
import { clearGameState, loadApiKey, saveApiKey } from './services/storage.js';
import { renderDeductiveValidator } from './components/deductiveValidator.js';

export function initCoreEvents() {
    bindSetupEvents();
    bindApiEvents();
    bindConsoleEvents();
    bindTabEvents();
}

/**
 * 绑定剧本、人数、阵营等游戏初始化配置事件
 */
function bindSetupEvents() {
    // 1. 剧本更换监听
    if (dom.scriptSelect) {
        dom.scriptSelect.addEventListener("change", () => {
            gameState.scriptName = dom.scriptSelect.value;
            updateMyRoleOptions();
            populateScriptPreview();
            renderDeductiveValidator();
            saveToLocalStorage();
        });
    }

    // 2. 阵营切换监听，如果是邪恶阵营则显示好人伪装配置框
    if (dom.myAlignmentSelect) {
        dom.myAlignmentSelect.addEventListener("change", (e) => {
            if (e.target.value === "evil") {
                if (dom.evilBluffsContainer) dom.evilBluffsContainer.classList.remove("hidden");
            } else {
                if (dom.evilBluffsContainer) dom.evilBluffsContainer.classList.add("hidden");
            }
            saveToLocalStorage();
        });
    }

    // 3. 新对局初始化按钮
    if (dom.initGameBtn) {
        dom.initGameBtn.addEventListener("click", initGame);
    }
    
    // 4. 重置所有玩家
    if (dom.resetPlayersBtn) {
        dom.resetPlayersBtn.addEventListener("click", () => {
            const confirmMsg = TRANSLATIONS[gameState.lang]?.confirmReset || "确定要重置当前对局所有玩家的状态吗？（日志和本地缓存也会被重置）";
            if (confirm(confirmMsg)) {
                clearGameState();
                initGame();
            }
        });
    }

    // 5. 手动恢复上次对局
    if (dom.restoreGameBtn) {
        dom.restoreGameBtn.addEventListener("click", () => {
            if (loadFromLocalStorage()) {
                dom.restoreGameBtn.classList.add("hidden");
                showToast(useEnOrZh("成功手动恢复上次对局！", "Successfully recovered the last game state!"));
            }
        });
    }

    // 6. 语言切换监听
    if (dom.langToggleBtn) {
        dom.langToggleBtn.addEventListener("click", () => {
            const nextLang = gameState.lang === "zh" ? "en" : "zh";
            setLanguage(nextLang);
            const msg = nextLang === "zh" ? "已切换至简体中文" : "Switched to English";
            showToast(msg);
        });
    }
}

/**
 * 绑定 API 厂商、接口 URL、模型切换及 API Key 输入事件
 */
function bindApiEvents() {
    // 1. 厂商协议更换监听
    if (dom.apiProviderSelect) {
        dom.apiProviderSelect.addEventListener("change", (e) => {
            gameState.apiProvider = e.target.value;
            
            // 自动载入该厂商已保存的密钥
            const savedKey = loadApiKey(gameState.apiProvider);
            if (dom.apiKeyInput) dom.apiKeyInput.value = savedKey;
            gameState.apiKey = savedKey;
            
            updateApiModelOptions();
            
            // 自动切换对应的预设 Base URL
            const providerBaseUrl = PROVIDER_BASE_URLS[gameState.apiProvider];
            if (providerBaseUrl) {
                if (dom.apiBaseUrlInput) dom.apiBaseUrlInput.value = providerBaseUrl;
            } else if (gameState.apiProvider === "custom") {
                const currentVal = dom.apiBaseUrlInput ? dom.apiBaseUrlInput.value : "";
                if (!currentVal || /api\.openai|api\.deepseek|dashscope\.aliyuncs|api\.anthropic|bigmodel\.cn|volces\.com|moonshot\.cn|baidu\.com/.test(currentVal)) {
                    if (dom.apiBaseUrlInput) dom.apiBaseUrlInput.value = "http://localhost:11434/v1";
                }
            }
            
            if (dom.apiBaseUrlInput) gameState.apiBaseUrl = dom.apiBaseUrlInput.value;
            if (dom.aiModelSelect) gameState.aiModel = dom.aiModelSelect.value;
            
            updateApiStatusIndicator();
            saveToLocalStorage();
        });
    }

    // 2. 模型选择监听
    if (dom.aiModelSelect) {
        dom.aiModelSelect.addEventListener("change", (e) => {
            const val = e.target.value;
            if (val === "custom") {
                if (dom.apiModelCustomContainer) dom.apiModelCustomContainer.classList.remove("hidden");
                if (dom.apiModelCustomInput) dom.apiModelCustomInput.focus();
                gameState.aiModel = dom.apiModelCustomInput ? dom.apiModelCustomInput.value.trim() : "custom";
            } else {
                if (dom.apiModelCustomContainer) dom.apiModelCustomContainer.classList.add("hidden");
                gameState.aiModel = val;
                
                // 切换模型时，如果是对应的厂商，也做一次智能预设
                const providerBaseUrl = PROVIDER_BASE_URLS[gameState.apiProvider];
                if (providerBaseUrl) {
                    if (dom.apiBaseUrlInput) dom.apiBaseUrlInput.value = providerBaseUrl;
                }
                if (dom.apiBaseUrlInput) gameState.apiBaseUrl = dom.apiBaseUrlInput.value;
            }
            saveToLocalStorage();
        });
    }

    // 3. 自定义模型名称输入监听
    if (dom.apiModelCustomInput) {
        dom.apiModelCustomInput.addEventListener("input", (e) => {
            const val = e.target.value.trim();
            gameState.aiModel = val || "custom";
            gameState.apiModelCustom = val;
            saveToLocalStorage();
        });
    }

    // 4. API 密钥输入自动保存与大盘就绪状态联动
    if (dom.apiKeyInput) {
        dom.apiKeyInput.addEventListener("input", (e) => {
            const key = e.target.value.trim();
            gameState.apiKey = key;
            saveApiKey(gameState.apiProvider, key);
            updateApiStatusIndicator();
        });
    }

    // 5. 接口基地址输入监听
    if (dom.apiBaseUrlInput) {
        dom.apiBaseUrlInput.addEventListener("input", (e) => {
            gameState.apiBaseUrl = e.target.value.trim();
            saveToLocalStorage();
        });
    }
}

/**
 * 绑定控制台输入、语音指南、发送分析及清除草稿事件
 */
function bindConsoleEvents() {
    // 1. 输入框草稿自动保存
    if (dom.consoleInput) {
        dom.consoleInput.addEventListener("input", () => {
            saveToLocalStorage();
        });
    }

    // 2. 控制台清空按钮
    if (dom.clearConsoleBtn) {
        dom.clearConsoleBtn.addEventListener("click", () => {
            if (dom.consoleInput) dom.consoleInput.value = "";
            saveToLocalStorage();
        });
    }

    // 3. 语音输入说明提示
    if (dom.voiceInputBtn) {
        dom.voiceInputBtn.addEventListener("click", () => {
            const voiceHelpMsg = TRANSLATIONS[gameState.lang]?.voiceInputHelp || "语音输入支持：\n你可以使用操作系统自带的语音听写功能（Mac 快捷键：双击 Fn 或按 F5）在输入框内直接输入文字，随后点击发送分析即可！";
            alert(voiceHelpMsg);
        });
    }

    // 4. 发送至 AI 分析
    if (dom.analyzeBtn) {
        dom.analyzeBtn.addEventListener("click", handleAiAnalysis);
    }
}

/**
 * 绑定选项卡切换 Tab 点击事件（并增加 null 判定安全保护）
 */
function bindTabEvents() {
    if (dom.tabButtons) {
        dom.tabButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                dom.tabButtons.forEach(b => b.classList.remove("active"));
                dom.tabContents.forEach(c => c.classList.remove("active"));
                
                btn.classList.add("active");
                const tabId = btn.getAttribute("data-tab");
                const tabContent = document.getElementById(tabId);
                
                if (tabContent) {
                    tabContent.classList.add("active");
                } else {
                    console.warn(`⚠️ [Tab Event] Tab content container with ID '${tabId}' not found in DOM.`);
                }
                
                // 根据当前活跃 Tab 更新控制台 UI
                updateConsoleUI(tabId === "tab-chat");
            });
        });
    }
}

