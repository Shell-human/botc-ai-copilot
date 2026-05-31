/* ==========================================================================
   popoverModal.js - 玩家座位状态编辑浮窗 Modal 组件
   ========================================================================== */

import { ROLE_TRANSLATIONS, TRANSLATIONS } from '../constants.js';
import { gameState, saveToLocalStorage } from '../state.js';
import { dom } from '../dom.js';
import { getLocalizedRole } from '../i18n.js';

import { renderSeatingChart } from './seatingChart.js';
import { renderPlayerList } from './playerList.js';
import { renderTimelineLogs } from './timelineLogs.js';

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
