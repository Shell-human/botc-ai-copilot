/* ==========================================================================
   nlpParser.js - 智能语义化分析与自动状态追踪提取器 (NLP Smart Command Parser)
   职责：从自然语言文本中提取游戏事件并更新 gameState
   ========================================================================== */

import { gameState } from '../core/state.js';
import { SCRIPTS_DATA, SCRIPTS_DATA_EN } from '../data/rules.js';
import { notifyStateChange } from '../controllers/gameController.js';

export function parseAndApplyTextEvents(text) {
    if (!text) return;
    
    const currentScript = SCRIPTS_DATA[gameState.scriptName];
    if (!currentScript) return;
    
    const allRolesCn = [...currentScript.townsfolk, ...currentScript.outsider, ...currentScript.minion, ...currentScript.demon];
    const currentScriptEn = SCRIPTS_DATA_EN[gameState.scriptName] || { townsfolk:[], outsider:[], minion:[], demon:[] };
    const allRolesEn = [...currentScriptEn.townsfolk, ...currentScriptEn.outsider, ...currentScriptEn.minion, ...currentScriptEn.demon];
    
    const sentences = text.split(/[,.，。;\n\s+、]+/);
    let hasChanges = false;
    
    sentences.forEach(sentence => {
        if (!sentence.trim()) return;
        
        const seatMatch = sentence.match(/(\d+)[\s-]*号|玩家[\s-]*(\d+)|seat[\s-]*(\d+)/i);
        if (!seatMatch) return;
        
        const seatNum = parseInt(seatMatch[1] || seatMatch[2] || seatMatch[3]);
        if (seatNum < 1 || seatNum > gameState.playerCount) return;
        
        const player = gameState.players.find(p => p.seat === seatNum);
        if (!player) return;
        
        if (/死|亡|出局|阵亡|被处决|die|dead|killed|executed/i.test(sentence) && !/没死|不死|未死|alive|not\s+dead/i.test(sentence)) {
            if (player.alive !== false) {
                player.alive = false;
                hasChanges = true;
                const logMsg = gameState.lang === "en"
                    ? `[NLP Auto] Marked Seat ${seatNum} as Dead`
                    : `[智能同步] 根据输入自动将 ${seatNum} 号标记为死亡状态`;
                gameState.logs.push(logMsg);
                console.log(`💡 [NLP Parser] Auto-updated Seat ${seatNum} to DEAD based on: "${sentence}"`);
            }
        } else if (/活|存活|未死|不死|没死|复活|alive/i.test(sentence)) {
            if (player.alive !== true) {
                player.alive = true;
                hasChanges = true;
                const logMsg = gameState.lang === "en"
                    ? `[NLP Auto] Marked Seat ${seatNum} as Alive`
                    : `[智能同步] 根据输入自动将 ${seatNum} 号标记为存活状态`;
                gameState.logs.push(logMsg);
                console.log(`💡 [NLP Parser] Auto-updated Seat ${seatNum} to ALIVE based on: "${sentence}"`);
            }
        }
        
        if (/中毒|醉酒|drunk|poisoned/i.test(sentence) && !/解毒|恢复|正常|healthy|cured/i.test(sentence)) {
            if (player.poisoned !== true) {
                player.poisoned = true;
                hasChanges = true;
                const logMsg = gameState.lang === "en"
                    ? `[NLP Auto] Marked Seat ${seatNum} as Drunk/Poisoned`
                    : `[智能同步] 根据输入自动将 ${seatNum} 号标记为中毒/醉酒`;
                gameState.logs.push(logMsg);
                console.log(`💡 [NLP Parser] Auto-updated Seat ${seatNum} to POISONED based on: "${sentence}"`);
            }
        } else if (/解毒|恢复|解酒|正常|正常状态|healthy|cured/i.test(sentence)) {
            if (player.poisoned !== false) {
                player.poisoned = false;
                hasChanges = true;
                const logMsg = gameState.lang === "en"
                    ? `[NLP Auto] Cleared Drunk/Poisoned on Seat ${seatNum}`
                    : `[智能同步] 根据输入自动清除了 ${seatNum} 号的中毒/醉酒状态`;
                gameState.logs.push(logMsg);
                console.log(`💡 [NLP Parser] Auto-updated Seat ${seatNum} to HEALTHY based on: "${sentence}"`);
            }
        }
        
        for (let i = 0; i < allRolesCn.length; i++) {
            const cnRole = allRolesCn[i];
            const enRole = allRolesEn[i] || "";
            
            // Try full role name first (exact substring match)
            let matched = new RegExp(cnRole).test(sentence);
            
            // Fuzzy match: try progressively shorter prefixes (min 2 chars)
            // Handles abbreviations like "共情" → "共情者", "占卜" → "占卜师"
            if (!matched && cnRole.length >= 3) {
                for (let len = cnRole.length - 1; len >= 2; len--) {
                    if (new RegExp(cnRole.slice(0, len)).test(sentence)) {
                        matched = true;
                        break;
                    }
                }
            }
            
            // English match
            if (!matched && enRole) {
                matched = new RegExp("\\b" + enRole + "\\b", "i").test(sentence);
            }
            
            if (matched) {
                if (player.claim !== cnRole) {
                    const oldClaim = player.claim;
                    player.claim = cnRole;
                    hasChanges = true;
                    const logMsg = gameState.lang === "en"
                        ? `[NLP Auto] Updated Seat ${seatNum} claim to: ${enRole}`
                        : `[智能同步] 根据输入自动将 ${seatNum} 号的宣称变更为：${cnRole}`;
                    gameState.logs.push(logMsg);
                    console.log(`💡 [NLP Parser] Auto-updated Seat ${seatNum} claim from "${oldClaim}" to "${cnRole}"`);
                }
                break;
            }
        }
    });
    
    if (hasChanges) {
        notifyStateChange();
    }
}
