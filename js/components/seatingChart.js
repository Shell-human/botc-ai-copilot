/* ==========================================================================
   seatingChart.js - 环形物理座位轨迹圆桌 SVG 图表组件 (Component)
   ========================================================================== */

import { SCRIPTS_DATA, SCRIPTS_DATA_EN } from '../data/rules.js';
import { gameState, saveToLocalStorage } from '../state.js';
import { dom } from '../dom.js';
import { openPopover } from './popoverModal.js';

function getLocalizedRole(roleName) {
    if (window.getLocalizedRole) {
        return window.getLocalizedRole(roleName);
    }
    return roleName;
}

// --- 渲染环形座位轨迹图 ---
export function renderSeatingChart() {
    dom.seatingNodesContainer.innerHTML = "";
    const width = 480;
    const height = 480;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 180; // 环形半径
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
        
        let ghostVoteHtml = "";
        if (!player.alive) {
            const isSpent = player.ghostVoteUsed;
            const titleText = gameState.lang === "en" 
                ? (isSpent ? "Ghost Vote spent" : "Ghost Vote active (Click to spend)") 
                : (isSpent ? "幽灵票已使用" : "幽灵票存余 (点击消耗)");
            ghostVoteHtml = `
                <div class="ghost-vote-token ${isSpent ? 'spent' : 'active'}" title="${titleText}">
                    <svg viewBox="0 0 24 24" fill="currentColor" class="ghost-vote-svg">
                        <circle cx="12" cy="12" r="8" />
                    </svg>
                </div>
            `;
        }
        
        node.innerHTML = `
            <div class="seat-node-circle">
                <span class="seat-node-num">${player.seat}</span>
                <span class="seat-node-name">${(player.name === "我" || player.name === "Me") ? (gameState.lang === "en" ? "Me" : "我") : player.name}</span>
                ${player.claim !== "未知" ? `<span class="seat-node-role">${getLocalizedRole(player.claim)}</span>` : ""}
            </div>
            ${ghostVoteHtml}
        `;

        // 绑定点击事件，点击在地图上弹窗修改
        node.addEventListener("click", () => openPopover(player.seat));
        
        // 绑定幽灵票点击切换
        if (!player.alive) {
            const token = node.querySelector(".ghost-vote-token");
            if (token) {
                token.addEventListener("click", (e) => {
                    e.stopPropagation(); // 阻止冒泡，避免触发 openPopover
                    player.ghostVoteUsed = !player.ghostVoteUsed;
                    saveToLocalStorage();
                    renderSeatingChart();
                    
                    // 触发大盘逻辑校验器重新渲染
                    if (window.renderDeductiveValidator) {
                        window.renderDeductiveValidator();
                    }
                });
            }
        }
        
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
