/* ==========================================================================
   scriptPreview.js - 剧本板子角色能力对照表浮层组件
   ========================================================================== */

import {
    SCRIPTS_DATA,
    CHARACTER_DETAILS,
    SCRIPTS_DATA_EN,
    CHARACTER_DETAILS_EN
} from '../constants.js';

import { gameState } from '../state.js';
import { dom } from '../dom.js';

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
