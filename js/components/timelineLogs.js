/* ==========================================================================
   timelineLogs.js - 局势信息流水日志视图渲染组件
   ========================================================================== */

import { gameState } from '../core/state.js';
import { dom } from '../core/dom.js';
import { getLocalizedLog } from '../i18n/logTranslator.js';

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
        if (typeof lucide !== "undefined" && lucide.createIcons) lucide.createIcons();
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
