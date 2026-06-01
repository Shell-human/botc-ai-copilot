/* ==========================================================================
   gameController.js - 游戏生命周期控制器 (Game Lifecycle Controller)
   职责：游戏初始化、存档加载、玩家操作、视图同步
   ========================================================================== */

import { gameState } from '../core/state.js';
import { dom } from '../core/dom.js';
import { renderSeatingChart } from '../components/seatingChart.js';
import { renderPlayerList } from '../components/playerList.js';
import { renderTimelineLogs } from '../components/timelineLogs.js';
import { renderDeductiveValidator } from '../components/deductiveValidator.js';
import { SCRIPTS_DATA, SCRIPTS_DATA_EN } from '../data/rules.js';
import { ROLE_TRANSLATIONS } from '../data/translations.js';
import { saveGameState, loadGameState, hasSavedGame, loadApiKey } from '../services/storage.js';
import { setLanguage, updateMyRoleOptions, updateApiModelOptions, resetAnalysisBoxes } from '../i18n/engine.js';
import { updateApiStatusIndicator } from '../core/statusIndicator.js';

// --- 对局本地自动持久化存储代理 ---
export function saveToLocalStorage() {
    saveGameState({
        playerCount: gameState.playerCount,
        scriptName: gameState.scriptName,
        mySeat: gameState.mySeat,
        myRole: gameState.myRole,
        myAlignment: gameState.myAlignment,
        evilBluffs: gameState.evilBluffs,
        apiProvider: gameState.apiProvider,
        apiBaseUrl: gameState.apiBaseUrl,
        aiModel: gameState.aiModel,
        apiModelCustom: gameState.apiModelCustom,
        players: gameState.players,
        logs: gameState.logs,
        aiOutputs: gameState.aiOutputs || [],
        chatMessages: gameState.chatMessages || [],
        consoleInputDraft: dom.consoleInput ? dom.consoleInput.value : "",
        analysisBoxHtml: dom.analysisBox ? dom.analysisBox.innerHTML : "",
        worldlinesBoxHtml: dom.worldlinesBox ? dom.worldlinesBox.innerHTML : "",
        tipsBoxHtml: dom.tipsBox ? dom.tipsBox.innerHTML : "",
        chatBoxHtml: dom.chatBox ? dom.chatBox.innerHTML : "",
        lang: gameState.lang
    });
}

export function checkSavedGame() {
    if (hasSavedGame() && dom.restoreGameBtn) {
        dom.restoreGameBtn.classList.remove("hidden");
        return true;
    }
    return false;
}

export function loadFromLocalStorage() {
    const data = loadGameState();
    if (!data) return false;
    try {
        gameState.playerCount = data.playerCount;
        gameState.scriptName = data.scriptName;
        gameState.mySeat = data.mySeat;
        gameState.myRole = data.myRole;
        gameState.myAlignment = data.myAlignment;
        gameState.evilBluffs = data.evilBluffs || [];
        gameState.apiProvider = data.apiProvider || "gemini";
        gameState.apiBaseUrl = data.apiBaseUrl || "https://api.openai.com/v1";
        gameState.aiModel = data.aiModel || "gemini-flash-latest";
        gameState.apiModelCustom = data.apiModelCustom || "";
        gameState.players = data.players;
        gameState.logs = data.logs;
        gameState.aiOutputs = data.aiOutputs || [];
        gameState.chatMessages = data.chatMessages || [];
        gameState.lang = data.lang || "zh";

        setLanguage(gameState.lang);

        dom.playerCountSelect.value = gameState.playerCount;
        dom.scriptSelect.value = gameState.scriptName;
        dom.mySeatInput.value = gameState.mySeat;
        dom.myRoleSelect.value = gameState.myRole;
        dom.myAlignmentSelect.value = gameState.myAlignment;
        dom.apiProviderSelect.value = gameState.apiProvider;
        dom.apiBaseUrlInput.value = gameState.apiBaseUrl;

        const savedKey = loadApiKey(gameState.apiProvider);
        dom.apiKeyInput.value = savedKey;
        gameState.apiKey = savedKey;

        updateMyRoleOptions();
        updateApiModelOptions();

        updateApiStatusIndicator();

        if (gameState.myAlignment === "evil") {
            dom.evilBluffsContainer.classList.remove("hidden");
            if (gameState.evilBluffs[0]) dom.evilBluff1.value = gameState.evilBluffs[0];
            if (gameState.evilBluffs[1]) dom.evilBluff2.value = gameState.evilBluffs[1];
            if (gameState.evilBluffs[2]) dom.evilBluff3.value = gameState.evilBluffs[2];
        } else {
            dom.evilBluffsContainer.classList.add("hidden");
        }

        if (dom.consoleInput && data.consoleInputDraft) {
            dom.consoleInput.value = data.consoleInputDraft;
        }
        if (dom.analysisBox && data.analysisBoxHtml && data.analysisBoxHtml.trim()) {
            dom.analysisBox.innerHTML = data.analysisBoxHtml;
        } else {
            resetAnalysisBoxes();
        }
        if (dom.worldlinesBox && data.worldlinesBoxHtml && data.worldlinesBoxHtml.trim()) {
            dom.worldlinesBox.innerHTML = data.worldlinesBoxHtml;
        }
        if (dom.tipsBox && data.tipsBoxHtml && data.tipsBoxHtml.trim()) {
            dom.tipsBox.innerHTML = data.tipsBoxHtml;
        }
        if (dom.chatBox && data.chatBoxHtml && data.chatBoxHtml.trim()) {
            dom.chatBox.innerHTML = data.chatBoxHtml;
        }

        renderSeatingChart();
        renderPlayerList();
        renderTimelineLogs();
        renderDeductiveValidator();

        const initGameDetails = document.getElementById("initGameDetails");
        if (initGameDetails) {
            initGameDetails.open = false;
        }

        if (dom.restoreGameBtn) {
            dom.restoreGameBtn.classList.add("hidden");
        }

        const restoreLog = gameState.lang === "en" 
            ? "Game state successfully recovered from local browser cache! Continue analysis."
            : "对局已成功从本地浏览器缓存恢复！继续推演分析吧。";
        gameState.logs.push(restoreLog);
        renderTimelineLogs();

        return true;
    } catch (e) {
        console.error("加载本地缓存对局失败:", e);
        return false;
    }
}

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
    
    gameState.evilBluffs = [
        dom.evilBluff1.value,
        dom.evilBluff2.value,
        dom.evilBluff3.value
    ].filter(b => b !== "");

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
            ghostVoteUsed: false,
            note: isMe ? "这是我的底牌角色" : ""
        });
    }

    gameState.aiOutputs = [];
    gameState.chatMessages = [];

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
        const scriptNameCn = SCRIPTS_DATA[gameState.scriptName]?.name || gameState.scriptName;
        gameState.logs = [
            `对局初始化：${gameState.playerCount} 人本，板子《${scriptNameCn}》。`,
            `我的位置是 <strong>${gameState.mySeat} 号</strong>，角色是 <strong>${gameState.myRole}</strong> (${gameState.myAlignment === "good" ? "善良阵营" : "邪恶阵营"})。`
        ];
        if (gameState.myAlignment === "evil") {
            const bluffsText = gameState.evilBluffs.length > 0 ? gameState.evilBluffs.join('、') : "未填报";
            gameState.logs.push(`说书人给的 3 个好人伪装身份：<strong>${bluffsText}</strong>。`);
        }
    }

    renderSeatingChart();
    renderPlayerList();
    renderTimelineLogs();
    renderDeductiveValidator();

    resetAnalysisBoxes();

    const initGameDetails = document.getElementById("initGameDetails");
    if (initGameDetails) {
        initGameDetails.open = false;
    }

    saveToLocalStorage();

    updateApiStatusIndicator();
}

export function togglePlayerAlive(seat, isAlive) {
    const player = gameState.players.find(p => p.seat === seat);
    if (player) {
        player.alive = isAlive;
        if (gameState.lang === "en") {
            gameState.logs.push(`<strong>${player.name}</strong> status updated to: ${isAlive ? 'Alive' : '❌ Dead'}`);
        } else {
            gameState.logs.push(`<strong>${player.name}</strong> 状态更新为：${isAlive ? '存活' : '❌ 死亡'}`);
        }
        notifyStateChange();
    }
}

export function togglePlayerPoison(seat, isPoisoned) {
    const player = gameState.players.find(p => p.seat === seat);
    if (player) {
        player.poisoned = isPoisoned;
        if (gameState.lang === "en") {
            gameState.logs.push(`<strong>${player.name}</strong> marked as: ${isPoisoned ? '🟣 Drunk/Poisoned' : 'Healthy'}`);
        } else {
            gameState.logs.push(`<strong>${player.name}</strong> 标记为：${isPoisoned ? '🟣 中毒/醉酒状态' : '已恢复健康状态'}`);
        }
        notifyStateChange();
    }
}

/**
 * notifyStateChange() — 统一视图同步入口
 * 所有组件通过此函数触发 UI 重新渲染，替代组件间直接互相 import。
 * 切断 seatingChart ↔ popoverModal 等双向循环依赖。
 */
export function notifyStateChange() {
    renderSeatingChart();
    renderPlayerList();
    renderTimelineLogs();
    renderDeductiveValidator();
    saveToLocalStorage();
}
