/* ==========================================================================
   state.js - 全局运行时状态机管理与视图层同步协调中心 (State Model)
   ========================================================================== */

import { dom } from './dom.js';
import { setLanguage, updateMyRoleOptions, updateApiModelOptions, resetAnalysisBoxes } from './i18n.js';
import { renderSeatingChart } from './components/seatingChart.js';
import { renderPlayerList } from './components/playerList.js';
import { renderTimelineLogs } from './components/timelineLogs.js';
import { SCRIPTS_DATA, SCRIPTS_DATA_EN } from './data/rules.js';
import { ROLE_TRANSLATIONS, TRANSLATIONS } from './data/translations.js';
import { saveGameState, loadGameState, hasSavedGame } from './services/storage.js';

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
    aiOutputs: [],
    selectedSeatForEdit: null,
    lang: "zh"
};

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
        consoleInputDraft: dom.consoleInput ? dom.consoleInput.value : "",
        analysisBoxHtml: dom.analysisBox ? dom.analysisBox.innerHTML : "",
        worldlinesBoxHtml: dom.worldlinesBox ? dom.worldlinesBox.innerHTML : "",
        tipsBoxHtml: dom.tipsBox ? dom.tipsBox.innerHTML : "",
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

    // 重置 AI 历史输出与记忆
    gameState.aiOutputs = [];

    // 重置日志流水
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
