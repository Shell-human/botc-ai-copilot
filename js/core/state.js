/* ==========================================================================
   core/state.js - 全局运行时状态对象 (Global Runtime State Object)
   职责：仅包含 gameState 数据对象，不包含任何业务逻辑。
   所有操作函数由 controllers/ 层提供。
   ========================================================================== */

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
