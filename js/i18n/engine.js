/* ==========================================================================
   i18n/engine.js - 核心 i18n 引擎 (Core Localization Engine)
   职责：语言切换、DOM 翻译、下拉框翻译、分析框重置、控制台 UI 更新
   ========================================================================== */

import { gameState } from '../core/state.js';
import { dom } from '../core/dom.js';
import {
    ROLE_TRANSLATIONS,
    TRANSLATIONS
} from '../data/translations.js';
import { renderSeatingChart } from '../components/seatingChart.js';
import { renderPlayerList } from '../components/playerList.js';
import { renderTimelineLogs } from '../components/timelineLogs.js';
import { renderDeductiveValidator } from '../components/deductiveValidator.js';
import { populateScriptPreview } from '../components/scriptPreview.js';
import { saveLanguage } from '../services/storage.js';
import { translateDropdowns, updateMyRoleOptions, updateApiModelOptions } from './optionProviders.js';
import { saveToLocalStorage } from '../controllers/gameController.js';

export { updateMyRoleOptions, updateApiModelOptions };

export function getLocalizedRole(roleName) {
    if (gameState.lang === "en") {
        return ROLE_TRANSLATIONS[roleName] || roleName;
    }
    return roleName;
}

export function getLocalizedClaim(claim) {
    if (claim === "未知") {
        return gameState.lang === "en" ? "Unknown" : "未知";
    }
    return getLocalizedRole(claim);
}

export function useEnOrZh(zh, en) {
    return gameState.lang === "en" ? en : zh;
}

export function setLanguage(lang) {
    gameState.lang = lang;
    saveLanguage(lang);
    
    if (dom.langToggleText) {
        dom.langToggleText.textContent = lang === "zh" ? "English" : "简体中文";
    }
    
    translateDropdowns(lang);
    
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.textContent = TRANSLATIONS[lang][key];
        }
    });
    
    const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
    placeholders.forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.placeholder = TRANSLATIONS[lang][key];
        }
    });
    
    const titles = document.querySelectorAll("[data-i18n-title]");
    titles.forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.title = TRANSLATIONS[lang][key];
        }
    });
    
    updateMyRoleOptions();
    
    if (gameState.players && gameState.players.length > 0) {
        gameState.players.forEach(p => {
            const isMe = (p.seat === gameState.mySeat);
            if (isMe) {
                p.name = lang === "en" ? "Me" : "我";
            } else if (p.name === "我" || p.name === "Me") {
                p.name = lang === "en" ? "Me" : "我";
            } else if (p.name.startsWith("玩家") || p.name.startsWith("Player")) {
                p.name = lang === "en" ? `Player ${p.seat}` : `玩家 ${p.seat}`;
            }
        });
        
        renderPlayerList();
        renderSeatingChart();
        renderTimelineLogs();
        renderDeductiveValidator();
    }
    else {
        renderDeductiveValidator();
    }
    
    populateScriptPreview();
    updateApiModelOptions();
    
    if (dom.analysisBox && dom.analysisBox.querySelector(".ai-welcome")) {
        resetAnalysisBoxes();
    }
    
    updateConsoleUI();
    saveToLocalStorage();
}

export function resetAnalysisBoxes() {
    const isEn = gameState.lang === "en";
    
    const welcomeTitle = isEn ? "Hello, Clocktower Explorer" : "你好，钟楼探索者";
    const welcomeDesc = isEn 
        ? "Game successfully initialized! Please enter the first round of night or day updates in the console on the right, and I will analyze the match for you using our logical solver and parallel world algorithms."
        : "对局已成功初始化！请在右侧控制台输入第一轮夜晚或白天的信息，我将通过逻辑求解器与平行世界算法为您演算战局。";
        
    const worldlinesDesc = isEn
        ? "Waiting for data. Later, this section will calculate the logic probabilities of <b>Normal Worldline</b>, <b>Vortox Worldline</b>, and <b>Drunk/Poisoned Worldline</b>."
        : "等待局势录入中。稍后这里会推演 <b>正常世界线</b>、<b>涡流世界线</b> 以及 <b>中毒世界线</b> 的逻辑概率。";
        
    const tipsDesc = isEn
        ? "Waiting for data. Later, this section will generate recommended players to chat with and emergency warnings."
        : "等待局势录入中。稍后将为你生成本轮最推荐私聊的玩家以及防死警告。";

    dom.analysisBox.innerHTML = `
        <div class="ai-welcome">
            <i data-lucide="bot" class="welcome-icon"></i>
            <h3>${welcomeTitle}</h3>
            <p>${welcomeDesc}</p>
        </div>
    `;
    dom.worldlinesBox.innerHTML = `
        <div class="empty-tab-state">
            <p>${worldlinesDesc}</p>
        </div>
    `;
    dom.tipsBox.innerHTML = `
        <div class="empty-tab-state">
            <p>${tipsDesc}</p>
        </div>
    `;
    if (typeof lucide !== "undefined" && lucide.createIcons) lucide.createIcons();
}

export function updateConsoleUI() {
    if (!dom.aiChatModeToggle) return;
    const isChat = dom.aiChatModeToggle.checked;
    const lang = gameState.lang;
    
    if (isChat) {
        if (dom.consoleInputLabel) {
            dom.consoleInputLabel.textContent = lang === "zh" 
                ? TRANSLATIONS.zh.consoleInputLabelChat 
                : TRANSLATIONS.en.consoleInputLabelChat;
            dom.consoleInputLabel.setAttribute("data-i18n", "consoleInputLabelChat");
        }
        
        if (dom.consoleInput) {
            dom.consoleInput.placeholder = lang === "zh" 
                ? TRANSLATIONS.zh.consoleInputPlaceholderChat 
                : TRANSLATIONS.en.consoleInputPlaceholderChat;
            dom.consoleInput.setAttribute("data-i18n-placeholder", "consoleInputPlaceholderChat");
        }
        
        if (dom.analyzeBtn) {
            const btnText = lang === "zh" ? TRANSLATIONS.zh.analyzeBtnChat : TRANSLATIONS.en.analyzeBtnChat;
            dom.analyzeBtn.innerHTML = `<i data-lucide="message-square"></i> <span>${btnText}</span>`;
        }
    } else {
        if (dom.consoleInputLabel) {
            dom.consoleInputLabel.textContent = lang === "zh" 
                ? TRANSLATIONS.zh.consoleInputLabel 
                : TRANSLATIONS.en.consoleInputLabel;
            dom.consoleInputLabel.setAttribute("data-i18n", "consoleInputLabel");
        }
        
        if (dom.consoleInput) {
            dom.consoleInput.placeholder = lang === "zh" 
                ? TRANSLATIONS.zh.consoleInputPlaceholder 
                : TRANSLATIONS.en.consoleInputPlaceholder;
            dom.consoleInput.setAttribute("data-i18n-placeholder", "consoleInputPlaceholder");
        }
        
        if (dom.analyzeBtn) {
            const btnText = lang === "zh" ? TRANSLATIONS.zh.analyzeBtn : TRANSLATIONS.en.analyzeBtn;
            dom.analyzeBtn.innerHTML = `<i data-lucide="wand-2"></i> <span>${btnText}</span>`;
        }
    }
    
    if (typeof lucide !== "undefined" && lucide.createIcons) {
        lucide.createIcons();
    }
}
