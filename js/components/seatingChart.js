/* ==========================================================================
   seatingChart.js - 环形物理座位轨迹圆桌 SVG 图表组件 (Component)
   ========================================================================== */

import { SCRIPTS_DATA, SCRIPTS_DATA_EN } from '../data/rules.js';
import { gameState } from '../core/state.js';
import { dom } from '../core/dom.js';
import { getLocalizedRole } from '../i18n/engine.js';
import { openPopover } from './popoverModal.js';
import { escapeHtml } from '../utils.js';



// --- 渲染环形座位轨迹图 ---
export function renderSeatingChart() {
    dom.seatingNodesContainer.innerHTML = "";
    
    // Get fluid client dimensions of the seating chart container
    const wrapper = document.querySelector('.seating-chart-wrapper');
    const width = wrapper ? (wrapper.clientWidth || 720) : 720;
    const height = wrapper ? (wrapper.clientHeight || 520) : 520;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate adaptive scale factor based on container dimensions
    const refWidth = 720;
    const refHeight = 480;
    const scale = Math.min(1.0, Math.max(0.65, Math.min(width / refWidth, height / refHeight)));
    const count = gameState.playerCount;
    const isPortrait = width < height;
    
    // Set dynamic CSS custom property for seat node scaling (84px base size is the perfect visual sweet spot)
    let nodeSize = Math.round(84 * scale);
    if (isPortrait && count > 9) {
        // 手机竖屏且人数较多时，适度缩小节点以防止环形折叠堆叠
        nodeSize = Math.round(nodeSize * 0.88);
    }
    if (wrapper) {
        wrapper.style.setProperty('--seat-node-size', `${nodeSize}px`);
    }
    
    // Calculate adaptive margins based on the scaled node size to ensure comfortable breathing room
    let paddingX = Math.round(Math.max(48, 64 * scale));
    let paddingY = Math.round(Math.max(48, 64 * scale));
    
    let rx, ry;
    if (isPortrait) {
        // 手机竖屏布局：显式缩拢横向半径以防左右边缘裁切，拉长垂直半径以形成美观的竖型椭圆
        const portraitPaddingX = paddingX + 16;
        rx = Math.max(70, (width / 2) - portraitPaddingX);
        const targetRy = Math.round(rx * 1.45);
        const maxRy = (height / 2) - paddingY;
        ry = Math.min(maxRy, Math.max(80, targetRy));
    } else {
        rx = Math.max(80, (width / 2) - paddingX);
        ry = Math.max(80, (height / 2) - paddingY);
    }
    
    // Generous aspect ratio limits: dynamic vertical ellipse for mobile and stretched landscape for desktop
    const maxLandscapeRatio = 2.3;
    const maxPortraitRatio = 1.8;
    
    if (rx > ry * maxLandscapeRatio) {
        rx = ry * maxLandscapeRatio;
    } else if (ry > rx * maxPortraitRatio) {
        ry = rx * maxPortraitRatio;
    }
    
    // Calculate dynamic superellipse exponent n (Lamé curve parameter)
    // Capped at 2.45 to ensure a highly aesthetic organic rounded squircle rather than a harsh rectangle
    const ratioVal = Math.max(rx / ry, ry / rx);
    const n = 2.0 + Math.min(1.0, (ratioVal - 1.0) / 1.5) * 0.45;
    const power = 2 / n;


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

    // 清空旧 SVG 连线, 并动态设置 viewBox
    if (dom.seatingSvg) {
        dom.seatingSvg.innerHTML = "";
        dom.seatingSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }

    // 绘制外部超椭圆（Superellipse/Lamé Curve）桌底轮廓
    const points = [];
    const steps = 72; // Smoothness factor
    for (let j = 0; j <= steps; j++) {
        const theta = (j * 2 * Math.PI) / steps;
        const cosVal = Math.cos(theta);
        const sinVal = Math.sin(theta);
        const px = centerX + rx * Math.sign(cosVal) * Math.pow(Math.abs(cosVal), power);
        const py = centerY + ry * Math.sign(sinVal) * Math.pow(Math.abs(sinVal), power);
        points.push(`${j === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    const pathD = points.join(' ') + ' Z';

    const tablePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tablePath.setAttribute("d", pathD);
    tablePath.setAttribute("stroke", "rgba(255, 255, 255, 0.05)");
    tablePath.setAttribute("stroke-width", "1.5");
    tablePath.setAttribute("fill", "none");
    if (dom.seatingSvg) {
        dom.seatingSvg.appendChild(tablePath);
    }

    // 动态生成座位节点坐标，并保存到节点中，方便画线
    const nodeCoords = [];
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
        const player = gameState.players[i];
        if (!player) continue;
        
        // 动态旋转：确保"我"（gameState.mySeat）的座位始终位于正下方最中间（即 Math.PI / 2，90度角）
        const angle = Math.PI / 2 + ((player.seat - gameState.mySeat) * 2 * Math.PI) / count;
        const cosVal = Math.cos(angle);
        const sinVal = Math.sin(angle);
        const x = centerX + rx * Math.sign(cosVal) * Math.pow(Math.abs(cosVal), power);
        const y = centerY + ry * Math.sign(sinVal) * Math.pow(Math.abs(sinVal), power);
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
        
        const rawName = (player.name === "我" || player.name === "Me") ? (gameState.lang === "en" ? "Me" : "我") : player.name;
        node.innerHTML = `
            <div class="seat-node-circle">
                <span class="seat-node-num">${player.seat}</span>
                <span class="seat-node-name">${escapeHtml(rawName)}</span>
                ${player.claim !== "未知" ? `<span class="seat-node-role">${escapeHtml(getLocalizedRole(player.claim))}</span>` : ""}
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
                });
            }
        }
        
        fragment.appendChild(node);
    }

    dom.seatingNodesContainer.appendChild(fragment);


    // 针对相邻存活玩家，绘制物理邻座连线
    drawAdjacencyLines(nodeCoords);
}

// --- 动态绘制存活物理邻座连线 (Adjacency SVG Curves) ---
export function drawAdjacencyLines(coords) {
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
