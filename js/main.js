/* ==========================================================================
   main.js - 应用程序启动入口、全局事件代理及生命周期监听器
   ========================================================================== */

import {
    SCRIPTS_DATA,
    SCRIPTS_DATA_EN,
    ROLE_TRANSLATIONS,
    TRANSLATIONS
} from './constants.js';

import {
    gameState,
    saveToLocalStorage,
    checkSavedGame,
    loadFromLocalStorage
} from './state.js';

import { dom } from './dom.js';
import { updateMyRoleOptions, updateApiModelOptions, resetAnalysisBoxes, setLanguage, useEnOrZh } from './i18n.js';
import { showToast } from './utils.js';
import { populateScriptPreview } from './components/scriptPreview.js';
import { renderSeatingChart } from './components/seatingChart.js';
import { renderPlayerList } from './components/playerList.js';
import { renderTimelineLogs } from './components/timelineLogs.js';
import { closePopover, savePopoverData } from './components/popoverModal.js';

import { handleAiAnalysis } from './api.js';

// Global error handler to catch unexpected issues
window.onerror = function (message, source, lineno, colno, error) {
    alert("🚨 发现未捕获的运行时错误！\n\n错误信息: " + message + "\n出错文件: " + source + "\n出错行号: " + lineno + "\n出错列号: " + colno);
    return false;
};

// --- 初始化游戏核心逻辑 ---
export function initGame() {
    gameState.apiKey = dom.apiKeyInput.value.trim() || gameState.apiKey;
    gameState.playerCount = parseInt(dom.playerCountSelect.value);
    gameState.scriptName = dom.scriptSelect.value;
    gameState.mySeat = parseInt(dom.mySeatInput.value);
    gameState.myRole = dom.myRoleSelect.value;
    gameState.myAlignment = dom.myAlignmentSelect.value;
    gameState.apiProvider = dom.apiProviderSelect.value;
    gameState.apiBaseUrl = dom.apiBaseUrlInput.value.trim();
    gameState.aiModel = dom.aiModelSelect.value;
    gameState.apiModelCustom = dom.apiModelCustomInput.value.trim();
    
    // 获取邪恶伪装身份
    gameState.evilBluffs = [
        dom.evilBluff1.value,
        dom.evilBluff2.value,
        dom.evilBluff3.value
    ].filter(b => b !== "");

    // 创建玩家数组
    gameState.players = [];
    for (let i = 1; i <= gameState.playerCount; i++) {
        const isMe = (i === gameState.mySeat);
        gameState.players.push({
            seat: i,
            name: isMe ? (gameState.lang === "en" ? "Me" : "我") : (gameState.lang === "en" ? `Player ${i}` : `玩家 ${i}`),
            alive: true,
            claim: isMe ? gameState.myRole : "未知",
            alignment: isMe ? gameState.myAlignment : "unknown",
            poisoned: false,
            note: isMe ? "这是我的底牌角色" : ""
        });
    }

    // 重置日志流水志
    if (gameState.lang === "en") {
        const scriptNameEn = SCRIPTS_DATA_EN[gameState.scriptName]?.name || gameState.scriptName;
        const myRoleEn = ROLE_TRANSLATIONS[gameState.myRole] || gameState.myRole;
        const myAlignEn = gameState.myAlignment === "good" ? "Good Team" : "Evil Team";
        gameState.logs = [
            `Game initialized: ${gameState.playerCount}-player game, Script: "${scriptNameEn}".`,
            `My seat is <strong>Seat ${gameState.mySeat}</strong>, Role: <strong>${myRoleEn}</strong> (${myAlignEn}).`
        ];
        if (gameState.myAlignment === "evil") {
            const bluffsText = gameState.evilBluffs.length > 0 ? gameState.evilBluffs.map(b => ROLE_TRANSLATIONS[b] || b).join(', ') : "None declared";
            gameState.logs.push(`3 Demon Bluffs given by Storyteller: <strong>${bluffsText}</strong>.`);
        }
    } else {
        gameState.logs = [
            `对局初始化：${gameState.playerCount} 人本，板子《${SCRIPTS_DATA[gameState.scriptName].name}》。`,
            `我的位置是 <strong>${gameState.mySeat} 号</strong>，角色是 <strong>${gameState.myRole}</strong> (${gameState.myAlignment === "good" ? "善良阵营" : "邪恶阵营"})。`
        ];
        if (gameState.myAlignment === "evil") {
            const bluffsText = gameState.evilBluffs.length > 0 ? gameState.evilBluffs.join('、') : "未填报";
            gameState.logs.push(`说书人给的 3 个好人伪装身份：<strong>${bluffsText}</strong>。`);
        }
    }

    // 更新界面
    renderSeatingChart();
    renderPlayerList();
    renderTimelineLogs();

    // 重置分析框
    resetAnalysisBoxes();

    // 初始化完成后自动折叠配置面板，腾出空间给玩家列表
    const initGameDetails = document.getElementById("initGameDetails");
    if (initGameDetails) {
        initGameDetails.open = false;
    }

    // 保存状态到本地
    saveToLocalStorage();
}

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

// --- 事件监听器绑定 ---
export function registerEventListeners() {
    // 剧本更换监听
    dom.scriptSelect.addEventListener("change", () => {
        updateMyRoleOptions();
        populateScriptPreview();
        saveToLocalStorage();
    });
    
    // 厂商协议更换监听
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

    // 模型选择监听
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

    // 自定义模型名称输入监听
    dom.apiModelCustomInput.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        gameState.aiModel = val || "custom";
        gameState.apiModelCustom = val;
        saveToLocalStorage();
    });

    // 接口基地址输入监听
    dom.apiBaseUrlInput.addEventListener("input", (e) => {
        gameState.apiBaseUrl = e.target.value.trim();
        saveToLocalStorage();
    });

    // 输入框草稿自动保存
    dom.consoleInput.addEventListener("input", () => {
        saveToLocalStorage();
    });
    
    // 阵营切换监听，如果是邪恶阵营则显示好人伪装配置框
    dom.myAlignmentSelect.addEventListener("change", (e) => {
        if (e.target.value === "evil") {
            dom.evilBluffsContainer.classList.remove("hidden");
        } else {
            dom.evilBluffsContainer.classList.add("hidden");
        }
        saveToLocalStorage();
    });

    // 新对局初始化
    dom.initGameBtn.addEventListener("click", initGame);
    
    // 重置所有玩家
    dom.resetPlayersBtn.addEventListener("click", () => {
        const confirmMsg = TRANSLATIONS[gameState.lang]?.confirmReset || "确定要重置当前对局所有玩家的状态吗？（日志和本地缓存也会被重置）";
        if (confirm(confirmMsg)) {
            localStorage.removeItem("botc_game_state");
            initGame();
        }
    });

    // 弹出窗口控制
    dom.closePopoverBtn.addEventListener("click", closePopover);
    dom.savePopoverBtn.addEventListener("click", savePopoverData);

    // 剧本角色对照表预览窗口控制
    if (dom.previewScriptBtn && dom.scriptPreviewModal) {
        dom.previewScriptBtn.addEventListener("click", () => {
            dom.scriptPreviewModal.classList.remove("hidden");
        });
    }
    if (dom.closeScriptPreviewBtn && dom.scriptPreviewModal) {
        dom.closeScriptPreviewBtn.addEventListener("click", () => {
            dom.scriptPreviewModal.classList.add("hidden");
        });
    }

    // 控制台按钮控制
    dom.clearConsoleBtn.addEventListener("click", () => {
        dom.consoleInput.value = "";
        saveToLocalStorage();
    });

    // 选项卡切换
    dom.tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            dom.tabButtons.forEach(b => b.classList.remove("active"));
            dom.tabContents.forEach(c => c.classList.remove("active"));
            
            btn.classList.add("active");
            const tabId = btn.getAttribute("data-tab");
            document.getElementById(tabId).classList.add("active");
        });
    });

    // 语音输入说明提示
    dom.voiceInputBtn.addEventListener("click", () => {
        const voiceHelpMsg = TRANSLATIONS[gameState.lang]?.voiceInputHelp || "语音输入支持：\n你可以使用操作系统自带的语音听写功能（Mac 快捷键：双击 Fn 或按 F5）在输入框内直接输入文字，随后点击发送分析即可！";
        alert(voiceHelpMsg);
    });

    // 手动恢复上次对局
    dom.restoreGameBtn.addEventListener("click", () => {
        if (loadFromLocalStorage()) {
            dom.restoreGameBtn.classList.add("hidden");
            showToast(useEnOrZh("成功手动恢复上次对局！", "Successfully recovered the last game state!"));
        }
    });

    // 发送至 AI 分析
    dom.analyzeBtn.addEventListener("click", handleAiAnalysis);

    // 语言切换监听
    if (dom.langToggleBtn) {
        dom.langToggleBtn.addEventListener("click", () => {
            const nextLang = gameState.lang === "zh" ? "en" : "zh";
            setLanguage(nextLang);
            const msg = nextLang === "zh" ? "已切换至简体中文" : "Switched to English";
            showToast(msg);
        });
    }
}

// --- 初始化程序入口 ---
document.addEventListener("DOMContentLoaded", () => {
    // 渲染图标
    lucide.createIcons();
    
    // 初始化板子角色下拉框
    updateMyRoleOptions();
    
    // 初始化 AI 模型配置下拉框
    updateApiModelOptions();
    
    // 渲染并填充剧本板子角色对照表
    populateScriptPreview();
    
    // 监测网络连接状态
    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // 检查是否有未完成的缓存对局并自动加载，避免覆盖
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
    
    // 载入保存的语言选择，默认中文
    const savedLang = localStorage.getItem("botc_lang") || "zh";
    setLanguage(savedLang);
    
    // 注册事件监听器
    registerEventListeners();
});
