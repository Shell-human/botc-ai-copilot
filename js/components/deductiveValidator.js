/* ==========================================================================
   deductiveValidator.js - 大盘逻辑校验与冲突追踪看板组件 (Component)
   ========================================================================= */

import { gameState } from '../core/state.js';
import { GAME_DISTRIBUTIONS, SCRIPTS_DATA } from '../data/rules.js';
import { getLocalizedRole } from '../i18n/engine.js';

export function renderDeductiveValidator() {
    const card = dom.deductiveValidatorCard;
    if (!card) {
        console.warn("⚠️ [DeductiveValidator] Card container element 'deductiveValidatorCard' not found in DOM.");
        return;
    }

    const isEn = gameState.lang === "en";
    const currentScript = SCRIPTS_DATA[gameState.scriptName];
    if (!currentScript) {
        console.warn("⚠️ [DeductiveValidator] Script data not found for:", gameState.scriptName);
        card.innerHTML = "";
        return;
    }

    console.log("📊 [DeductiveValidator] Running validator checks...");
    console.log("📊 [DeductiveValidator] Player count:", gameState.playerCount, "Script:", gameState.scriptName);
    console.log("📊 [DeductiveValidator] Players state:", gameState.players.map(p => ({
        seat: p.seat,
        claim: p.claim,
        alive: p.alive,
        ghostVoteUsed: p.ghostVoteUsed
    })));

    // 1. 计算对跳冲突 (Claim Collisions)
    const claimGroups = {};
    gameState.players.forEach(p => {
        if (p.claim && p.claim !== "未知" && p.claim !== "Unknown") {
            if (!claimGroups[p.claim]) {
                claimGroups[p.claim] = [];
            }
            claimGroups[p.claim].push(p.seat);
        }
    });

    const collisions = [];
    Object.entries(claimGroups).forEach(([role, seats]) => {
        if (seats.length > 1) {
            collisions.push({ role, seats });
        }
    });
    console.log("📊 [DeductiveValidator] Calculated collisions:", collisions);

    // 2. 计算外来者数量校验 (Outsider Validator)
    const standardDist = GAME_DISTRIBUTIONS[gameState.playerCount] || { townsfolk: 0, outsider: 0, minion: 0, demon: 0 };
    const standardOutsiders = standardDist.outsider || 0;
    
    // 找出当前宣称为外来者的玩家
    const claimedOutsiders = gameState.players.filter(p => {
        return currentScript.outsider.includes(p.claim);
    });
    const claimedOutsidersCount = claimedOutsiders.length;
    console.log("📊 [DeductiveValidator] Outsiders: Standard =", standardOutsiders, "Claimed =", claimedOutsidersCount, claimedOutsiders.map(p => p.seat));

    // 3. 计算幽灵票存余统计 (Ghost Votes)
    const deadPlayers = gameState.players.filter(p => !p.alive);
    const totalDeadCount = deadPlayers.length;
    const remainingGhostVotes = deadPlayers.filter(p => !p.ghostVoteUsed).length;

    // ----------------------------------------------------
    // 开始构造大盘 HTML
    // ----------------------------------------------------
    const titleText = isEn ? "Deductive Validator Dashboard" : "大盘逻辑校验与冲突追踪器";
    const conflictHeader = isEn ? "Claim Collisions" : "角色对跳冲突";
    const outsiderHeader = isEn ? "Outsider Count" : "外来者数量校验";
    const ghostVoteHeader = isEn ? "Dead Ghost Votes" : "幽灵票存余统计";

    // 2.1 对跳冲突列表 HTML
    let collisionListHtml = "";
    if (collisions.length === 0) {
        collisionListHtml = `<p class="validator-empty-text" style="font-size: 10px; opacity: 0.75; line-height: 1.4; text-align: left; padding: 4px 8px;">${isEn ? "No claim conflicts detected. Assign identical claims to two players to trigger a conflict alarm." : "暂无对跳冲突。为多名玩家选择相同角色将在此触发冲突警报。"}</p>`;
    } else {
        collisionListHtml = collisions.map(c => {
            const seatsStr = isEn ? `Seats ${c.seats.join(" & ")}` : `${c.seats.join(" 号 & ")} 号`;
            return `
                <div class="validator-item alert-danger">
                    <span><strong>${getLocalizedRole(c.role)}</strong> (${seatsStr})</span>
                    <span class="validator-badge danger">${isEn ? "Collision" : "对跳"}</span>
                </div>
            `;
        }).join("");
    }

    // 2.2 外来者校验 HTML
    let outsiderStatusClass = "alert-success";
    let outsiderBadgeClass = "success";
    let outsiderStatusText = isEn ? "Normal" : "正常";
    let outsiderDesc = isEn 
        ? `Standard Outsiders: <strong>${standardOutsiders}</strong>, Claimed: <strong>${claimedOutsidersCount}</strong>`
        : `标准外来者: <strong>${standardOutsiders}</strong> 位, 场上已跳: <strong>${claimedOutsidersCount}</strong> 位`;

    if (claimedOutsidersCount > standardOutsiders) {
        outsiderStatusClass = "alert-warning";
        outsiderBadgeClass = "warning";
        outsiderStatusText = isEn ? "Abnormal" : "异常溢出";
        outsiderDesc += isEn 
            ? `<br><span style="font-size:10px; opacity:0.8;">⚠️ Mismatch! Baron bluffing or Drunk role active?</span>`
            : `<br><span style="font-size:10px; opacity:0.8;">⚠️ 溢出！可能存在男爵改配置，或有酒鬼、坏人穿衣服</span>`;
    }

    const outsiderValidatorHtml = `
        <div class="validator-item ${outsiderStatusClass}" style="flex-direction: column; align-items: flex-start; gap: 4px;">
            <div style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
                <span class="validator-badge ${outsiderBadgeClass}">${outsiderStatusText}</span>
            </div>
            <p style="margin: 0; font-size: 11px; line-height: 1.4;">${outsiderDesc}</p>
        </div>
    `;

    // 2.3 幽灵票校验 HTML
    let ghostVoteStatusClass = "alert-neutral";
    let ghostVoteBadgeClass = "neutral";
    let ghostVoteStatusText = isEn ? "0 Active" : "存余 0 张";
    let ghostVoteDesc = "";

    if (totalDeadCount === 0) {
        ghostVoteStatusClass = "alert-success";
        ghostVoteBadgeClass = "success";
        ghostVoteStatusText = isEn ? "All Alive" : "全员存活";
        ghostVoteDesc = isEn 
            ? "No players are dead. Dead players' voting tokens will be tracked here dynamically."
            : "当前无阵亡玩家。出局玩家的幽灵票状态将在此动态追踪。";
    } else {
        if (remainingGhostVotes > 0) {
            ghostVoteStatusClass = "alert-warning";
            ghostVoteBadgeClass = "warning";
        }
        ghostVoteStatusText = isEn ? `${remainingGhostVotes} Active` : `存余 ${remainingGhostVotes} 张`;
        ghostVoteDesc = isEn 
            ? `Available Votes: <strong>${remainingGhostVotes}</strong> / <strong>${totalDeadCount}</strong> Dead`
            : `存余死票: <strong>${remainingGhostVotes}</strong> 张 / 共 <strong>${totalDeadCount}</strong> 位阵亡`;
    }

    const ghostVoteValidatorHtml = `
        <div class="validator-item ${ghostVoteStatusClass}" style="flex-direction: column; align-items: flex-start; gap: 4px;">
            <div style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
                <span class="validator-badge ${ghostVoteBadgeClass}">${ghostVoteStatusText}</span>
            </div>
            <p style="margin: 0; font-size: 11px; line-height: 1.4;">${ghostVoteDesc}</p>
        </div>
    `;

    card.innerHTML = `
        <div class="validator-title-row">
            <div class="validator-title">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--color-accent);">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
                <span>${titleText}</span>
            </div>
        </div>
        <div class="validator-grid">
            <!-- Panel 1: Claim Collisions -->
            <div class="validator-panel">
                <div class="validator-panel-header">
                    <span>${conflictHeader}</span>
                    <span style="opacity: 0.5;">[${collisions.length}]</span>
                </div>
                <div class="validator-list">
                    ${collisionListHtml}
                </div>
            </div>

            <!-- Panel 2: Outsiders Validator -->
            <div class="validator-panel">
                <div class="validator-panel-header">
                    <span>${outsiderHeader}</span>
                </div>
                <div class="validator-list">
                    ${outsiderValidatorHtml}
                </div>
            </div>

            <!-- Panel 3: Ghost Votes -->
            <div class="validator-panel">
                <div class="validator-panel-header">
                    <span>${ghostVoteHeader}</span>
                </div>
                <div class="validator-list">
                    ${ghostVoteValidatorHtml}
                </div>
            </div>
        </div>
    `;
}

