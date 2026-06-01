/* ==========================================================================
   api.js - AI 战术副驾驶接口网关调用与多维度平行世界线响应分发
   ========================================================================== */

import {
    GAME_DISTRIBUTIONS,
    SCRIPTS_DATA,
    SCRIPTS_DATA_EN,
    CHARACTER_DETAILS,
    CORE_LOGIC_RULES,
    CORE_LOGIC_RULES_EN
} from './data/rules.js';

import {
    ROLE_TRANSLATIONS,
    TRANSLATIONS
} from './data/translations.js';

import {
    gameState,
    saveToLocalStorage,
    parseAndApplyTextEvents
} from './state.js';

import { dom } from './dom.js';
import { getLocalizedLog, resetAnalysisBoxes } from './i18n.js';
import { parseMarkdown } from './utils.js';
import { renderTimelineLogs } from './components/timelineLogs.js';

export async function handleAiAnalysis() {
    console.log("🚨 [DEBUG] === handleAiAnalysis() 开始执行 ===");
    const rawText = dom.consoleInput.value.trim();
    const isChatMode = dom.aiChatModeToggle && dom.aiChatModeToggle.checked;
    const apiKey = dom.apiKeyInput.value.trim() || gameState.apiKey;
    const provider = gameState.apiProvider || "gemini";
    const baseUrl = gameState.apiBaseUrl || "https://api.openai.com/v1";
    let model = gameState.aiModel || "gemini-flash-latest";

    console.log("🚨 [DEBUG] 采集到的基本参数：", {
        rawText,
        apiKeyExists: !!apiKey,
        apiKeyStart: apiKey ? apiKey.substring(0, 6) : "None",
        provider,
        baseUrl,
        model
    });

    // 优雅兼容用户拼写习惯 gemini-flash-lastest -> gemini-flash-latest
    if (model === "gemini-flash-lastest") {
        model = "gemini-flash-latest";
    }

    // 离线拦截逻辑：断网防崩溃数据安全暂存
    if (!navigator.onLine) {
        console.log("🚨 [DEBUG] 检测到处于离线状态！数据暂存。");
        if (rawText) {
            const tempLog = gameState.lang === "en" ? `Day progress updates (cached): "${rawText}"` : `白天进展陈述(暂存)："${rawText}"`;
            gameState.logs.push(tempLog);
            renderTimelineLogs();
            dom.consoleInput.value = "";
        }
        saveToLocalStorage();
        const offlineAlertMsg = TRANSLATIONS[gameState.lang]?.offlineAlert || "检测到您目前处于离线状态！已为您将当前白天局势安全保存在本地。等您重新连接网络后，直接点击【发送给AI分析局势】即可恢复网络并发送线上演练。";
        alert(offlineAlertMsg);
        resetAnalysisBoxes();
        return;
    }

    const isLocalhost = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
    console.log("🚨 [DEBUG] 本地服务器判定 isLocalhost =", isLocalhost);
    
    if (!apiKey && !isLocalhost) {
        console.log("🚨 [DEBUG] 缺失 API Key，拦截。");
        const missingKeyMsg = TRANSLATIONS[gameState.lang]?.apiKeyMissingAlert || "请输入有效的 API Key 以启用分析！";
        alert(missingKeyMsg);
        const apiKeyDetails = document.getElementById("apiKeyDetails");
        if (apiKeyDetails) apiKeyDetails.open = true;
        dom.apiKeyInput.focus();
        return;
    }

    // 1. 如果有输入输入框，且不是对话模式，才追加到日志中
    if (rawText && !isChatMode) {
        // 先触发智能语义提取与自动状态追踪同步
        parseAndApplyTextEvents(rawText);
        
        gameState.logs.push(`白天进展陈述："${rawText}"`);
        renderTimelineLogs();
        dom.consoleInput.value = ""; // 清空
        saveToLocalStorage();
    } else if (rawText && isChatMode) {
        parseAndApplyTextEvents(rawText);
        dom.consoleInput.value = ""; // 对话模式直接清空输入框，但不加进事件日志
        saveToLocalStorage();
    }

    // 模型友好名称映射，用于加载文案
    const modelNameMap = {
        "gemini-flash-latest": "Gemini Flash (最新动态版)",
        "gemini-3.5-flash": "Gemini 3.5 Flash (闪电旗舰)",
        "gemini-3.1-pro-preview": "Gemini 3.1 Pro (推理旗舰)",
        "gpt-5.5": "GPT-5.5 Flagship (核心旗舰)",
        "gpt-5.4": "GPT-5.4 Standard (标准版旗舰)",
        "gpt-5.4-mini": "GPT-5.4 Mini (高速度轻量版)",
        "claude-opus-4-8": "Claude Opus 4.8 (终极智能旗舰)",
        "claude-sonnet-4-6": "Claude Sonnet 4.6 (深度推理平衡版)",
        "deepseek-v4-pro": "DeepSeek V4 Pro (MoE推理旗舰)",
        "deepseek-v4-flash": "DeepSeek V4 Flash (极速MoE旗舰)",
        "qwen3.7-max": "通义千问 Qwen 3.7 Max (商业旗舰)",
        "glm-5.1": "智谱 GLM-5.1 (本土最强MoE旗舰)",
        "doubao-seed-2-0-pro-260215": "火山引擎 Doubao Seed 2.0 Pro",
        "kimi-k2.6": "月之暗面 Kimi K2.6 (高并发Swarm)",
        "ernie-5.1": "百度文心一言 ERNIE 5.1 (中文搜索推理旗舰)"
    };
    const friendlyModelName = modelNameMap[model] || model;

    // 2. 界面显示非阻塞且完全不阻挡文字阅读与滚动的双重进度状态 (头部流光进度条 + 角部悬浮小药丸)
    console.log("🚨 [DEBUG] 正在注入流光进度条与悬浮状态指示器...");
    
    // 清理已存在的旧遮罩（防重叠）
    document.querySelectorAll(".ai-loading-overlay, .ai-progress-bar, .ai-floating-status-badge").forEach(el => el.remove());
    
    const progressBarHtml = `
        <div class="ai-progress-bar">
            <div class="ai-progress-bar-fill"></div>
        </div>
    `;
    
    const floatingBadgeHtml = `
        <div class="ai-floating-status-badge">
            <div class="spinner-glow-mini"></div>
            <span>${friendlyModelName} 正在推演局势...</span>
        </div>
    `;
    
    const tabContainer = document.querySelector(".tab-content-container");
    if (tabContainer) {
        tabContainer.insertAdjacentHTML("afterbegin", progressBarHtml);
        tabContainer.insertAdjacentHTML("beforeend", floatingBadgeHtml);
    }

    // 3. 构建 Prompt
    console.log("🚨 [DEBUG] 正在构建 AI 提示词...");
    const prompt = constructPrompt(rawText, isChatMode);
    console.log("🚨 [DEBUG] 提示词构建完毕，长度为:", prompt.length);

    try {
        console.log("🚨 [DEBUG] 进入 API 请求 try 块...");
        // 更新 API 指示灯状态
        dom.apiStatusIndicator.className = "status-indicator online animate-pulse";
        dom.apiStatusText.textContent = `正在调用 ${friendlyModelName}...`;

        let reply = "";
        let thoughtHtml = "";

        if (provider === "gemini") {
            const reqBody = {
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ],
                generationConfig: {}
            };

            const supportsThinkingConfig = model.includes("3.5") || model.includes("3.1") || model.includes("2.5") || model === "gemini-flash-latest";
            if (supportsThinkingConfig) {
                reqBody.generationConfig.thinkingConfig = {
                    thinkingBudget: 2048
                };
            } else {
                reqBody.generationConfig.temperature = 0.2;
            }

            const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            console.log("🚨 [DEBUG] 正在请求 Gemini 官方接口，URL:", targetUrl.substring(0, 100) + "...[Key Hidden]");
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reqBody)
            });

            if (!response.ok) {
                const errText = await response.text();
                console.log("🚨 [DEBUG] Gemini 响应非 OK:", response.status, errText);
                throw new Error(`Gemini API 错误 (${response.status}): ${errText}`);
            }

            const data = await response.json();
            console.log("🚨 [DEBUG] Gemini 成功返回数据:", data);
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("Gemini API 未能返回候选内容，请核对 API 密钥是否有效。");
            }

            const parts = data.candidates[0].content.parts;
            console.log("🚨 [DEBUG] Gemini 候选正文部件 parts count:", parts.length);
            
            const finalParts = parts.filter(p => !p.thought);
            reply = finalParts.map(p => p.text).join('\n');
            console.log("🚨 [DEBUG] 拼接后最终 reply 长度为:", reply.length);

            const thoughtPart = parts.find(p => p.thought);
            if (thoughtPart && thoughtPart.text.trim()) {
                console.log("🚨 [DEBUG] 发现思考链 thoughtPart 长度:", thoughtPart.text.trim().length);
                thoughtHtml = buildThoughtHtml(thoughtPart.text.trim(), friendlyModelName);
            }

        } else if (provider === "claude" && baseUrl.includes("anthropic.com")) {
            let cleanBaseUrl = baseUrl.trim();
            if (cleanBaseUrl.endsWith("/")) {
                cleanBaseUrl = cleanBaseUrl.slice(0, -1);
            }

            const response = await fetch(`${cleanBaseUrl}/messages`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'dangerously-allow-browser': 'true'
                },
                body: JSON.stringify({
                    model: model === "custom" ? gameState.apiModelCustom : model,
                    max_tokens: 4000,
                    messages: [
                        { role: "user", content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Claude API 错误 (${response.status}): ${errText}`);
            }

            const data = await response.json();
            if (!data.content || data.content.length === 0) {
                throw new Error("Claude API 未能返回有效正文。");
            }
            reply = data.content[0].text || "";
        } else {
            let cleanBaseUrl = baseUrl.trim();
            if (cleanBaseUrl.endsWith("/")) {
                cleanBaseUrl = cleanBaseUrl.slice(0, -1);
            }

            const headers = {
                'Content-Type': 'application/json'
            };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const reqBody = {
                model: model === "custom" ? gameState.apiModelCustom : model,
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.2
            };

            const response = await fetch(`${cleanBaseUrl}/chat/completions`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(reqBody)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API 兼容网关错误 (${response.status}): ${errText}`);
            }

            const data = await response.json();
            if (!data.choices || data.choices.length === 0) {
                throw new Error("API 未能返回候选对话，请核对 Key 与基地址。");
            }

            const message = data.choices[0].message;
            let rawContent = message.content || "";
            let reasoningContent = message.reasoning_content || "";

            if (rawContent.includes("<think>") && rawContent.includes("</think>")) {
                const thinkStart = rawContent.indexOf("<think>");
                const thinkEnd = rawContent.indexOf("</think>");
                if (thinkEnd > thinkStart) {
                    const extractedThought = rawContent.substring(thinkStart + 7, thinkEnd).trim();
                    if (extractedThought) {
                        reasoningContent = extractedThought;
                    }
                    rawContent = rawContent.substring(0, thinkStart) + rawContent.substring(thinkEnd + 8);
                }
            }

            reply = rawContent.trim();
            if (reasoningContent.trim()) {
                thoughtHtml = buildThoughtHtml(reasoningContent.trim(), friendlyModelName);
            }
        }
        
        // 4. 解析 AI 回复并分发到不同选项卡
        distributeResponse(reply, thoughtHtml);

        // 移除所有加载遮罩与进度指示，使新内容直接显现
        document.querySelectorAll(".ai-loading-overlay, .ai-progress-bar, .ai-floating-status-badge").forEach(el => el.remove());

        // 将 AI 本次输出存入本地缓存的历史记录中（用于掉线重连或连续轮次推演时提供前后连贯记忆）
        if (!gameState.aiOutputs) {
            gameState.aiOutputs = [];
        }
        gameState.aiOutputs.push({
            type: isChatMode ? "chat" : "analysis",
            input: rawText,
            output: reply,
            timestamp: Date.now()
        });

        // 恢复状态指示灯
        dom.apiStatusIndicator.className = "status-indicator online";
        dom.apiStatusText.textContent = `${friendlyModelName} 已就绪`;

        // 保存对局进度至本地 (包含最新的 AI 分析结果和 AI 历史记忆)
        saveToLocalStorage();

    } catch (error) {
        console.error("AI 分析时出错:", error);
        
        // 异常情况下也清理加载遮罩与进度状态，恢复原始状态
        document.querySelectorAll(".ai-loading-overlay, .ai-progress-bar, .ai-floating-status-badge").forEach(el => el.remove());
        
        dom.apiStatusIndicator.className = "status-indicator error";
        dom.apiStatusText.textContent = "API 调用失败";

        // 弹窗提示具体报错，方便本地调试定位问题所在
        alert("🚨 AI 调试错误提示：\n" + error.message + "\n\n请检查网络、API Key 格式及接口地址是否正确。");

        const errorHtml = `
            <div class="ai-welcome" style="color: var(--color-evil);">
                <i data-lucide="alert-triangle" style="width: 32px; height: 32px; color: var(--color-evil);"></i>
                <h3>API 调用发生错误</h3>
                <p>${error.message}</p>
                <p style="font-size: 11px; color: var(--text-muted);">提示：请检查网络连接、API 密钥以及接口基地址 (Base URL) 是否正确。</p>
            </div>
        `;
        dom.analysisBox.innerHTML = errorHtml;
        dom.worldlinesBox.innerHTML = errorHtml;
        dom.tipsBox.innerHTML = errorHtml;
        lucide.createIcons();
    }
}

// --- 思考链 HTML 渲染辅助 ---
export function buildThoughtHtml(thoughtText, modelName) {
    return `
        <details class="thinking-process-details glass" style="margin-bottom: 16px; border: 1px solid rgba(160, 66, 255, 0.2); border-radius: 8px; overflow: hidden;">
            <summary style="padding: 8px 12px; cursor: pointer; font-size: 11px; font-weight: 600; color: var(--color-poison); background: rgba(160, 66, 255, 0.05); display: flex; align-items: center; gap: 8px; user-select: none;">
                <i data-lucide="brain-circuit" style="width: 14px; height: 14px; color: var(--color-poison);"></i>
                查看 ${modelName} 深度逻辑推演思考链 (Reasoning Thought Process)
            </summary>
            <div style="padding: 12px; font-size: 11px; color: var(--text-secondary); line-height: 1.6; background: rgba(0, 0, 0, 0.2); font-family: monospace; white-space: pre-wrap; border-top: 1px solid rgba(160, 66, 255, 0.1); max-height: 200px; overflow-y: auto;">${thoughtText}</div>
        </details>
    `;
}

// --- 构建 Prompt ---
export function constructPrompt(consoleText, isChat = false) {
    const currentScript = SCRIPTS_DATA[gameState.scriptName];
    const scriptDetails = CHARACTER_DETAILS[gameState.scriptName] || {};
    
    const townsfolkDesc = currentScript.townsfolk.map(r => `- ${r}: ${scriptDetails[r] || ''}`).join('\n');
    const outsiderDesc = currentScript.outsider.map(r => `- ${r}: ${scriptDetails[r] || ''}`).join('\n');
    const minionDesc = currentScript.minion.map(r => `- ${r}: ${scriptDetails[r] || ''}`).join('\n');
    const demonDesc = currentScript.demon.map(r => `- ${r}: ${scriptDetails[r] || ''}`).join('\n');
    
    const dist = GAME_DISTRIBUTIONS[gameState.playerCount] || { townsfolk: "?", outsider: "?", minion: "?", demon: "?" };
    const baseDistStrZh = `场上标准配置：${dist.townsfolk} 镇民, ${dist.outsider} 外来者, ${dist.minion} 爪牙, ${dist.demon} 恶魔`;
    const baseDistStrEn = `Standard configuration: ${dist.townsfolk} Townsfolk, ${dist.outsider} Outsiders, ${dist.minion} Minions, 1 Demon`;

    // Filter confirmed teammates marked as 'evil' in the seating chart popovers (excluding self)
    const teammates = gameState.players.filter(p => p.alignment === 'evil' && p.seat !== gameState.mySeat);

    // 玩家数据结构化描述
    let playerStatuses = "";
    if (gameState.lang === "en") {
        playerStatuses = gameState.players.map(p => {
            const statusStr = p.alive ? 'Alive' : '❌ Dead';
            const poisonStr = p.poisoned ? 'Yes' : 'No';
            const alignmentStr = p.alignment === 'good' ? 'Good' : (p.alignment === 'evil' ? 'Evil' : 'Unknown');
            const roleNameEn = p.claim === '未知' ? 'Unknown' : (ROLE_TRANSLATIONS[p.claim] || p.claim);
            return `- [Seat ${p.seat}] Name: ${p.name}, Status: ${statusStr}, Claimed Character: ${roleNameEn}, Suspected Alignment: ${alignmentStr}, Drunk/Poisoned: ${poisonStr}, Notes: ${p.note || 'None'}`;
        }).join('\n');
    } else {
        playerStatuses = gameState.players.map(p => {
            const alignStr = p.alignment === 'good' ? '善良' : (p.alignment === 'evil' ? '邪恶' : '未知');
            return `- [座位 ${p.seat}] 姓名: ${p.name}, 状态: ${p.alive ? '存活' : '❌ 死亡'}, 宣称身份: ${p.claim}, 判定阵营: ${alignStr}, 中毒标记: ${p.poisoned ? '是' : '否'}, 备注: ${p.note || '无'}`;
        }).join('\n');
    }

    // 日志信息描述
    let gameLogs = "";
    if (gameState.lang === "en") {
        gameLogs = gameState.logs.map((log, idx) => `[Event ${idx+1}] ${getLocalizedLog(log, "en")}`).join('\n');
    } else {
        gameLogs = gameState.logs.map((log, idx) => `[第 ${idx+1} 条事件] ${getLocalizedLog(log, "zh")}`).join('\n');
    }

    // AI 历史输出及对话记忆描述 (仅包含最后 6 次交互，防 Token 溢出，保障响应速度)
    let aiHistoryPrompt = "";
    if (gameState.aiOutputs && gameState.aiOutputs.length > 0) {
        const historyToInclude = gameState.aiOutputs.slice(-6);
        if (gameState.lang === "en") {
            aiHistoryPrompt = "\n=== PREVIOUS AI ASSISTANT OUTPUTS & CONVERSATION HISTORY ===\n" + 
                historyToInclude.map((item, idx) => {
                    const typeStr = item.type === "chat" ? "Direct Q&A Chat" : "Round Seating Deduction";
                    return `[Memory ${idx+1}] Interaction Type: ${typeStr}\n- User Input: "${item.input}"\n- Your Previous Response:\n${item.output}\n---`;
                }).join('\n\n') + "\n\n(Use the above history to maintain consistency, memory, and flow. Do not contradict your previous statements unless new hard evidence disproves them.)\n";
        } else {
            aiHistoryPrompt = "\n=== 历史 AI 战术副驾驶推演与对话记忆 ===\n" + 
                historyToInclude.map((item, idx) => {
                    const typeStr = item.type === "chat" ? "自由提问对话" : "局势进展推演";
                    return `[历史记忆 ${idx+1}] 交互类型: ${typeStr}\n- 用户输入: "${item.input}"\n- 你当时的回复输出:\n${item.output}\n---`;
                }).join('\n\n') + "\n\n（请务必参考上述历史输出，保持战术建议与前序推演的一致性与连贯性。除非出现硬性的新证据或局势剧变，否则请不要否定自己之前的结论。）\n";
        }
    }

    let systemRolePrompt = "";
    let setupPrompt = "";
    if (gameState.lang === "en") {
        const myRoleEn = ROLE_TRANSLATIONS[gameState.myRole] || gameState.myRole;
        if (isChat) {
            systemRolePrompt = `You are an extremely experienced Blood on the Clocktower logician and strategic mastermind. You are acting as the "AI Tactical Copilot" for Player ${gameState.mySeat} (real role: ${myRoleEn}, alignment: ${gameState.myAlignment === 'evil' ? 'Evil' : 'Good'}).
【Chat Mode】IMPORTANT:
The user is asking you a direct question / chatting with you.
Please reply directly and conversationally in a professional strategy advisor style. **DO NOT** include the '=== ANALYSIS ===', '=== WORLDLINES ===', or '=== TIPS ===' tags in your response. Just write a comprehensive, highly strategic reply directly in Markdown.
Focus 100% on answering the user's specific query: "${consoleText}". You have the current game config below for reference.`;
            setupPrompt = `- My Real Role: ${myRoleEn} (${gameState.myAlignment === 'evil' ? 'Evil Team' : 'Good Team'})\n- Standard Character Distribution: ${baseDistStrEn}\n- Active Mode: Direct Chat / Q&A\n- User Query: ${consoleText}`;
        } else if (gameState.myAlignment === "evil") {
            const bluffsStr = gameState.evilBluffs.length > 0 ? gameState.evilBluffs.map(b => ROLE_TRANSLATIONS[b] || b).join(', ') : "None declared";
            const teammatesStr = teammates.map(t => `Seat ${t.seat} (${t.name || 'Unnamed'}, Claimed: ${ROLE_TRANSLATIONS[t.claim] || t.claim})`).join(', ') || "No teammates marked yet in the seating chart";
            systemRolePrompt = `You are an extremely experienced Blood on the Clocktower logician and strategic mastermind. You are acting as the "AI Tactical Copilot" for Player ${gameState.mySeat} (real role: ${myRoleEn}, alignment: Evil).
The Storyteller gave you 3 Demon Bluffs (roles definitely NOT in play): [${bluffsStr}].
【Evil Teammates Hard Constraints】IMPORTANT:
Since your alignment is Evil, the user has explicitly marked their confirmed teammates on the seating chart: [${teammatesStr}].
Please strictly follow these logical constraints during deduction:
1. **DO NOT** analyze, suspect, or speculate whether other unmarked players are your teammates (unless active roles like Bounty Hunter, Politician, or Snake Charmer swap alignments mid-game. Otherwise, all other players are strictly considered Good).
2. Treat the marked players as 100% confirmed Evil teammates. Focus entirely on how to claim and utilize the 3 Bluffs to coordinate team bluffs, validate teammates, transfer blame, and frame Good players. Do not waste space questioning who your teammates are.
Please analyze the game from the absolute perspective of the Evil team (Demons and Minions):
- Guide them on how to claim and utilize these 3 Bluffs to cooperate with Evil teammates.
- Suggest strategic options for framing Good players, validating Evil teammates, and fabricating false information!
- Deduce which claims from Good players are real, and highlight logical contradictions to exploit.`;
            setupPrompt = `- My Real Role: ${myRoleEn} (Evil Team)\n- Standard Character Distribution: ${baseDistStrEn}\n- 3 Demon Bluffs from Storyteller: ${bluffsStr}\n- Confirmed Evil Teammates: ${teammatesStr}`;
        } else {
            systemRolePrompt = `You are an extremely experienced Blood on the Clocktower logician and strategic mastermind. You are acting as the "AI Tactical Copilot" for Player ${gameState.mySeat} (real role: ${myRoleEn}, alignment: Good).
Please analyze the game from the absolute perspective of the Good team, helping them spot logical contradictions, identify deceitful claims, and locate the hidden Demon and Minions.
You should leverage the standard player count distribution (${baseDistStrEn}) combined with active claims to execute deduction by elimination.`;
            setupPrompt = `- My Real Role: ${myRoleEn} (Good Team)\n- Standard Character Distribution: ${baseDistStrEn}`;
        }
    } else {
        if (isChat) {
            systemRolePrompt = `你是一名极其资深的《血染钟楼》逻辑学家、顶尖博弈大宗师。你正在作为一名玩家（即玩家 ${gameState.mySeat} 号，实际身份为【${gameState.myAlignment === 'evil' ? '邪恶阵营' : '善良阵营'}】的 ${gameState.myRole}）的“AI战术副驾驶”帮助他解答规则问题，或者提供实时的个人角色打法与策略选择。
【对话模式】重要限制：
当前用户是以【对话交流/提问模式】在向你发起提问。
请直接、自然、亲切地用第一人称对话形式来回答他的问题，**绝对不要**在回复中包含 \`=== ANALYSIS ===\`、\`=== WORLDLINES ===\`、\`=== TIPS ===\` 这三个分类标签！直接在 Markdown 中给出一份详实、深入且充满战术智慧的直接回答即可！
回答时你可以参考下面的当前游戏配置和状态，但要100%集中于精准地解答用户的问题：“${consoleText}”。`;
            setupPrompt = `- 我的真实身份：${gameState.myRole}（${gameState.myAlignment === 'evil' ? '【邪恶阵营】' : '善良阵营'}）\n- 游戏人数角色标准分布：${baseDistStrZh}\n- 当前处于：与 AI 自由提问对话模式\n- 用户对话问题：${consoleText}`;
        } else if (gameState.myAlignment === "evil") {
            const bluffsStr = gameState.evilBluffs.length > 0 ? gameState.evilBluffs.join('、') : "未填报";
            const teammatesStr = teammates.map(t => `${t.seat}号玩家 (${t.name || '未命名'}, 宣称: ${t.claim})`).join('、') || "暂未在座位图中标记其他邪恶队友";
            systemRolePrompt = `你是一名极其资深的《血染钟楼》逻辑学家、顶尖博弈高手。你正在作为一名玩家（即玩家 ${gameState.mySeat} 号，实际身份为【邪恶阵营】的 ${gameState.myRole}）的“AI战术副驾驶”帮助他和邪恶同伴打配合、欺骗好人阵营、混淆视听并获得最终胜利。
说书人在首夜分配给他的 3 个【好人伪装身份 (Bluffs，场上绝对不在场的好人角色)】是：【${bluffsStr}】。
【邪恶同盟已知约束】重要：
由于你是【邪恶阵营】，用户已经在座位图中明确标出了目前已确认的邪恶队友：【${teammatesStr}】。
在进行推演时，请务必遵守以下硬性逻辑：
1. **绝对不要**分析、猜测或假设其他任何玩家（不在该队友列表中的玩家）是否是你的邪恶队友（除非存在赏金猎人转换、政客、蛇发等可能中途变换阵营的角色，否则默认其他玩家全为好人）。
2. 将列表中标记的同盟视为 100% 确信的邪恶队友。你的任务是提供最完美的团队协作建议（谁扮演什么伪装、如何打配合相互做高身份、怎么转移焦点），而不是在己方阵营内瞎猜队友。
请务必站在邪恶阵营（恶魔或爪牙）的视角进行策略分析：
- 指导他如何巧妙地“穿”这 3 件伪装皮肤，协助时间和他的邪恶队友进行高水准的身份伪装配合。
- 提供抹黑好人、抗推好人、做高同伴身份、伪造假信息的最佳阴险战术！
- 分析哪些好人的宣称是真实的，哪些是我们可以利用逻辑漏洞击破的！`;
            setupPrompt = `- 我的真实身份：${gameState.myRole}（【邪恶阵营】）\n- 游戏人数角色标准分布：${baseDistStrZh}\n- 说书人给的 3 个好人伪装 (Bluffs)：${bluffsStr}\n- 已确认的邪恶队友：${teammatesStr}`;
        } else {
            systemRolePrompt = `你是一名极其资深的《血染钟楼》逻辑学家、顶尖博弈高手。你正在作为一名玩家（即玩家 ${gameState.mySeat} 号，真实身份为【善良阵营】的 ${gameState.myRole}）的“AI战术副驾驶”帮助他梳理局势、检测逻辑冲突并找出隐藏的恶魔与爪牙。
请站在善良阵营的绝对立场，帮他寻找逻辑漏洞，防备邪恶阵营的欺骗！你可以结合该游戏人数的【标准配置人数分布（${baseDistStrZh}）】和场上起跳外来者、爪牙的数量，来进行排除法推演。`;
            setupPrompt = `- 我的真实身份：${gameState.myRole}（善良阵营）\n- 游戏人数角色标准分布：${baseDistStrZh}`;
        }
    }

    if (isChat) {
        if (gameState.lang === "en") {
            return `
${systemRolePrompt}
Current Script: "${currentScript.name || gameState.scriptName}".

=== BOTC CORE DEDUCTION LAWS ===
${CORE_LOGIC_RULES_EN}

Character descriptions in this script (use these definitions for logical constraints):
Townsfolk:
${townsfolkDesc}

Outsiders:
${outsiderDesc}

Minions:
${minionDesc}

Demons:
${demonDesc}

=== Game Configuration ===
- Total Players: ${gameState.playerCount}
- My Seat: Player ${gameState.mySeat}
${setupPrompt}

=== Player Statuses ===
${playerStatuses}

=== Game Logs ===
${gameLogs}
${aiHistoryPrompt}

---
【USER DIRECT QUERY】: "${consoleText}"
Please answer my question directly and conversationally in Markdown. Feel free to use lists, bold text, and clear formatting. Do NOT output any tags like === ANALYSIS === or similar.
`;
        } else {
            return `
${systemRolePrompt}
目前我们正在进行的游戏剧本是：《${currentScript.name}》。

=== 血染钟楼核心推理钢性法则 ===
${CORE_LOGIC_RULES}

该剧本包含的角色及其具体能力定义：
村民角色定义：
${townsfolkDesc}

外来者角色定义：
${outsiderDesc}

爪牙角色定义：
${minionDesc}

恶魔角色定义：
${demonDesc}

=== 当前游戏基础配置 ===
- 玩家总人数：${gameState.playerCount} 人
- 我的座位：${gameState.mySeat} 号
${setupPrompt}

=== 当前场上所有玩家状态信息 ===
${playerStatuses}

=== 截至目前发生的事件日志记录 ===
${gameLogs}
${aiHistoryPrompt}

---
【用户直接对话提问】："${consoleText}"
请针对我的提问给予直接、深度、充满战术博弈智慧的详细解答。请直接用精美的 Markdown 格式输出，可以使用列表、粗体、分割线和图标。绝对不要输出任何形如 === ANALYSIS === 的分隔标签！
`;
        }
    }

    if (gameState.lang === "en") {
        return `
${systemRolePrompt}
Current Script: "${currentScript.name || gameState.scriptName}".

=== BOTC CORE DEDUCTION LAWS ===
${CORE_LOGIC_RULES_EN}

Character descriptions in this script (use these definitions for logical constraints):
Townsfolk:
${townsfolkDesc}

Outsiders:
${outsiderDesc}

Minions:
${minionDesc}

Demons:
${demonDesc}

Please perform constraint solving and parallel worldline deductions based on character abilities and game state.

=== Game Configuration ===
- Total Players: ${gameState.playerCount}
- My Seat: Player ${gameState.mySeat}
${setupPrompt}

=== Player Statuses ===
${playerStatuses}

=== Game Logs ===
${gameLogs}
${aiHistoryPrompt}

---
Please provide depth analysis based on the latest update: "${consoleText}".
For an optimal user experience, you MUST strictly format your response using these four exact tags:

=== MEMO ===
Provide exactly 3 highly condensed bullet points summarizing the tactical situation:
- **[Game Point]**: E.g. Day 2, 8 players alive, standard execution window.
- **[Faultline]**: E.g. Seat 2 Empath's '1' contradicts Seat 5 Chef's '0' if Seat 3 is the Poisoner.
- **[Next Step]**: E.g. Private chat Seat 2 to verify their Empath claim.

=== ANALYSIS ===
Provide instant analysis here.
Guidelines:
1. Analyze the new update "${consoleText}". Detail contradictions and logical clashes with previous claims.
2. Consider spatial layout (neighbor changes due to death, Empath's new neighbors, Tea Lady protection network, etc.).
3. Identify any logical anomalies.

=== WORLDLINES ===
Perform parallel worldline deductions. Explore at least three scenarios:
1. [Normal Worldline]: No Vortox, no poisoning/drunkenness. If all info is true, who is the most likely Demon? Who is Evil claiming a fake role?
2. [Vortox Worldline]: If the Demon is a Vortox, all Townsfolk information MUST be FALSE. What does this reveal? Who is most likely Vortox? (Highlight that if no one is executed by day, Vortox wins automatically).
3. [Poisoned/Drunk Worldline]: Is a No-Dashi poisoning neighbors? Is a Poisoner/Ceranovus/Puzzlemaster active? If someone is drunk/poisoned, who is the most likely target and what info is compromised?

=== TIPS ===
Provide tactical suggestions and survival tips.
Guidelines:
1. Tactical Actions: I am a ${gameState.myRole} (${gameState.myAlignment === 'evil' ? 'Evil Team' : 'Good Team'}). Who should I private chat today to verify or hide alignment? What voting strategies should we pursue today, or whom should we nominate/frame?
2. Address script-specific dynamics (e.g. how to handle the ${currentScript.demon[0]} demon, Minion-Townsfolk power struggles).
3. Conclude with a concise one-line tactical takeaway.

[CRITICAL FORMATTING REQUIREMENT]
Do NOT merge or omit these tags. Each section must start with the exact tag (=== MEMO ===, === ANALYSIS ===, === WORLDLINES ===, === TIPS ===) on a new line!
Render all content in premium, clean English Markdown. Use bolding and lists appropriately for readability.
`;
    }

    return `
${systemRolePrompt}
目前我们正在进行的游戏剧本是：《${currentScript.name}》。

=== 血染钟楼核心推理钢性法则 ===
${CORE_LOGIC_RULES}

该剧本包含的角色及其具体能力定义（注意：在不同的剧本中，相同角色的具体能力和配置可能有微调差异，请以此为准）：
村民角色定义：
${townsfolkDesc}

外来者角色定义：
${outsiderDesc}

爪牙角色定义：
${minionDesc}

恶魔角色定义：
${demonDesc}

请根据该剧本的所有角色能力逻辑，对当前对局做深度约束逻辑求解（Constraint Solving）与多平行世界推演。

=== 当前游戏基础配置 ===
- 玩家总人数：${gameState.playerCount} 人
- 我的座位：${gameState.mySeat} 号
${setupPrompt}

=== 当前场上所有玩家状态信息 ===
${playerStatuses}

=== 截至目前发生的事件日志记录 ===
${gameLogs}
${aiHistoryPrompt}

---
请帮我根据最新的变化“${consoleText}”，输出四个模块的分析。
为了让我极高体验地使用，请严格按照以下四个标签标记划分你的输出：

=== MEMO ===
用极其精炼的语言提供刚好 3 行（加粗前缀）的战局核心备忘录：
- **【当前死活线】**：例如：第 2 天，场上 8 人存活，进入标准投票轮次。
- **【逻辑冲突线】**：例如：如果 3 号是投毒者，2 号的共情者 '1' 信息与 5 号的厨师 '0' 信息将产生冲突。
- **【今日核心任务】**：例如：白天去私聊 2 号核对占卜师信息，并诱导大家投票给 6 号。

=== ANALYSIS ===
这里进行【即时分析】。
分析要点：
1. 深入分析新加入的信息“${consoleText}”，计算并指出新宣称与老宣称之间的逻辑矛盾和冲突。
2. 结合座位图相对位置，指出今天白天座位收缩后发生的物理邻座关系改变（如：共情者的新验人范围，茶艺师的实际保护网变化）。
3. 解析是否有异常的信息产生。

=== WORLDLINES ===
这里进行【平行世界线推演】。请至少拆分为以下3种世界线：
1. 【正常世界线】：假设没有“涡流”，没有中毒。若大家的信息皆为真，最可能的恶魔是几号？谁是穿衣服的坏人？
2. 【涡流世界线（Vortox World）】：若恶魔是“涡流”，所有村民的信息必须是**假的**！在这个前提下，哪些信息反向变成了线索？谁最可能是涡流恶魔？（注意：如果白天没人被处决，涡流直接获胜，请提示我防止猝死）。
3. 【中毒/下毒世界线】：是否存在诺达鲺下毒？或者熊孩子、洗脑师在场导致某玩家的宣称产生错误信息？如果某人中毒，最可能的是谁？

=== TIPS ===
这里提供【行动建议与防猝死提示】。
分析要点：
1. 战术行动：我（真实角色为【${gameState.myRole}】，当前阵营为【${gameState.myAlignment === 'evil' ? '邪恶阵营' : '善良阵营'}】）在白天最应该去私聊场上的哪些玩家以达到核对或掩盖身份的目的？在投票环节中，我们今天最应该采取何种投票策略，或是应该诱导大家将票挂在谁头上？
2. 针对我们正在玩的《${currentScript.name}》剧本角色（如 ${currentScript.demon[0]} 恶魔，以及爪牙与村民的博弈关系），指出本局本轮次对我们而言最紧迫的防守或进攻漏洞。
3. 给出一个简洁的一句话战术行动总结建议。

【重要格式要求】
不要合并或者漏掉以上标签。每一块内容必须以 === MEMO ===, === ANALYSIS ===, === WORLDLINES ===, === TIPS === 这四个大写标签单独占一行开启！
所有的内容请采用精美的中文 Markdown 语法呈现，包含加粗、列表，请适当使用加粗和图标让重点内容极度清晰。
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
            // 剔除 Memo 块，防止其移位 fallback 拆分
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

        // 整理匹配项的物理范围并排序，以防AI颠倒顺序输出
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
        // 兼容性兜底正则分割（忽略大小写）
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
            // 第一个分隔符之前可能有引导语，因此顺延
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

    // 终极防空逻辑：若某一部分解析出来确实没有内容，显示友好的状态，而非留白
    if (!analysisPart.trim()) {
        analysisPart = `<div class="empty-tab-state"><p>AI 未能正常生成本轮即时局势分析。</p></div>`;
    }
    if (!worldlinesPart.trim()) {
        worldlinesPart = `<div class="empty-tab-state"><p>AI 未能正常生成本轮平行世界线分析。</p></div>`;
    }
    if (!tipsPart.trim()) {
        tipsPart = `<div class="empty-tab-state"><p>AI 未能生成本轮的具体行动建议。建议您阅读【即时分析】页面的全局逻辑推演。</p></div>`;
    }

    // 2.4 构造 AI 语义化战术备忘录 HTML
    let memoHtml = "";
    if (memoPart.trim()) {
        const isEn = gameState.lang === "en";
        const headerTitle = isEn ? "AI Copilot Tactical Memo" : "AI 战术备忘录";
        
        // 渲染备忘录列表
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

    // 渲染 HTML
    console.log("🚨 [DEBUG] 正在将解析出的 HTML 渲染写入 DOM 元素中...");
    dom.analysisBox.innerHTML = thoughtHtml + memoHtml + parseMarkdown(analysisPart.trim());
    dom.worldlinesBox.innerHTML = parseMarkdown(worldlinesPart.trim());
    dom.tipsBox.innerHTML = parseMarkdown(tipsPart.trim());

    lucide.createIcons();
}
