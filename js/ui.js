/* ==========================================================================
   ui.js - DOM 元素引用、多语言翻译引擎及组件视图渲染逻辑
   ========================================================================== */

import {
    SCRIPTS_DATA,
    CHARACTER_DETAILS,
    SCRIPTS_DATA_EN,
    CHARACTER_DETAILS_EN,
    ROLE_TRANSLATIONS,
    ROLE_TRANSLATIONS_REVERSE,
    TRANSLATIONS
} from './constants.js';

import {
    gameState,
    saveToLocalStorage,
    togglePlayerAlive,
    togglePlayerPoison
} from './state.js';

// --- DOM 元素引用 ---
export const dom = {
    apiKeyInput: document.getElementById("apiKeyInput"),
    playerCountSelect: document.getElementById("playerCountSelect"),
    scriptSelect: document.getElementById("scriptSelect"),
    mySeatInput: document.getElementById("mySeatInput"),
    myRoleSelect: document.getElementById("myRoleSelect"),
    myAlignmentSelect: document.getElementById("myAlignmentSelect"),
    initGameBtn: document.getElementById("initGameBtn"),
    resetPlayersBtn: document.getElementById("resetPlayersBtn"),
    playerListContainer: document.getElementById("playerListContainer"),
    seatingSvg: document.getElementById("seatingSvg"),
    seatingNodesContainer: document.getElementById("seatingNodesContainer"),
    timelineLogsContainer: document.getElementById("timelineLogsContainer"),
    logCountText: document.getElementById("logCountText"),
    consoleInput: document.getElementById("consoleInput"),
    clearConsoleBtn: document.getElementById("clearConsoleBtn"),
    analyzeBtn: document.getElementById("analyzeBtn"),
    tabButtons: document.querySelectorAll(".tab-btn"),
    tabContents: document.querySelectorAll(".tab-content"),
    analysisBox: document.getElementById("analysisBox"),
    worldlinesBox: document.getElementById("worldlinesBox"),
    tipsBox: document.getElementById("tipsBox"),
    // Popover Modal
    popoverModal: document.getElementById("seatPopoverModal"),
    popoverPlayerTitle: document.getElementById("popoverPlayerTitle"),
    popoverRoleSelect: document.getElementById("popoverRoleSelect"),
    popoverAliveCheckbox: document.getElementById("popoverAliveCheckbox"),
    popoverAlignmentSelect: document.getElementById("popoverAlignmentSelect"),
    popoverPoisonCheckbox: document.getElementById("popoverPoisonCheckbox"),
    popoverNoteInput: document.getElementById("popoverNoteInput"),
    savePopoverBtn: document.getElementById("savePopoverBtn"),
    closePopoverBtn: document.getElementById("closePopoverBtn"),
    apiStatusIndicator: document.getElementById("apiStatusIndicator"),
    apiStatusText: document.getElementById("apiStatusText"),
    voiceInputBtn: document.getElementById("voiceInputBtn"),
    restoreGameBtn: document.getElementById("restoreGameBtn"),
    evilBluffsContainer: document.getElementById("evilBluffsContainer"),
    evilBluff1: document.getElementById("evilBluff1"),
    evilBluff2: document.getElementById("evilBluff2"),
    evilBluff3: document.getElementById("evilBluff3"),
    aiModelSelect: document.getElementById("aiModelSelect"),
    apiProviderSelect: document.getElementById("apiProviderSelect"),
    apiBaseUrlContainer: document.getElementById("apiBaseUrlContainer"),
    apiBaseUrlInput: document.getElementById("apiBaseUrlInput"),
    apiKeyLabel: document.getElementById("apiKeyLabel"),
    apiModelCustomContainer: document.getElementById("apiModelCustomContainer"),
    apiModelCustomInput: document.getElementById("apiModelCustomInput"),
    apiConfigTip: document.getElementById("apiConfigTip"),
    previewScriptBtn: document.getElementById("previewScriptBtn"),
    scriptPreviewModal: document.getElementById("scriptPreviewModal"),
    closeScriptPreviewBtn: document.getElementById("closeScriptPreviewBtn"),
    seatingChartWatermark: document.getElementById("seatingChartWatermark"),
    langToggleBtn: document.getElementById("langToggleBtn"),
    langToggleText: document.getElementById("langToggleText")
};

// --- Helper functions for dynamic localization ---
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

export function getLocalizedLog(log, lang) {
    let displayLog = log;
    if (lang === "en") {
        displayLog = displayLog
            .replace(/对局初始化：(\d+) 人本，板子《(.*?)》。/g, (match, count, script) => {
                const scriptEn = SCRIPTS_DATA_EN[gameState.scriptName]?.name || script;
                return `Game initialized: ${count}-player game, Script: "${scriptEn}".`;
            })
            .replace(/我的位置是 <strong>(\d+) 号<\/strong>，角色是 <strong>(.*?)<\/strong> \((.*?)\)。/g, (match, seat, role, alignment) => {
                const mappedRole = ROLE_TRANSLATIONS[role] || role;
                const mappedAlign = alignment === "善良阵营" ? "Good Team" : "Evil Team";
                return `My seat is <strong>Seat ${seat}</strong>, Role: <strong>${mappedRole}</strong> (${mappedAlign}).`;
            })
            .replace(/说书人给的 3 个好人伪装身份：<strong>(.*?)<\/strong>。/g, (match, bluffs) => {
                const mappedBluffs = bluffs.split('、').map(b => ROLE_TRANSLATIONS[b] || b).join(', ');
                return `3 Demon Bluffs given by Storyteller: <strong>${mappedBluffs}</strong>.`;
            })
            .replace(/<strong>(.*?)<\/strong> 状态更新为：存活/g, "<strong>$1</strong> status updated to: Alive")
            .replace(/<strong>(.*?)<\/strong> 状态更新为：❌ 死亡/g, "<strong>$1</strong> status updated to: ❌ Dead")
            .replace(/<strong>(.*?)<\/strong> 标记为：🟣 中毒\/醉酒状态/g, "<strong>$1</strong> marked as: 🟣 Drunk/Poisoned")
            .replace(/<strong>(.*?)<\/strong> 标记为：已恢复健康状态/g, "<strong>$1</strong> marked as: Healthy")
            .replace(/手动更新了 <strong>(.*?)<\/strong> 的状态：/g, "Manually updated <strong>$1</strong> status: ")
            .replace(/宣称变更为 <strong>(.*?)<\/strong>/g, (match, role) => `Claim updated to <strong>${ROLE_TRANSLATIONS[role] || role}</strong>`)
            .replace(/生命状态变更为 <strong>存活<\/strong>/g, "Life status changed to <strong>Alive</strong>")
            .replace(/生命状态变更为 <strong>死亡<\/strong>/g, "Life status changed to <strong>Dead</strong>")
            .replace(/推测阵营变更为 <strong>善良<\/strong>/g, "Suspected alignment changed to <strong>Good</strong>")
            .replace(/推测阵营变更为 <strong>邪恶<\/strong>/g, "Suspected alignment changed to <strong>Evil</strong>")
            .replace(/推测阵营变更为 <strong>未知<\/strong>/g, "Suspected alignment changed to <strong>Unknown</strong>")
            .replace(/状态标记为 <strong>中毒\/醉酒<\/strong>/g, "Status marked as <strong>Drunk/Poisoned</strong>")
            .replace(/状态标记为 <strong>正常<\/strong>/g, "Status marked as <strong>Normal</strong>")
            .replace(/备注："(.*?)"/g, 'Notes: "$1"')
            .replace(/，/g, ", ")
            .replace(/已自动为您恢复上次对局状态！/g, "Automatically recovered the last game state!")
            .replace(/对局已成功从本地浏览器缓存恢复！继续推演分析吧。/g, "Game state successfully recovered from local browser cache! Continue analysis.")
            .replace(/白天进展陈述："(.*?)"/g, 'Day progress updates: "$1"')
            .replace(/白天进展陈述\(暂存\)："(.*?)"/g, 'Day progress updates (cached): "$1"');

        displayLog = displayLog
            .replace(/<strong>我<\/strong>/g, "<strong>Me</strong>")
            .replace(/<strong>玩家 (\d+)<\/strong>/g, "<strong>Player $1</strong>");
    } else {
        displayLog = displayLog
            .replace(/Game initialized: (\d+)-player game, Script: "(.*?)"./g, (match, count, script) => {
                const scriptNameMap = { "Supreme Slaughter": "无上杀戮", "Trouble Brewing": "暗流涌动", "Sects & Violets": "梦殒春宵", "Laissez un Faire": "瓦釜雷鸣" };
                const cnScript = scriptNameMap[script] || script;
                return `对局初始化：${count} 人本，板子《${cnScript}》。`;
            })
            .replace(/My seat is <strong>Seat (\d+)<\/strong>, Role: <strong>(.*?)<\/strong> \((.*?)\)./g, (match, seat, role, alignment) => {
                const mappedRole = ROLE_TRANSLATIONS_REVERSE[role] || role;
                const mappedAlign = alignment === "Good Team" ? "善良阵营" : "邪恶阵营";
                return `我的位置是 <strong>${seat} 号</strong>，角色是 <strong>${mappedRole}</strong> (${mappedAlign})。`;
            })
            .replace(/3 Demon Bluffs given by Storyteller: <strong>(.*?)<\/strong>./g, (match, bluffs) => {
                const mappedBluffs = bluffs.split(', ').map(b => ROLE_TRANSLATIONS_REVERSE[b] || b).join('、');
                return `说书人给的 3 个好人伪装身份：<strong>${mappedBluffs}</strong>。`;
            })
            .replace(/<strong>Me<\/strong>/g, "<strong>我</strong>")
            .replace(/<strong>Player (\d+)<\/strong>/g, "<strong>玩家 $1</strong>")
            .replace(/ status updated to: Alive/g, " 状态更新为：存活")
            .replace(/ status updated to: ❌ Dead/g, " 状态更新为：❌ 死亡")
            .replace(/ marked as: 🟣 Drunk\/Poisoned/g, " 标记为：🟣 中毒/醉酒状态")
            .replace(/ marked as: Healthy/g, " 标记为：已恢复健康状态")
            .replace(/Manually updated <strong>(.*?)<\/strong> status: /g, "手动更新了 <strong>$1</strong> 的状态：")
            .replace(/Claim updated to <strong>(.*?)<\/strong>/g, (match, role) => `宣称变更为 <strong>${ROLE_TRANSLATIONS_REVERSE[role] || role}</strong>`)
            .replace(/Life status changed to <strong>Alive<\/strong>/g, "生命状态变更为 <strong>存活</strong>")
            .replace(/Life status changed to <strong>Dead<\/strong>/g, "生命状态变更为 <strong>死亡</strong>")
            .replace(/Suspected alignment changed to <strong>Good<\/strong>/g, "推测阵营变更为 <strong>善良</strong>")
            .replace(/Suspected alignment changed to <strong>Evil<\/strong>/g, "推测阵营变更为 <strong>邪恶</strong>")
            .replace(/Suspected alignment changed to <strong>Unknown<\/strong>/g, "推测阵营变更为 <strong>未知</strong>")
            .replace(/Status marked as <strong>Drunk\/Poisoned<\/strong>/g, "状态标记为 <strong>中毒/醉酒</strong>")
            .replace(/Status marked as <strong>Normal<\/strong>/g, "状态标记为 <strong>正常</strong>")
            .replace(/Notes: "(.*?)"/g, '备注："$1"')
            .replace(/, /g, "，")
            .replace(/Automatically recovered the last game state!/g, "已自动为您恢复上次对局状态！")
            .replace(/Game state successfully recovered from local browser cache! Continue analysis./g, "对局已成功从本地浏览器缓存恢复！继续推演分析吧。")
            .replace(/Day progress updates: "(.*?)"/g, '白天进展陈述："$1"')
            .replace(/Day progress updates \(cached\): "(.*?)"/g, '白天进展陈述(暂存)："$1"');
    }
    return displayLog;
}

export function useEnOrZh(zh, en) {
    return gameState.lang === "en" ? en : zh;
}

// --- 动态填充并渲染剧本板子角色对照表 ---
export function populateScriptPreview() {
    const selectedScriptKey = dom.scriptSelect ? dom.scriptSelect.value : "wushang";
    const useEnglish = gameState.lang === "en";
    const script = useEnglish ? SCRIPTS_DATA_EN[selectedScriptKey] : SCRIPTS_DATA[selectedScriptKey];
    if (!script) return;
    
    // 动态更新弹窗标题
    const previewTitle = document.querySelector("#scriptPreviewModal h4");
    if (previewTitle) {
        previewTitle.textContent = useEnglish 
            ? `《${script.name}》Character Sheet`
            : `《${script.name}》剧本角色对照表`;
    }

    // 动态更新分类下方的数量提示
    const updateHeader = (containerId, textZh, textEn, count) => {
        const container = document.getElementById(containerId);
        const header = container ? container.previousElementSibling : null;
        if (header && header.tagName === "H5") {
            const titleSpan = header.querySelector("span:first-child");
            if (titleSpan) titleSpan.textContent = useEnglish ? textEn : textZh;
            const countText = header.querySelector("span:last-child");
            if (countText) countText.textContent = useEnglish ? `${count} Total` : `共 ${count} 个`;
        }
    };
    
    updateHeader("previewTownsfolkContainer", "村民角色 (Townsfolk)", "Townsfolk", script.townsfolk.length);
    updateHeader("previewOutsidersContainer", "外来者角色 (Outsiders)", "Outsiders", script.outsider.length);
    updateHeader("previewMinionsContainer", "爪牙角色 (Minions)", "Minions", script.minion.length);
    updateHeader("previewDemonsContainer", "恶魔角色 (Demons)", "Demons", script.demon.length);
    
    const renderCards = (roles, containerId, borderThemeClass) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = "";
        
        roles.forEach(role => {
            const desc = useEnglish
                ? ((CHARACTER_DETAILS_EN[selectedScriptKey] && CHARACTER_DETAILS_EN[selectedScriptKey][role]) || "No description available.")
                : ((CHARACTER_DETAILS[selectedScriptKey] && CHARACTER_DETAILS[selectedScriptKey][role]) || "暂无能力详细描述。");
            const card = document.createElement("div");
            card.className = `preview-character-card glass ${borderThemeClass}`;
            card.style.padding = "10px 12px";
            card.style.borderRadius = "8px";
            card.style.border = "1px solid rgba(255, 255, 255, 0.05)";
            card.style.background = "rgba(255, 255, 255, 0.02)";
            card.style.display = "flex";
            card.style.flexDirection = "column";
            card.style.gap = "4px";
            
            card.innerHTML = `
                <div style="font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
                    <span class="preview-role-name" style="font-size: 12.5px; font-weight: 700; color: var(--text-primary);">${role}</span>
                </div>
                <div style="font-size: 10px; line-height: 1.5; color: var(--text-secondary);">${desc}</div>
            `;
            container.appendChild(card);
        });
    };
    
    renderCards(script.townsfolk, "previewTownsfolkContainer", "good-border");
    renderCards(script.outsider, "previewOutsidersContainer", "poison-border");
    renderCards(script.minion, "previewMinionsContainer", "minion-border");
    renderCards(script.demon, "previewDemonsContainer", "evil-border");
}

// --- 动态填充角色下拉菜单 ---
export function updateMyRoleOptions() {
    const isEn = gameState.lang === "en";
    const selectedScriptValue = dom.scriptSelect ? dom.scriptSelect.value : "wushang";
    const script = isEn ? SCRIPTS_DATA_EN[selectedScriptValue] : SCRIPTS_DATA[selectedScriptValue];
    if (!script) return;
    
    dom.myRoleSelect.innerHTML = "";
    
    // In order to keep values as canonical Chinese keys (so internal logic doesn't break),
    // we use Chinese script definitions for option values, but display localized names.
    const cnScript = SCRIPTS_DATA[selectedScriptValue];
    const allRolesCn = [...cnScript.townsfolk, ...cnScript.outsider, ...cnScript.minion, ...cnScript.demon];
    
    allRolesCn.forEach(role => {
        const option = document.createElement("option");
        option.value = role;
        option.textContent = getLocalizedRole(role);
        if (role === gameState.myRole) option.selected = true;
        dom.myRoleSelect.appendChild(option);
    });

    // 同时填充弹窗里的角色选择框
    dom.popoverRoleSelect.innerHTML = `<option value="未知">${isEn ? "Unknown Character" : "未知角色"}</option>`;
    allRolesCn.forEach(role => {
        const option = document.createElement("option");
        option.value = role;
        option.textContent = getLocalizedRole(role);
        dom.popoverRoleSelect.appendChild(option);
    });

    // 填充邪恶伪装选项 (只限村民和外来者，因为伪装一定是好人)
    const goodRolesCn = [...cnScript.townsfolk, ...cnScript.outsider];
    [dom.evilBluff1, dom.evilBluff2, dom.evilBluff3].forEach((select, idx) => {
        if (!select) return;
        select.innerHTML = `<option value="">${isEn ? `-- Bluff ${idx + 1} --` : `-- 伪装 ${idx + 1} --`}</option>`;
        goodRolesCn.forEach(role => {
            const option = document.createElement("option");
            option.value = role;
            option.textContent = getLocalizedRole(role);
            select.appendChild(option);
        });
    });
}

// --- 渲染环形座位轨迹图 ---
export function renderSeatingChart() {
    dom.seatingNodesContainer.innerHTML = "";
    const width = 360;
    const height = 360;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 130; // 环形半径
    const count = gameState.playerCount;

    // 动态更新圆桌中心的剧本背景水印与高贵霓虹呼吸灯效果
    if (dom.seatingChartWatermark) {
        const useEnglish = gameState.lang === "en";
        const currentScript = useEnglish ? SCRIPTS_DATA_EN[gameState.scriptName] : SCRIPTS_DATA[gameState.scriptName];
        dom.seatingChartWatermark.textContent = currentScript?.name || "";
        
        if (gameState.scriptName === "wushang" || gameState.scriptName === "mengyun") {
            dom.seatingChartWatermark.style.color = "rgba(255, 51, 102, 0.15)";
            dom.seatingChartWatermark.style.textShadow = "0 0 10px rgba(255, 51, 102, 0.05)";
        } else {
            dom.seatingChartWatermark.style.color = "rgba(0, 210, 255, 0.15)";
            dom.seatingChartWatermark.style.textShadow = "0 0 10px rgba(0, 210, 255, 0.05)";
        }
    }

    // 清空旧 SVG 连线
    dom.seatingSvg.innerHTML = "";

    // 绘制外部大圆桌底轮廓
    const tableCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    tableCircle.setAttribute("cx", centerX);
    tableCircle.setAttribute("cy", centerY);
    tableCircle.setAttribute("r", radius);
    tableCircle.setAttribute("stroke", "rgba(255, 255, 255, 0.05)");
    tableCircle.setAttribute("stroke-width", "1");
    tableCircle.setAttribute("fill", "none");
    dom.seatingSvg.appendChild(tableCircle);

    // 动态生成座位节点坐标，并保存到节点中，方便画线
    const nodeCoords = [];

    for (let i = 0; i < count; i++) {
        const player = gameState.players[i];
        if (!player) continue;
        
        // 动态旋转：确保“我”（gameState.mySeat）的座位始终位于正下方最中间（即 Math.PI / 2，90度角）
        const angle = Math.PI / 2 + ((player.seat - gameState.mySeat) * 2 * Math.PI) / count;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        nodeCoords.push({ seat: player.seat, x, y });

        // 渲染 HTML 节点
        const node = document.createElement("div");
        node.className = `seat-node ${player.alignment} ${player.poisoned ? 'poisoned' : ''} ${!player.alive ? 'dead' : ''}`;
        if (player.seat === gameState.mySeat) node.classList.add("me");
        
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        
        node.innerHTML = `
            <div class="seat-node-circle">
                <span class="seat-node-num">${player.seat}</span>
                <span class="seat-node-name">${(player.name === "我" || player.name === "Me") ? (gameState.lang === "en" ? "Me" : "我") : player.name}</span>
                ${player.claim !== "未知" ? `<span class="seat-node-role">${getLocalizedRole(player.claim)}</span>` : ""}
            </div>
        `;

        // 绑定点击事件，点击在地图上弹窗修改
        node.addEventListener("click", () => openPopover(player.seat));
        dom.seatingNodesContainer.appendChild(node);
    }

    // 针对相邻存活玩家，绘制物理邻座连线
    drawAdjacencyLines(nodeCoords);
}

// --- 动态绘制存活物理邻座连线 (Adjacency SVG Curves) ---
export function drawAdjacencyLines(coords) {
    const count = gameState.players.length;
    
    // 找出所有存活玩家
    const alivePlayers = gameState.players.filter(p => p.alive);
    if (alivePlayers.length < 2) return;

    for (let i = 0; i < alivePlayers.length; i++) {
        const p1 = alivePlayers[i];
        const p2 = alivePlayers[(i + 1) % alivePlayers.length]; // 环形下一个人

        const c1 = coords.find(c => c.seat === p1.seat);
        const c2 = coords.find(c => c.seat === p2.seat);

        if (c1 && c2) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", c1.x);
            line.setAttribute("y1", c1.y);
            line.setAttribute("x2", c2.x);
            line.setAttribute("y2", c2.y);
            
            // 如果我活在场上，加亮与我相邻存活好人的物理连接
            const isRelatedToMe = (p1.seat === gameState.mySeat || p2.seat === gameState.mySeat);
            if (isRelatedToMe && gameState.myAlignment === "good") {
                line.setAttribute("stroke", "rgba(0, 210, 255, 0.35)");
                line.setAttribute("stroke-width", "2");
                line.setAttribute("stroke-dasharray", "4,4");
            } else {
                line.setAttribute("stroke", "rgba(255, 255, 255, 0.05)");
                line.setAttribute("stroke-width", "1");
            }
            dom.seatingSvg.appendChild(line);
        }
    }
}

// --- 渲染左下角玩家列表控制面板 ---
export function renderPlayerList() {
    dom.playerListContainer.innerHTML = "";
    
    gameState.players.forEach(player => {
        const isMe = (player.seat === gameState.mySeat);
        const row = document.createElement("div");
        row.className = `player-item-row ${!player.alive ? 'dead' : ''}`;
        if (isMe) row.classList.add("me");

        row.innerHTML = `
            <div class="player-info-meta">
                <span class="seat-badge">${player.seat}</span>
                <span class="player-name-text">${(player.name === "我" || player.name === "Me") ? (gameState.lang === "en" ? "Me" : "我") : player.name}</span>
                <span class="player-claim-badge">${getLocalizedClaim(player.claim)}</span>
            </div>
            <div class="player-actions-toggles">
                <label class="toggle-switch" title="存活/死亡">
                     <input type="checkbox" class="alive-toggle" data-seat="${player.seat}" ${player.alive ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
                <label class="toggle-switch" title="中毒/醉酒">
                    <input type="checkbox" class="poison-toggle" data-seat="${player.seat}" ${player.poisoned ? 'checked' : ''}>
                    <span class="slider purple"></span>
                </label>
                <button class="btn-text edit-player-btn" data-seat="${player.seat}"><i data-lucide="edit-3" style="width:12px;height:12px;"></i></button>
            </div>
        `;

        // 绑定列表内的快速切换事件
        row.querySelector(".alive-toggle").addEventListener("change", (e) => {
            togglePlayerAlive(player.seat, e.target.checked);
        });

        row.querySelector(".poison-toggle").addEventListener("change", (e) => {
            togglePlayerPoison(player.seat, e.target.checked);
        });

        row.querySelector(".edit-player-btn").addEventListener("click", () => {
            openPopover(player.seat);
        });

        dom.playerListContainer.appendChild(row);
    });

    lucide.createIcons();
}

// --- 渲染局势流向日志 ---
export function renderTimelineLogs() {
    dom.timelineLogsContainer.innerHTML = "";
    
    const isEn = gameState.lang === "en";
    dom.logCountText.textContent = isEn 
        ? `${gameState.logs.length} Log Entries` 
        : `共 ${gameState.logs.length} 条信息`;

    if (gameState.logs.length === 0) {
        dom.timelineLogsContainer.innerHTML = `
            <div class="empty-state">
                <i data-lucide="clipboard-list" class="empty-icon"></i>
                <p>${isEn ? "No game logs yet. Enter the first turn event or whisper in the console on the right." : "暂无游戏记录，在右侧控制台输入第一条局势变动吧"}</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    gameState.logs.forEach((log, index) => {
        const item = document.createElement("div");
        item.className = "log-item";
        
        let displayLog = getLocalizedLog(log, gameState.lang);

        // 简单着色
        if (log.includes("邪恶") || log.includes("死亡") || log.includes("处决") || log.includes("❌") || log.includes("Dead") || log.includes("Evil") || log.includes("poisoned") || log.includes("Poisoned")) {
            item.classList.add("evil");
        } else if (log.includes("善良") || log.includes("共情者") || log.includes("初始化") || log.includes("Good") || log.includes("initialized") || log.includes("Empath")) {
            item.classList.add("good");
        } else {
            item.classList.add("system");
        }

        item.innerHTML = isEn ? `[Event ${index + 1}] ${displayLog}` : `[事件 ${index + 1}] ${displayLog}`;
        dom.timelineLogsContainer.appendChild(item);
    });
    
    // 自动滚动到底部
    dom.timelineLogsContainer.scrollTop = dom.timelineLogsContainer.scrollHeight;
}

// --- 弹窗 Modal 管理 ---
export function openPopover(seat) {
    gameState.selectedSeatForEdit = seat;
    const player = gameState.players.find(p => p.seat === seat);
    if (!player) return;

    const isMe = (player.name === "我" || player.name === "Me");
    const nameText = isMe ? (gameState.lang === "en" ? "Me (Self)" : "我 (自己)") : player.name;
    const titleSuffix = TRANSLATIONS[gameState.lang]?.popoverPlayerTitleSuffix || "状态编辑";
    dom.popoverPlayerTitle.textContent = `${nameText} ${titleSuffix}`;
    
    dom.popoverRoleSelect.value = player.claim;
    dom.popoverAliveCheckbox.checked = player.alive;
    dom.popoverAlignmentSelect.value = player.alignment;
    dom.popoverPoisonCheckbox.checked = player.poisoned;
    dom.popoverNoteInput.value = player.note;

    dom.popoverModal.classList.remove("hidden");
}

export function closePopover() {
    dom.popoverModal.classList.add("hidden");
    gameState.selectedSeatForEdit = null;
}

export function savePopoverData() {
    const seat = gameState.selectedSeatForEdit;
    const player = gameState.players.find(p => p.seat === seat);
    if (!player) return;

    const oldClaim = player.claim;
    const newClaim = dom.popoverRoleSelect.value;
    const oldAlive = player.alive;
    const newAlive = dom.popoverAliveCheckbox.checked;
    const oldAlignment = player.alignment;
    const newAlignment = dom.popoverAlignmentSelect.value;
    const oldPoison = player.poisoned;
    const newPoison = dom.popoverPoisonCheckbox.checked;
    const newNote = dom.popoverNoteInput.value.trim();

    // 更新状态
    player.claim = newClaim;
    player.alive = newAlive;
    player.alignment = newAlignment;
    player.poisoned = newPoison;
    player.note = newNote;

    // 记录日志变化
    let changes = [];
    if (gameState.lang === "en") {
        if (oldClaim !== newClaim) changes.push(`Claim updated to <strong>${ROLE_TRANSLATIONS[newClaim] || newClaim}</strong>`);
        if (oldAlive !== newAlive) changes.push(`Life status changed to <strong>${newAlive ? 'Alive' : 'Dead'}</strong>`);
        if (oldAlignment !== newAlignment) {
            const alignMap = { "good": "Good", "evil": "Evil", "unknown": "Unknown" };
            changes.push(`Suspected alignment changed to <strong>${alignMap[newAlignment] || newAlignment}</strong>`);
        }
        if (oldPoison !== newPoison) changes.push(`Status marked as <strong>${newPoison ? 'Drunk/Poisoned' : 'Normal'}</strong>`);
        if (newNote && newNote !== player.note) changes.push(`Notes: "${newNote}"`);
        
        if (changes.length > 0) {
            gameState.logs.push(`Manually updated <strong>${player.name}</strong> status: ${changes.join(', ')}`);
        }
    } else {
        if (oldClaim !== newClaim) changes.push(`宣称变更为 <strong>${newClaim}</strong>`);
        if (oldAlive !== newAlive) changes.push(`生命状态变更为 <strong>${newAlive ? '存活' : '死亡'}</strong>`);
        if (oldAlignment !== newAlignment) changes.push(`推测阵营变更为 <strong>${newAlignment === 'good' ? '善良' : newAlignment === 'evil' ? '邪恶' : '未知'}</strong>`);
        if (oldPoison !== newPoison) changes.push(`状态标记为 <strong>${newPoison ? '中毒/醉酒' : '正常'}</strong>`);
        if (newNote && newNote !== player.note) changes.push(`备注："${newNote}"`);
        
        if (changes.length > 0) {
            gameState.logs.push(`手动更新了 <strong>${player.name}</strong> 的状态：${changes.join('，')}`);
        }
    }

    closePopover();
    renderSeatingChart();
    renderPlayerList();
    renderTimelineLogs();
    
    // 保存状态到本地
    saveToLocalStorage();
}

// --- 全局 Toast 提示辅助 ---
export function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message glass";
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "12px";
    toast.style.border = "1px solid rgba(0, 210, 255, 0.25)";
    toast.style.background = "rgba(10, 25, 50, 0.85)";
    toast.style.color = "var(--text-primary)";
    toast.style.fontFamily = "Outfit, sans-serif";
    toast.style.fontSize = "12.5px";
    toast.style.fontWeight = "600";
    toast.style.zIndex = "9999";
    toast.style.boxShadow = "0 8px 32px rgba(0, 210, 255, 0.15)";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "8px";
    toast.style.animation = "slideIn 0.3s ease-out forwards";
    toast.innerHTML = `<i data-lucide="check-circle" style="width:16px;height:16px;color:var(--color-good);"></i> ${message}`;
    
    document.body.appendChild(toast);
    lucide.createIcons({ attrs: { class: 'icon-sm' } });

    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s ease-in forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function translateDropdowns(lang) {
    const isEn = lang === "en";
    
    // 1. Player Count Dropdown options
    if (dom.playerCountSelect) {
        const select = dom.playerCountSelect;
        Array.from(select.options).forEach(opt => {
            const val = opt.value;
            if (val === "7") opt.textContent = isEn ? "7 Players (5 Townsfolk / 1 Outsider / 1 Minion / 1 Demon)" : "7 人本 (5村民 / 1外来 / 1爪牙 / 1恶魔)";
            else if (val === "8") opt.textContent = isEn ? "8 Players (5 Townsfolk / 1 Outsider / 1 Minion / 1 Demon) *Balloonist +1" : "8 人本 (5村民 / 1外来 / 1爪牙 / 1恶魔) *气球等+1";
            else if (val === "9") opt.textContent = isEn ? "9 Players (5 Townsfolk / 2 Outsiders / 1 Minion / 1 Demon)" : "9 人本 (5村民 / 2外来 / 1爪牙 / 1恶魔)";
            else if (val === "10") opt.textContent = isEn ? "10 Players (7 Townsfolk / 0 Outsiders / 2 Minions / 1 Demon)" : "10 人本 (7村民 / 0外来 / 2爪牙 / 1恶魔)";
            else if (val === "11") opt.textContent = isEn ? "11 Players (7 Townsfolk / 1 Outsider / 2 Minions / 1 Demon)" : "11 人本 (7村民 / 1外来 / 2爪牙 / 1恶魔)";
            else if (val === "12") opt.textContent = isEn ? "12 Players (7 Townsfolk / 2 Outsiders / 2 Minions / 1 Demon)" : "12 人本 (7村民 / 2外来 / 2爪牙 / 1恶魔)";
            else if (val === "13") opt.textContent = isEn ? "13 Players (9 Townsfolk / 0 Outsiders / 3 Minions / 1 Demon)" : "13 人本 (9村民 / 0外来 / 3爪牙 / 1恶魔)";
            else if (val === "14") opt.textContent = isEn ? "14 Players (9 Townsfolk / 1 Outsider / 3 Minions / 1 Demon)" : "14 人本 (9村民 / 1外来 / 3爪牙 / 1恶魔)";
            else if (val === "15") opt.textContent = isEn ? "15 Players (9 Townsfolk / 2 Outsiders / 3 Minions / 1 Demon)" : "15 人本 (9村民 / 2外来 / 3爪牙 / 1恶魔)";
        });
    }

    // 2. Script Select Dropdown options
    if (dom.scriptSelect) {
        const select = dom.scriptSelect;
        Array.from(select.options).forEach(opt => {
            const val = opt.value;
            if (val === "wushang") opt.textContent = isEn ? "Supreme Slaughter (Custom High-Interaction Board)" : "无上杀戮 (自定义强交互板)";
            else if (val === "anliu") opt.textContent = isEn ? "Trouble Brewing (Classic Novice Board)" : "暗流涌动 (经典新手板)";
            else if (val === "mengyun") opt.textContent = isEn ? "Sects & Violets (Classic Advanced Board)" : "梦殒春宵 (经典进阶板)";
            else if (val === "wafuleiming") opt.textContent = isEn ? "Laissez un Faire (Classic Advanced Board)" : "瓦釜雷鸣 (经典进阶板)";
        });
    }

    // 3. API Provider options
    if (dom.apiProviderSelect) {
        const select = dom.apiProviderSelect;
        Array.from(select.options).forEach(opt => {
            const val = opt.value;
            if (val === "gemini") opt.textContent = "Google Gemini";
            else if (val === "chatgpt") opt.textContent = "OpenAI ChatGPT";
            else if (val === "claude") opt.textContent = "Anthropic Claude";
            else if (val === "deepseek") opt.textContent = "DeepSeek";
            else if (val === "qwen") opt.textContent = isEn ? "Alibaba Qwen" : "阿里通义千问 (Qwen)";
            else if (val === "zhipu") opt.textContent = isEn ? "Zhipu GLM" : "智谱清言 (GLM)";
            else if (val === "doubao") opt.textContent = isEn ? "ByteDance Doubao" : "字节跳动火山引擎 (Doubao)";
            else if (val === "kimi") opt.textContent = isEn ? "Moonshot Kimi" : "月之暗面 (Kimi)";
            else if (val === "baidu") opt.textContent = isEn ? "Baidu ERNIE" : "百度文心一言 (ERNIE)";
            else if (val === "custom") opt.textContent = isEn ? "Custom / OpenAI Compatible" : "自定义 / 其他兼容协议 (Custom)";
        });
    }
}

// --- 极简多语言切换引擎 (Client-Side Translation Engine) ---
export function setLanguage(lang) {
    gameState.lang = lang;
    localStorage.setItem("botc_lang", lang);
    
    // 切换按钮指示文字 (Switch toggle text)
    if (dom.langToggleText) {
        dom.langToggleText.textContent = lang === "zh" ? "English" : "简体中文";
    }
    
    // 动态翻译下拉菜单 (Translate dynamic dropdown select lists)
    translateDropdowns(lang);
    
    // 更新所有带有 data-i18n 的静态文本节点 (Process all elements with data-i18n)
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.textContent = TRANSLATIONS[lang][key];
        }
    });
    
    // 更新所有输入框的 placeholder (Process placeholders)
    const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
    placeholders.forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.placeholder = TRANSLATIONS[lang][key];
        }
    });
    
    // 更新所有悬浮文字提示 title (Process titles)
    const titles = document.querySelectorAll("[data-i18n-title]");
    titles.forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.title = TRANSLATIONS[lang][key];
        }
    });
    
    // 重新填充当前角色的选择框
    updateMyRoleOptions();
    
    // 如果对局已初始化，同步更新动态生成的玩家列表与日志状态 (Sync dynamic data views)
    if (gameState.players && gameState.players.length > 0) {
        // 同步“我”的显示名字
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
    }
    
    // 更新剧本角色对照表的表头分类 (Update scripts preview UI headers)
    populateScriptPreview();
    
    // 更新 AI 驱动厂商对应的提示词 (Update provider option tip)
    updateApiModelOptions();
    
    // 如果目前处于初始迎新状态，重新渲染欢迎语的语言
    if (dom.analysisBox && dom.analysisBox.querySelector(".ai-welcome")) {
        resetAnalysisBoxes();
    }
    
    // 自动刷新保存缓存
    saveToLocalStorage();
}

// --- 动态填充预设 AI 模型选项 ---
export function updateApiModelOptions() {
    const provider = dom.apiProviderSelect.value;
    dom.aiModelSelect.innerHTML = "";
    const useEnglish = gameState.lang === "en";
    
    let presets = [];
    
    if (provider === "gemini") {
        presets = [
            { value: "gemini-flash-latest", text: useEnglish ? "Gemini Flash Latest (Dynamic)" : "Gemini Flash 最新动态版 (当前指向 3.5 Flash)" },
            { value: "gemini-3.5-flash", text: useEnglish ? "Gemini 3.5 Flash (Latest 2026)" : "Gemini 3.5 Flash (最新 2026 闪电旗舰/带推理)" },
            { value: "gemini-3.1-pro-preview", text: useEnglish ? "Gemini 3.1 Pro (Reasoning)" : "Gemini 3.1 Pro (最新 2026 深度推理Pro/带推理)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.add("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("Gemini API Key (密钥)", "Gemini API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "已自动填充 Google Gemini 原生密钥，支持最新的 3.5 Flash 极速推理模型以及 3.1 Pro 深度推理模型，无需配置直接使用！",
            "Google Gemini key pre-filled by default. Supports latest Gemini 3.5 Flash and Gemini 3.1 Pro models instantly!"
        );
    } else if (provider === "chatgpt") {
        presets = [
            { value: "gpt-5.5", text: useEnglish ? "GPT-5.5 Flagship" : "GPT-5.5 Flagship (最新 2026 核心旗舰)" },
            { value: "gpt-5.4", text: useEnglish ? "GPT-5.4 Standard" : "GPT-5.4 Standard (主力高吞吐工作流模型)" },
            { value: "gpt-5.4-mini", text: useEnglish ? "GPT-5.4 Mini" : "GPT-5.4 Mini (低延迟轻量级大模型)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("OpenAI API Key (密钥)", "OpenAI API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "请填入您的 OpenAI API 密钥。支持自定义中转接口 Base URL（支持各大中转代理平台）。",
            "Please enter your OpenAI API Key. Custom Base URL is supported (useful for third-party proxies)."
        );
    } else if (provider === "claude") {
        presets = [
            { value: "claude-opus-4-8", text: useEnglish ? "Claude Opus 4.8" : "Claude Opus 4.8 (最新 2026 终极智能旗舰)" },
            { value: "claude-sonnet-4-6", text: useEnglish ? "Claude Sonnet 4.6" : "Claude Sonnet 4.6 (高速度与深度推理平衡模范)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("Anthropic API Key / 代理密钥", "Anthropic API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "支持原生 Claude 密钥（直连需要本地开发或翻墙），以及各类 OpenAI 格式中转代理密钥（修改 Base URL 即可）。",
            "Supports native Claude keys (needs local routing) and various OpenAI format proxy keys (just change Base URL)."
        );
    } else if (provider === "deepseek") {
        presets = [
            { value: "deepseek-v4-pro", text: useEnglish ? "DeepSeek V4 Pro" : "DeepSeek V4 Pro (最新 2026 深度思考旗舰)" },
            { value: "deepseek-v4-flash", text: useEnglish ? "DeepSeek V4 Flash" : "DeepSeek V4 Flash (最新 2026 极速旗舰)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("DeepSeek API Key (密钥)", "DeepSeek API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "支持 DeepSeek 官方密钥（基地址为 https://api.deepseek.com/v1）或各大厂商兼容中转密钥。",
            "Supports DeepSeek official keys (Base URL: https://api.deepseek.com/v1) or compatible reseller API keys."
        );
    } else if (provider === "qwen") {
        presets = [
            { value: "qwen3.7-max", text: useEnglish ? "Qwen 3.7 Max" : "通义千问 Qwen 3.7 Max (最新 2026 商业旗舰)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("阿里通义 API Key (密钥)", "Alibaba DashScope Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "支持阿里云 DashScope 密钥（基地址为 https://dashscope.aliyuncs.com/compatible-mode/v1）及其代理密钥。",
            "Supports Alibaba DashScope compatible keys (Base URL: https://dashscope.aliyuncs.com/compatible-mode/v1) and their proxies."
        );
    } else if (provider === "zhipu") {
        presets = [
            { value: "glm-5.1", text: useEnglish ? "GLM-5.1 Flagship" : "GLM-5.1 Flagship (最新 2026 本土最强 MoE 旗舰)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("智谱 GLM API Key (密钥)", "Zhipu GLM API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "支持智谱开放平台 API 密钥（基地址为 https://open.bigmodel.cn/api/paas/v4/）。",
            "Supports Zhipu open platform keys (Base URL: https://open.bigmodel.cn/api/paas/v4/)."
        );
    } else if (provider === "doubao") {
        presets = [
            { value: "doubao-seed-2-0-pro-260215", text: useEnglish ? "Doubao Seed 2.0 Pro" : "Doubao Seed 2.0 Pro (最新 2026 字节旗舰)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("火山引擎 API Key (密钥)", "Volcengine API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "支持火山引擎大模型服务平台 API 密钥（基地址为 https://ark.cn-beijing.volces.com/api/v3）。",
            "Supports ByteDance Volcengine ARK API keys (Base URL: https://ark.cn-beijing.volces.com/api/v3)."
        );
    } else if (provider === "kimi") {
        presets = [
            { value: "kimi-k2.6", text: useEnglish ? "Kimi K2.6" : "Kimi K2.6 (最新 2026 Agent Swarm 深度推理)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("月之暗面 Kimi API Key", "Moonshot Kimi API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "支持月之暗面开放平台 API 密钥（基地址为 https://api.moonshot.cn/v1）。",
            "Supports Moonshot Kimi open platform keys (Base URL: https://api.moonshot.cn/v1)."
        );
    } else if (provider === "baidu") {
        presets = [
            { value: "ernie-5.1", text: useEnglish ? "ERNIE 5.1" : "ERNIE 5.1 (最新 2026 百度中文搜索推理旗舰)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("百度 API Key (AccessToken)", "Baidu Qianfan AccessToken");
        dom.apiConfigTip.textContent = useEnOrZh(
            "支持百度文心千帆/AI Studio 开放平台 API 密钥（基地址为 https://aistudio.baidu.com/llm/lmapi/v3）。",
            "Supports Baidu Qianfan / AI Studio open platform keys (Base URL: https://aistudio.baidu.com/llm/lmapi/v3)."
        );
    } else { // custom / others
        presets = [
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("API Key / 接口密钥", "API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "用于对接各类未列出的模型网关协议、SiliconFlow 代理、本地 Ollama 离线部署等。",
            "Used for other custom model integrations, SiliconFlow gateway, local Ollama endpoints, etc."
        );
    }
    
    presets.forEach(preset => {
        const option = document.createElement("option");
        option.value = preset.value;
        option.textContent = preset.text;
        if (preset.value === gameState.aiModel) {
            option.selected = true;
        }
        dom.aiModelSelect.appendChild(option);
    });
    
    // 如果之前保存的是自定义模型，选中 custom
    const isPreset = presets.some(p => p.value === gameState.aiModel);
    if (!isPreset && gameState.aiModel) {
        Array.from(dom.aiModelSelect.options).forEach(opt => {
            if (opt.value === "custom") {
                opt.selected = true;
            }
        });
        dom.apiModelCustomContainer.classList.remove("hidden");
        dom.apiModelCustomInput.value = gameState.aiModel;
    } else {
        if (dom.aiModelSelect.value === "custom") {
            dom.apiModelCustomContainer.classList.remove("hidden");
            dom.apiModelCustomInput.value = gameState.apiModelCustom;
        } else {
            dom.apiModelCustomContainer.classList.add("hidden");
        }
    }
}

// --- 简易高效的 Markdown 解析器 ---
export function parseMarkdown(md) {
    if (!md) return "";
    let html = md;
    
    // GitHub Alert 警示框处理
    html = html.replace(/^\>\s*\[!NOTE\]\s*(.*$)/gim, '<blockquote class="alert note"><i data-lucide="info" class="icon-sm"></i> $1</blockquote>');
    html = html.replace(/^\>\s*\[!WARNING\]\s*(.*$)/gim, '<blockquote class="alert warning"><i data-lucide="alert-triangle" class="icon-sm"></i> $1</blockquote>');
    html = html.replace(/^\>\s*\[!IMPORTANT\]\s*(.*$)/gim, '<blockquote class="alert important"><i data-lucide="shield-alert" class="icon-sm"></i> $1</blockquote>');
    
    // 粗体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 标题
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // 引用块 (排除了 Alert 块，防止冲突)
    html = html.replace(/^\>\s*(?!\[!NOTE\]|\[!WARNING\]|\[!IMPORTANT\])(.*$)/gim, '<blockquote>$1</blockquote>');
    
    // 列表项格式化
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, ''); 

    // 换行替换为段落
    html = html.split('\n\n').map(p => {
        const trimmed = p.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<block') || trimmed.startsWith('<div')) {
            return trimmed;
        }
        return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return html;
}

// --- 重置分析输出框 ---
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
    lucide.createIcons();
}
