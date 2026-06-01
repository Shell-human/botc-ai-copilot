/* ==========================================================================
   playerList.js - 玩家列表快速管理面板组件
   ========================================================================== */

import { gameState } from '../core/state.js';
import { dom } from '../core/dom.js';
import { togglePlayerAlive, togglePlayerPoison } from '../controllers/gameController.js';
import { getLocalizedClaim } from '../i18n/engine.js';
import { openPopover } from './popoverModal.js';

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

    if (typeof lucide !== "undefined" && lucide.createIcons) lucide.createIcons();
}
