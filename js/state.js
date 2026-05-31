/* ==========================================================================
   state.js - 全局运行时状态机管理与持久化本地缓存核心
   ========================================================================== */

import { dom } from './dom.js';
import { setLanguage, updateMyRoleOptions, updateApiModelOptions, resetAnalysisBoxes } from './i18n.js';
import { renderSeatingChart } from './components/seatingChart.js';
import { renderPlayerList } from './components/playerList.js';
import { renderTimelineLogs } from './components/timelineLogs.js';

export const gameState = {
    apiKey: "",
    playerCount: 9,
    scriptName: "wushang",
    mySeat: 3,
    myRole: "共情者",
    myAlignment: "good",
    evilBluffs: ["", "", ""],
    apiProvider: "gemini",
    apiBaseUrl: "https://api.openai.com/v1",
    aiModel: "gemini-flash-latest",
    apiModelCustom: "",
    players: [],
    logs: [],
    selectedSeatForEdit: null,
    lang: "zh"
};

// --- LocalStorage 本地自动持久化存储 ---
export function saveToLocalStorage() {
    try {
        localStorage.setItem("botc_game_state", JSON.stringify({
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
            consoleInputDraft: dom.consoleInput ? dom.consoleInput.value : "",
            analysisBoxHtml: dom.analysisBox ? dom.analysisBox.innerHTML : "",
            worldlinesBoxHtml: dom.worldlinesBox ? dom.worldlinesBox.innerHTML : "",
            tipsBoxHtml: dom.tipsBox ? dom.tipsBox.innerHTML : "",
            lang: gameState.lang
        }));
    } catch (e) {
        console.error("无法保存对局数据到本地缓存:", e);
    }
}

export function checkSavedGame() {
    const saved = localStorage.getItem("botc_game_state");
    if (saved && dom.restoreGameBtn) {
        dom.restoreGameBtn.classList.remove("hidden");
        return true;
    }
    return false;
}

export function loadFromLocalStorage() {
    const saved = localStorage.getItem("botc_game_state");
    if (!saved) return false;
    try {
        const data = JSON.parse(saved);
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
        gameState.lang = data.lang || "zh";

        // Sync i18n
        setLanguage(gameState.lang);

        // 同步 UI 控件状态
        dom.playerCountSelect.value = gameState.playerCount;
        dom.scriptSelect.value = gameState.scriptName;
        dom.mySeatInput.value = gameState.mySeat;
        dom.myRoleSelect.value = gameState.myRole;
        dom.myAlignmentSelect.value = gameState.myAlignment;
        dom.apiProviderSelect.value = gameState.apiProvider;
        dom.apiBaseUrlInput.value = gameState.apiBaseUrl;

        // 重新填充下拉框
        updateMyRoleOptions();
        updateApiModelOptions();

        // 恢复邪恶伪装面板及状态值
        if (gameState.myAlignment === "evil") {
            dom.evilBluffsContainer.classList.remove("hidden");
            if (gameState.evilBluffs[0]) dom.evilBluff1.value = gameState.evilBluffs[0];
            if (gameState.evilBluffs[1]) dom.evilBluff2.value = gameState.evilBluffs[1];
            if (gameState.evilBluffs[2]) dom.evilBluff3.value = gameState.evilBluffs[2];
        } else {
            dom.evilBluffsContainer.classList.add("hidden");
        }

        // 恢复输入框草稿与 AI 分析结果
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

        // 重新渲染全部视图
        renderSeatingChart();
        renderPlayerList();
        renderTimelineLogs();

        // 自动折叠初始化面板
        const initGameDetails = document.getElementById("initGameDetails");
        if (initGameDetails) {
            initGameDetails.open = false;
        }

        // 隐藏恢复按钮，既然已经恢复
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

// --- 状态变动辅助函数 ---
export function togglePlayerAlive(seat, isAlive) {
    const player = gameState.players.find(p => p.seat === seat);
    if (player) {
        player.alive = isAlive;
        if (gameState.lang === "en") {
            gameState.logs.push(`<strong>${player.name}</strong> status updated to: ${isAlive ? 'Alive' : '❌ Dead'}`);
        } else {
            gameState.logs.push(`<strong>${player.name}</strong> 状态更新为：${isAlive ? '存活' : '❌ 死亡'}`);
        }
        renderSeatingChart();
        renderPlayerList();
        renderTimelineLogs();
        saveToLocalStorage();
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
        renderSeatingChart();
        renderPlayerList();
        renderTimelineLogs();
        saveToLocalStorage();
    }
}
