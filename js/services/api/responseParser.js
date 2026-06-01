/* ==========================================================================
   responseParser.js - AI 响应解析与 DOM 分发器 (Response Parser)
   职责：解析 AI 回复标签，渲染到 DOM
   ========================================================================== */

import { gameState } from '../../core/state.js';
import { dom } from '../../core/dom.js';
import { parseMarkdown, escapeHtml } from '../../utils.js';

// --- 从 AI 响应中提取 STATE_SYNC JSON 并应用到 gameState ---
export function extractAndApplyStateSync(text) {
    const syncRegex = /=== STATE_SYNC ===\s*([\s\S]*?)(?=\n\n===|\n===|$)/i;
    const match = text.match(syncRegex);
    if (!match) return { cleanText: text, hasChanges: false };
    
    const jsonBlock = match[1].trim();
    // Remove markdown code fences if present
    const jsonStr = jsonBlock.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    const cleanText = text.substring(0, match.index).trim();
    let hasChanges = false;
    
    try {
        const data = JSON.parse(jsonStr);
        if (!data.events || !Array.isArray(data.events) || data.events.length === 0) {
            return { cleanText, hasChanges: false };
        }
        
        data.events.forEach(evt => {
            if (!evt.seat) return;
            const player = gameState.players.find(p => p.seat === evt.seat);
            if (!player) return;
            
            if (evt.claim && player.claim !== evt.claim) {
                const oldClaim = player.claim;
                player.claim = evt.claim;
                hasChanges = true;
                const logMsg = gameState.lang === "en"
                    ? `[AI Sync] Updated Seat ${evt.seat} claim from "${oldClaim}" to "${evt.claim}"`
                    : `[AI 同步] 根据 AI 分析自动将 ${evt.seat} 号宣称从「${oldClaim}」变更为「${evt.claim}」`;
                gameState.logs.push(logMsg);
                console.log(`🤖 [AI State Sync] Seat ${evt.seat} claim: "${oldClaim}" → "${evt.claim}"`);
            }
            
            if (evt.alive !== undefined && player.alive !== evt.alive) {
                player.alive = evt.alive;
                hasChanges = true;
                const statusStr = gameState.lang === "en"
                    ? (evt.alive ? "Alive" : "Dead")
                    : (evt.alive ? "存活" : "死亡");
                const logMsg = gameState.lang === "en"
                    ? `[AI Sync] Marked Seat ${evt.seat} as ${statusStr}`
                    : `[AI 同步] 根据 AI 分析自动将 ${evt.seat} 号标记为${statusStr}`;
                gameState.logs.push(logMsg);
                console.log(`🤖 [AI State Sync] Seat ${evt.seat} alive: ${evt.alive}`);
            }
            
            if (evt.poisoned !== undefined && player.poisoned !== evt.poisoned) {
                player.poisoned = evt.poisoned;
                hasChanges = true;
                const statusStr = gameState.lang === "en"
                    ? (evt.poisoned ? "Poisoned/Drunk" : "Healthy")
                    : (evt.poisoned ? "中毒/醉酒" : "恢复正常");
                const logMsg = gameState.lang === "en"
                    ? `[AI Sync] Marked Seat ${evt.seat} as ${statusStr}`
                    : `[AI 同步] 根据 AI 分析自动将 ${evt.seat} 号标记为${statusStr}`;
                gameState.logs.push(logMsg);
                console.log(`🤖 [AI State Sync] Seat ${evt.seat} poisoned: ${evt.poisoned}`);
            }
        });
    } catch (e) {
        console.warn('⚠️ [AI State Sync] Failed to parse STATE_SYNC JSON:', e.message, '\nRaw:', jsonStr);
    }
    
    return { cleanText, hasChanges };
}

// --- 思考链 HTML 渲染辅助 ---
export function buildThoughtHtml(thoughtText, modelName) {
    return `
        <details class="thinking-process-details glass" style="margin-bottom: 16px; border: 1px solid rgba(160, 66, 255, 0.2); border-radius: 8px; overflow: hidden;">
            <summary style="padding: 8px 12px; cursor: pointer; font-size: 11px; font-weight: 600; color: var(--color-poison); background: rgba(160, 66, 255, 0.05); display: flex; align-items: center; gap: 8px; user-select: none;">
                <i data-lucide="brain-circuit" style="width: 14px; height: 14px; color: var(--color-poison);"></i>
                查看 ${modelName} 深度逻辑推演思考链 (Reasoning Thought Process)
            </summary>
            <div style="padding: 12px; font-size: 11px; color: var(--text-secondary); line-height: 1.6; background: rgba(0, 0, 0, 0.2); font-family: monospace; white-space: pre-wrap; border-top: 1px solid rgba(160, 66, 255, 0.1); max-height: 200px; overflow-y: auto;">${escapeHtml(thoughtText)}</div>
        </details>
    `;
}

// --- 解析并分发 API 响应 ---
export function distributeResponse(text, thoughtHtml = "") {
    console.log("🚨 [DEBUG] === distributeResponse() 开始执行 ===");
    console.log("🚨 [DEBUG] 原始返回文本长度:", text ? text.length : 0);
    
    let memoPart = "";
    let cleanText = text || "";
    
    const memoRegex = /(?:###\s*)?(?:\*\*)?===\s*MEMO\s*===(?:\*\*)?/i;
    const memoMatch = cleanText.match(memoRegex);
    const analysisRegex = /(?:###\s*)?(?:\*\*)?===\s*ANALYSIS\s*===(?:\*\*)?/i;
    const analysisMatch = cleanText.match(analysisRegex);
    
    if (memoMatch && analysisMatch) {
        const startPos = memoMatch.index + memoMatch[0].length;
        const endPos = analysisMatch.index;
        if (endPos > startPos) {
            memoPart = cleanText.substring(startPos, endPos).trim();
            cleanText = cleanText.substring(0, memoMatch.index) + cleanText.substring(analysisMatch.index);
        }
    }

    let analysisPart = "";
    let worldlinesPart = "";
    let tipsPart = "";

    const worldlinesRegex = /(?:###\s*)?(?:\*\*)?===\s*WORLDLINES\s*===(?:\*\*)?/i;
    const tipsRegex = /(?:###\s*)?(?:\*\*)?===\s*TIPS\s*===(?:\*\*)?/i;

    const analysisMatch2 = cleanText.match(analysisRegex);
    const worldlinesMatch = cleanText.match(worldlinesRegex);
    const tipsMatch = cleanText.match(tipsRegex);

    console.log("🚨 [DEBUG] 正则强匹配结果：", {
        analysisMatched: !!analysisMatch2,
        worldlinesMatched: !!worldlinesMatch,
        tipsMatched: !!tipsMatch
    });

    if (analysisMatch2 && worldlinesMatch && tipsMatch) {
        const analysisIdx = analysisMatch2.index;
        const worldlinesIdx = worldlinesMatch.index;
        const tipsIdx = tipsMatch.index;

        const sections = [
            { name: "analysis", start: analysisIdx, end: analysisIdx + analysisMatch2[0].length },
            { name: "worldlines", start: worldlinesIdx, end: worldlinesIdx + worldlinesMatch[0].length },
            { name: "tips", start: tipsIdx, end: tipsIdx + tipsMatch[0].length }
        ];
        
        sections.sort((a, b) => a.start - b.start);

        const getSectionContent = (sectName) => {
            const currentIdx = sections.findIndex(s => s.name === sectName);
            if (currentIdx === -1) return "";
            const current = sections[currentIdx];
            const next = sections[currentIdx + 1];
            const startPos = current.end;
            const endPos = next ? next.start : cleanText.length;
            return cleanText.substring(startPos, endPos).trim();
        };

        analysisPart = getSectionContent("analysis");
        worldlinesPart = getSectionContent("worldlines");
        tipsPart = getSectionContent("tips");
    } else {
        console.log("🚨 [DEBUG] 正则强匹配失败，进入 split 兼容模式分割...");
        const parts = cleanText.split(/===\s*[a-zA-Z]+\s*===/i);
        console.log("🚨 [DEBUG] split 拆分出的 parts.length =", parts.length);
        
        if (parts.length < 4) {
            analysisPart = cleanText;
            const isChatMode = dom.aiChatModeToggle && dom.aiChatModeToggle.checked;
            if (isChatMode) {
                worldlinesPart = `<div class="empty-tab-state"><p>💬 您正处于与 AI 的<b>【对话交流模式】</b>中。<br>此模式下只进行直接对话问答，如需对局局势推理，请关闭对话开关并输入局势进展。</p></div>`;
                tipsPart = `<div class="empty-tab-state"><p>💬 您正处于与 AI 的<b>【对话交流模式】</b>中。<br>常规战术行动建议未触发。如需对局局势推理，请关闭对话开关并输入局势进展。</p></div>`;
            } else {
                worldlinesPart = `<div class="empty-tab-state"><p>AI 未能完全按照标签格式输出。完整的局势推演与分析已全部渲染在第一页中，您可以直接前往通读。</p></div>`;
                tipsPart = `<div class="empty-tab-state"><p>请在【即时分析】页面中查看包含全部战术提示在内的完整推演信息。</p></div>`;
            }
        } else {
            analysisPart = parts[1] || "";
            worldlinesPart = parts[2] || "";
            tipsPart = parts[3] || "";
        }
    }

    console.log("🚨 [DEBUG] 最终段落字符长度：", {
        analysisPartLength: analysisPart.length,
        worldlinesPartLength: worldlinesPart.length,
        tipsPartLength: tipsPart.length
    });

    if (!analysisPart.trim()) {
        analysisPart = `<div class="empty-tab-state"><p>AI 未能正常生成本轮即时局势分析。</p></div>`;
    }
    if (!worldlinesPart.trim()) {
        worldlinesPart = `<div class="empty-tab-state"><p>AI 未能正常生成本轮平行世界线分析。</p></div>`;
    }
    if (!tipsPart.trim()) {
        tipsPart = `<div class="empty-tab-state"><p>AI 未能生成本轮的具体行动建议。建议您阅读【即时分析】页面的全局逻辑推演。</p></div>`;
    }

    let memoHtml = "";
    if (memoPart.trim()) {
        const isEn = gameState.lang === "en";
        const headerTitle = isEn ? "AI Copilot Tactical Memo" : "AI 战术备忘录";
        
        memoHtml = `
            <div class="copilot-memo-card">
                <div class="copilot-memo-header">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle;">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8M8 12h8" />
                    </svg>
                    <span>${headerTitle}</span>
                </div>
                <div class="copilot-memo-list">
                    ${parseMarkdown(memoPart.trim())}
                </div>
            </div>
        `;
    }

    console.log("🚨 [DEBUG] 正在将解析出的 HTML 渲染写入 DOM 元素中...");
    dom.analysisBox.innerHTML = thoughtHtml + memoHtml + parseMarkdown(analysisPart.trim());
    dom.worldlinesBox.innerHTML = parseMarkdown(worldlinesPart.trim());
    dom.tipsBox.innerHTML = parseMarkdown(tipsPart.trim());

    if (typeof lucide !== "undefined" && lucide.createIcons) lucide.createIcons();
}
