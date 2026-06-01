/* ==========================================================================
   core/dom.js - 全局 DOM 元素缓存引用注册中心
   职责：仅包含 DOM 元素引用，不包含任何操作逻辑。
   ========================================================================== */

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
    consoleInputLabel: document.getElementById("consoleInputLabel"),
    consoleInput: document.getElementById("consoleInput"),
    clearConsoleBtn: document.getElementById("clearConsoleBtn"),
    analyzeBtn: document.getElementById("analyzeBtn"),
    tabButtons: document.querySelectorAll(".tab-btn"),
    tabContents: document.querySelectorAll(".tab-content"),
    analysisBox: document.getElementById("analysisBox"),
    tipsBox: document.getElementById("tipsBox"),
    chatBox: document.getElementById("chatBox"),
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
    langToggleText: document.getElementById("langToggleText"),

    // 校验器卡片容器（仅 deductiveValidator.js 使用，纳入统一管理）
    deductiveValidatorCard: document.getElementById("deductiveValidatorCard"),
};

/**
 * 校验 DOM 元素引用，如有缺失或未渲染成功的元素，在控制台输出警告提示，极大方便日常调试。
 */
export function validateDomReferences() {
    console.log("🔍 [DOM Registry] 开始验证 DOM 元素引用...");
    let missingCount = 0;
    
    Object.entries(dom).forEach(([key, element]) => {
        if (!element || (element instanceof NodeList && element.length === 0)) {
            console.warn(`⚠️ [DOM Registry] 缺失 DOM 元素引用: '${key}' (在 HTML 页面中未找到对应 ID 或 Selector)`);
            missingCount++;
        }
    });
    
    if (missingCount === 0) {
        console.log("✅ [DOM Registry] 所有 DOM 元素引用成功通过验证！");
    } else {
        console.warn(`⚠️ [DOM Registry] 验证完毕：共发现 ${missingCount} 处缺失的 DOM 引用，请核对 HTML 文件相应 ID。`);
    }
}

