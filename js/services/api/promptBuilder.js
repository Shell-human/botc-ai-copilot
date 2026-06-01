/* ==========================================================================
   promptBuilder.js - System/User Prompt 构建器 (Prompt Builder) v2.0
   职责：根据 gameState 构建完整的 AI Prompt 字符串
   v2.0: 统一模板消除4路重复，aiHistory摘要化，consoleText去重，聊天模式精简
   ========================================================================== */

import { gameState } from '../../core/state.js';
import {
    GAME_DISTRIBUTIONS,
    SCRIPTS_DATA,
    CHARACTER_DETAILS,
    CORE_LOGIC_RULES,
    CORE_LOGIC_RULES_EN
} from '../../data/rules.js';
import {
    ROLE_TRANSLATIONS
} from '../../data/translations.js';
import { getLocalizedLog } from '../../i18n/logTranslator.js';

// --- aiHistory 输出摘要截断长度 ---
const MAX_HISTORY_OUTPUT_LENGTH = 200;

export function constructPrompt(consoleText, isChat = false) {
    const lang = gameState.lang;
    const isEn = lang === "en";
    const currentScript = SCRIPTS_DATA[gameState.scriptName];
    const scriptDetails = CHARACTER_DETAILS[gameState.scriptName] || {};
    
    const townsfolkDesc = currentScript.townsfolk.map(r => `- ${r}: ${scriptDetails[r] || ''}`).join('\n');
    const outsiderDesc = currentScript.outsider.map(r => `- ${r}: ${scriptDetails[r] || ''}`).join('\n');
    const minionDesc = currentScript.minion.map(r => `- ${r}: ${scriptDetails[r] || ''}`).join('\n');
    const demonDesc = currentScript.demon.map(r => `- ${r}: ${scriptDetails[r] || ''}`).join('\n');
    
    const dist = GAME_DISTRIBUTIONS[gameState.playerCount] || { townsfolk: "?", outsider: "?", minion: "?", demon: "?" };
    const baseDistStrZh = `场上标准配置：${dist.townsfolk} 镇民, ${dist.outsider} 外来者, ${dist.minion} 爪牙, ${dist.demon} 恶魔`;
    const baseDistStrEn = `Standard configuration: ${dist.townsfolk} Townsfolk, ${dist.outsider} Outsiders, ${dist.minion} Minions, 1 Demon`;

    const teammates = gameState.players.filter(p => p.alignment === 'evil' && p.seat !== gameState.mySeat);
    const myRoleEn = ROLE_TRANSLATIONS[gameState.myRole] || gameState.myRole;
    const isEvil = gameState.myAlignment === 'evil';

    // ---- Player Statuses ----
    const playerStatuses = isEn
        ? gameState.players.map(p => {
            const roleNameEn = p.claim === '未知' ? 'Unknown' : (ROLE_TRANSLATIONS[p.claim] || p.claim);
            return `- [Seat ${p.seat}] Name: ${p.name}, Status: ${p.alive ? 'Alive' : '❌ Dead'}, Claimed Character: ${roleNameEn}, Suspected Alignment: ${p.alignment === 'good' ? 'Good' : (p.alignment === 'evil' ? 'Evil' : 'Unknown')}, Drunk/Poisoned: ${p.poisoned ? 'Yes' : 'No'}, Notes: ${p.note || 'None'}`;
        }).join('\n')
        : gameState.players.map(p => {
            const alignStr = p.alignment === 'good' ? '善良' : (p.alignment === 'evil' ? '邪恶' : '未知');
            return `- [座位 ${p.seat}] 姓名: ${p.name}, 状态: ${p.alive ? '存活' : '❌ 死亡'}, 宣称身份: ${p.claim}, 判定阵营: ${alignStr}, 中毒标记: ${p.poisoned ? '是' : '否'}, 备注: ${p.note || '无'}`;
        }).join('\n');

    // ---- Game Logs ----
    const gameLogs = isEn
        ? gameState.logs.map((log, idx) => `[Event ${idx+1}] ${getLocalizedLog(log, "en")}`).join('\n')
        : gameState.logs.map((log, idx) => `[第 ${idx+1} 条事件] ${getLocalizedLog(log, "zh")}`).join('\n');

    // ---- AI History (摘要化: 仅保留首200字) ----
    // v3.0: 聊天模式从 chatMessages 注入对话历史，分析模式从 aiOutputs 注入
    let aiHistoryPrompt = "";
    
    if (isChat) {
        // 聊天模式: 使用 chatMessages 作为对话上下文（最近 10 对 = 20 条）
        if (gameState.chatMessages && gameState.chatMessages.length > 0) {
            const historyToInclude = gameState.chatMessages.slice(-20);
            const headerEn = "\n=== CHAT CONVERSATION HISTORY ===\n";
            const headerZh = "\n=== 对话历史上下文 ===\n";
            
            aiHistoryPrompt = (isEn ? headerEn : headerZh) +
                historyToInclude.map((msg, idx) => {
                    const roleStr = msg.role === 'user'
                        ? (isEn ? "User" : "用户")
                        : (isEn ? "Assistant" : "AI 助手");
                    const label = isEn ? `#${idx+1}` : `第${idx+1}条`;
                    const truncatedContent = msg.content.length > MAX_HISTORY_OUTPUT_LENGTH
                        ? msg.content.substring(0, MAX_HISTORY_OUTPUT_LENGTH) + `...[${msg.content.length - MAX_HISTORY_OUTPUT_LENGTH} more chars]`
                        : msg.content;
                    return `[${label}] ${roleStr}:\n${truncatedContent}`;
                }).join('\n\n---\n\n') + '\n';
        }
    } else {
        // 分析模式: 使用 aiOutputs 作为推演历史（最近 6 条）
        if (gameState.aiOutputs && gameState.aiOutputs.length > 0) {
            const historyToInclude = gameState.aiOutputs.slice(-6);
            const headerEn = "\n=== PREVIOUS AI ASSISTANT OUTPUTS & DEDUCTION HISTORY ===\n";
            const headerZh = "\n=== 历史 AI 战术副驾驶推演记忆 ===\n";
            const footerEn = "\n\n(Use the above history to maintain consistency, memory, and flow. Do not contradict your previous statements unless new hard evidence disproves them.)\n";
            const footerZh = "\n\n（请务必参考上述历史输出，保持战术建议与前序推演的一致性与连贯性。除非出现硬性的新证据或局势剧变，否则请不要否定自己之前的结论。）\n";

            aiHistoryPrompt = (isEn ? headerEn : headerZh) +
                historyToInclude.map((item, idx) => {
                    const typeStr = isEn
                        ? (item.type === "chat" ? "Direct Q&A Chat" : "Round Seating Deduction")
                        : (item.type === "chat" ? "自由提问对话" : "局势进展推演");
                    const label = isEn ? `Memory ${idx+1}` : `历史记忆 ${idx+1}`;
                    const inputLabel = isEn ? "User Input" : "用户输入";
                    const outputLabel = isEn ? "Your Previous Response" : "你当时的回复输出";
                    const truncatedOutput = item.output.length > MAX_HISTORY_OUTPUT_LENGTH
                        ? item.output.substring(0, MAX_HISTORY_OUTPUT_LENGTH) + `...[truncated ${item.output.length - MAX_HISTORY_OUTPUT_LENGTH} chars]`
                        : item.output;
                    return `[${label}] Interaction Type: ${typeStr}\n- ${inputLabel}: "${item.input}"\n- ${outputLabel}:\n${truncatedOutput}\n---`;
                }).join('\n\n') + (isEn ? footerEn : footerZh);
        }
    }

    // ---- System Role Prompt & Setup Prompt (consoleText已从systemRolePrompt移除——仅保留在setupPrompt和页脚) ----
    let systemRolePrompt = "";
    let setupPrompt = "";

    if (isChat) {
        // 聊天模式: 精简，不注入consoleText到systemRolePrompt
        if (isEn) {
            systemRolePrompt = `You are an extremely experienced Blood on the Clocktower logician and strategic mastermind. You are acting as the "AI Tactical Copilot" for Player ${gameState.mySeat} (real role: ${myRoleEn}, alignment: ${isEvil ? 'Evil' : 'Good'}).
【Chat Mode】IMPORTANT:
The user is asking you a direct question / chatting with you.
Please reply directly and conversationally in a professional strategy advisor style. **DO NOT** include the '=== ANALYSIS ===' or '=== TIPS ===' tags in your response. Just write a comprehensive, highly strategic reply directly in Markdown.`;
            setupPrompt = `- My Real Role: ${myRoleEn} (${isEvil ? 'Evil Team' : 'Good Team'})\n- Standard Character Distribution: ${baseDistStrEn}\n- Active Mode: Direct Chat / Q&A\n- User Query: ${consoleText}`;
        } else {
            systemRolePrompt = `你是一名极其资深的《血染钟楼》逻辑学家、顶尖博弈大宗师。你正在作为一名玩家（即玩家 ${gameState.mySeat} 号，实际身份为【${isEvil ? '邪恶阵营' : '善良阵营'}】的 ${gameState.myRole}）的"AI战术副驾驶"帮助他解答规则问题，或者提供实时的个人角色打法与策略选择。
【对话模式】重要限制：
当前用户是以【对话交流/提问模式】在向你发起提问。
请直接、自然、亲切地用第一人称对话形式来回答他的问题，**绝对不要**在回复中包含 \`=== ANALYSIS ===\`、\`=== TIPS ===\` 这两个分类标签！直接在 Markdown 中给出一份详实、深入且充满战术智慧的直接回答即可！`;
            setupPrompt = `- 我的真实身份：${gameState.myRole}（${isEvil ? '【邪恶阵营】' : '善良阵营'}）\n- 游戏人数角色标准分布：${baseDistStrZh}\n- 当前处于：与 AI 自由提问对话模式\n- 用户对话问题：${consoleText}`;
        }
    } else if (isEvil) {
        if (isEn) {
            const activeBluffs = (gameState.evilBluffs || []).filter(Boolean);
            const bluffsStr = activeBluffs.length > 0 ? activeBluffs.map(b => ROLE_TRANSLATIONS[b] || b).join(', ') : "None declared";
            const teammatesStr = teammates.map(t => `Seat ${t.seat} (${t.name || 'Unnamed'}, Claimed: ${ROLE_TRANSLATIONS[t.claim] || t.claim})`).join(', ') || "No teammates marked yet in the seating chart";
            systemRolePrompt = `You are an extremely experienced Blood on the Clocktower logician and strategic mastermind. You are acting as the "AI Tactical Copilot" for Player ${gameState.mySeat} (real role: ${myRoleEn}, alignment: Evil).
The Storyteller gave you 3 Demon Bluffs (roles definitely NOT in play): [${bluffsStr}].
【Evil Teammates Hard Constraints】IMPORTANT:
Since your alignment is Evil, the user has explicitly marked their confirmed teammates on the seating chart: [${teammatesStr}].
Please strictly follow these logical constraints during deduction:
1. **DO NOT** analyze, suspect, or speculate whether other unmarked players are your teammates (unless active roles like Bounty Hunter, Politician, or Snake Charmer swap alignments mid-game. Otherwise, all other players are strictly considered Good).
2. Treat the marked players as 100% confirmed Evil teammates. Focus entirely on how to claim and utilize the 3 Bluffs to coordinate team bluffs, validate teammates, transfer blame, and frame Good players. Do not waste space questioning who your teammates are.
【Private Information & Undercover Constraint】CRITICAL:
The Good team and other players have NO knowledge of your Evil teammates' real identities and alignment! You only know who they are because of the Evil team's first-night mutual recognition mechanic (private evil-intro phase). This is PRIVATE information — it has NOT been revealed publicly.
- Your Evil teammates are still operating under their claimed personas in public discussions.
- You MUST assume that Good players in town still treat your teammates as ordinary / unknown-alignment players.
- Your tactical advice should focus on helping teammates MAINTAIN their cover and coordinate SECRETLY, not on treating their evil identity as publicly known or exposed.
Please analyze the game from the absolute perspective of the Evil team (Demons and Minions):
- Guide them on how to claim and utilize these 3 Bluffs to cooperate with Evil teammates.
- Suggest strategic options for framing Good players, validating Evil teammates, and fabricating false information!
- Deduce which claims from Good players are real, and highlight logical contradictions to exploit.`;
            setupPrompt = `- My Real Role: ${myRoleEn} (Evil Team)\n- Standard Character Distribution: ${baseDistStrEn}\n- 3 Demon Bluffs from Storyteller: ${bluffsStr}\n- Confirmed Evil Teammates: ${teammatesStr}`;
        } else {
            const activeBluffs = (gameState.evilBluffs || []).filter(Boolean);
            const bluffsStr = activeBluffs.length > 0 ? activeBluffs.join('、') : "未填报";
            const teammatesStr = teammates.map(t => `${t.seat}号玩家 (${t.name || '未命名'}, 宣称: ${t.claim})`).join('、') || "暂未在座位图中标记其他邪恶队友";
            systemRolePrompt = `你是一名极其资深的《血染钟楼》逻辑学家、顶尖博弈高手。你正在作为一名玩家（即玩家 ${gameState.mySeat} 号，实际身份为【邪恶阵营】的 ${gameState.myRole}）的"AI战术副驾驶"帮助他和邪恶同伴打配合、欺骗好人阵营、混淆视听并获得最终胜利。
说书人在首夜分配给他的 3 个【好人伪装身份 (Bluffs，场上绝对不在场的好人角色)】是：【${bluffsStr}】。
【邪恶同盟已知约束】重要：
由于你是【邪恶阵营】，用户已经在座位图中明确标出了目前已确认的邪恶队友：【${teammatesStr}】。
在进行推演时，请务必遵守以下硬性逻辑：
1. **绝对不要**分析、猜测或假设其他任何玩家（不在该队友列表中的玩家）是否是你的邪恶队友（除非存在赏金猎人转换、政客、蛇发等可能中途变换阵营的角色，否则默认其他玩家全为好人）。
2. 将列表中标记的同盟视为 100% 确信的邪恶队友。你的任务是提供最完美的团队协作建议（谁扮演什么伪装、如何打配合相互做高身份、怎么转移焦点），而不是在己方阵营内瞎猜队友。
【私密信息与伪装状态约束】极其重要：
善良阵营和其他玩家对你的邪恶队友的真实身份和阵营一无所知！你之所以知道他们的身份，仅仅是因为邪恶阵营在首夜互相确认（私密互认），但这不代表他们的身份在场上已经公开。
- 你的邪恶同伴们在公开场合仍然顶着他们各自的伪装身份（即宣称号上的角色）在活动。
- 你必须假设在场的好人玩家依然把他们当作普通好人或身份未知的玩家来对待。
- 你的战术建议应当基于帮助队友【维持伪装、秘密协作】，而不是假定他们的邪恶身份已被公开或暴露。
请务必站在邪恶阵营（恶魔或爪牙）的视角进行策略分析：
- 指导他如何巧妙地"穿"这 3 件伪装皮肤，协助时间和他的邪恶队友进行高水准的身份伪装配合。
- 提供抹黑好人、抗推好人、做高同伴身份、伪造假信息的最佳阴险战术！
- 分析哪些好人的宣称是真实的，哪些是我们可以利用逻辑漏洞击破的！`;
            setupPrompt = `- 我的真实身份：${gameState.myRole}（【邪恶阵营】）\n- 游戏人数角色标准分布：${baseDistStrZh}\n- 说书人给的 3 个好人伪装 (Bluffs)：${bluffsStr}\n- 已确认的邪恶队友：${teammatesStr}`;
        }
    } else {
        // Good alignment
        if (isEn) {
            systemRolePrompt = `You are an extremely experienced Blood on the Clocktower logician and strategic mastermind. You are acting as the "AI Tactical Copilot" for Player ${gameState.mySeat} (real role: ${myRoleEn}, alignment: Good).
Please analyze the game from the absolute perspective of the Good team, helping them spot logical contradictions, identify deceitful claims, and locate the hidden Demon and Minions.
You should leverage the standard player count distribution (${baseDistStrEn}) combined with active claims to execute deduction by elimination.`;
            setupPrompt = `- My Real Role: ${myRoleEn} (Good Team)\n- Standard Character Distribution: ${baseDistStrEn}`;
        } else {
            systemRolePrompt = `你是一名极其资深的《血染钟楼》逻辑学家、顶尖博弈高手。你正在作为一名玩家（即玩家 ${gameState.mySeat} 号，真实身份为【善良阵营】的 ${gameState.myRole}）的"AI战术副驾驶"帮助他梳理局势、检测逻辑冲突并找出隐藏的恶魔与爪牙。
请站在善良阵营的绝对立场，帮他寻找逻辑漏洞，防备邪恶阵营的欺骗！你可以结合该游戏人数的【标准配置人数分布（${baseDistStrZh}）】和场上起跳外来者、爪牙的数量，来进行排除法推演。`;
            setupPrompt = `- 我的真实身份：${gameState.myRole}（善良阵营）\n- 游戏人数角色标准分布：${baseDistStrZh}`;
        }
    }

    // ===================== 统一模板组装 =====================
    const scriptHeader = isEn
        ? `Current Script: "${currentScript.name || gameState.scriptName}".`
        : `目前我们正在进行的游戏剧本是：《${currentScript.name}》。`;

    // 聊天模式跳过核心法则+角色列表+格式标签
    const coreLawsBlock = isChat ? "" : (isEn
        ? `\n=== BOTC CORE DEDUCTION LAWS ===\n${CORE_LOGIC_RULES_EN}\n`
        : `\n=== 血染钟楼核心推理钢性法则 ===\n${CORE_LOGIC_RULES}\n`);

    const charDescBlock = isChat ? "" : (isEn
        ? `Character descriptions in this script (use these definitions for logical constraints):
Townsfolk:
${townsfolkDesc}

Outsiders:
${outsiderDesc}

Minions:
${minionDesc}

Demons:
${demonDesc}

Please perform constraint solving and parallel worldline deductions based on character abilities and game state.
`
        : `该剧本包含的角色及其具体能力定义（注意：在不同的剧本中，相同角色的具体能力和配置可能有微调差异，请以此为准）：
村民角色定义：
${townsfolkDesc}

外来者角色定义：
${outsiderDesc}

爪牙角色定义：
${minionDesc}

恶魔角色定义：
${demonDesc}

请根据该剧本的所有角色能力逻辑，对当前对局做深度约束逻辑求解（Constraint Solving）与多平行世界推演。
`);

    const configLabel = isEn ? "Game Configuration" : "当前游戏基础配置";
    const configBody = isEn
        ? `- Total Players: ${gameState.playerCount}\n- My Seat: Player ${gameState.mySeat}\n${setupPrompt}`
        : `- 玩家总人数：${gameState.playerCount} 人\n- 我的座位：${gameState.mySeat} 号\n${setupPrompt}`;

    const statusLabel = isEn ? "Player Statuses" : "当前场上所有玩家状态信息";
    const logsLabel = isEn ? "Game Logs" : "截至目前发生的事件日志记录";

    // ---- 页脚: 聊天模式 vs 分析模式 ----
    let footer = "";
    if (isChat) {
        footer = isEn
            ? `【USER DIRECT QUERY】: "${consoleText}"
Please answer my question directly and conversationally in Markdown. Feel free to use lists, bold text, and clear formatting. Do NOT output any tags like === ANALYSIS === or similar.`
            : `【用户直接对话提问】："${consoleText}"
请针对我的提问给予直接、深度、充满战术博弈智慧的详细解答。请直接用精美的 Markdown 格式输出，可以使用列表、粗体、分割线和图标。绝对不要输出任何形如 === ANALYSIS === 的分隔标签！`;
    } else {
        footer = isEn
            ? `Please provide depth analysis based on the latest update: "${consoleText}".
For an optimal user experience, you MUST strictly format your response using these three exact tags:

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

=== TIPS ===
Provide tactical suggestions and survival tips.
Guidelines:
1. Tactical Actions: I am a ${gameState.myRole} (${isEvil ? 'Evil Team' : 'Good Team'}). Who should I private chat today to verify or hide alignment? What voting strategies should we pursue today, or whom should we nominate/frame?
2. Address script-specific dynamics (e.g. how to handle the ${currentScript.demon[0]} demon, Minion-Townsfolk power struggles).
3. Conclude with a concise one-line tactical takeaway.

[CRITICAL FORMATTING REQUIREMENT]
Do NOT merge or omit these tags. Each section must start with the exact tag (=== MEMO ===, === ANALYSIS ===, === TIPS ===) on a new line!
Render all content in premium, clean English Markdown. Use bolding and lists appropriately for readability.

=== STATE_SYNC ===
[CRITICAL] After your response above, output a final JSON block to auto-update player state. Based on the user input "${consoleText}", extract any explicit role claims, death states, or poison states. Format exactly:
\`\`\`json
{
 "events": [
   {"seat": 4, "claim": "Chef"},
   {"seat": 2, "claim": "Empath", "alive": true},
   {"seat": 6, "alive": false},
   {"seat": 3, "poisoned": true}
 ]
}
\`\`\`
Rules:
- "claim" must be an EXACT English character name from this script (one of: Townsfolk/Outsider/Minion/Demon names above).
- Only include seats and fields that are explicitly mentioned in the user's input. Do NOT guess.
- If the user says someone "jumped" / "claimed" / "is" / "跳" / "宣称" a role, set their "claim".
- If the user says someone "died" / "was executed" / "死亡" / "处决", set "alive": false。
- If the user says someone "alive" / "存活" / "复活", set "alive": true。
- If the user says someone "poisoned" / "中毒" / "drunk", set "poisoned": true。
- If the user says someone "healthy" / "恢复" / "正常", set "poisoned": false。
- If nothing explicit was stated about a player, omit them entirely from the events array (output {"events": []}).
- Output ONLY the JSON code block, nothing else after it.`
            : `请帮我根据最新的变化"${consoleText}"，输出三个模块的分析。
为了让我极高体验地使用，请严格按照以下三个标签标记划分你的输出：

=== MEMO ===
用极其精炼的语言提供刚好 3 行（加粗前缀）的战局核心备忘录：
- **【当前死活线】**：例如：第 2 天，场上 8 人存活，进入标准投票轮次。
- **【逻辑冲突线】**：例如：如果 3 号是投毒者，2 号的共情者 '1' 信息与 5 号的厨师 '0' 信息将产生冲突。
- **【今日核心任务】**：例如：白天去私聊 2 号核对占卜师信息，并诱导大家投票给 6 号。

=== ANALYSIS ===
这里进行【即时分析】。
分析要点：
1. 深入分析新加入的信息"${consoleText}"，计算并指出新宣称与老宣称之间的逻辑矛盾和冲突。
2. 结合座位图相对位置，指出今天白天座位收缩后发生的物理邻座关系改变（如：共情者的新验人范围，茶艺师的实际保护网变化）。
3. 解析是否有异常的信息产生。

=== TIPS ===
这里提供【行动建议与防猝死提示】。
分析要点：
1. 战术行动：我（真实角色为【${gameState.myRole}】，当前阵营为【${isEvil ? '邪恶阵营' : '善良阵营'}】）在白天最应该去私聊场上的哪些玩家以达到核对或掩盖身份的目的？在投票环节中，我们今天最应该采取何种投票策略，或是应该诱导大家将票挂在谁头上？
2. 针对我们正在玩的《${currentScript.name}》剧本角色（如 ${currentScript.demon[0]} 恶魔，以及爪牙与村民的博弈关系），指出本局本轮次对我们而言最紧迫的防守或进攻漏洞。
3. 给出一个简洁的一句话战术行动总结建议。

【重要格式要求】
不要合并或者漏掉以上标签。每一块内容必须以 === MEMO ===, === ANALYSIS ===, === TIPS === 这三个大写标签单独占一行开启！
所有的内容请采用精美的中文 Markdown 语法呈现，包含加粗、列表，请适当使用加粗和图标让重点内容极度清晰。

=== STATE_SYNC ===
【关键】在你的上述回复之后，请输出一个最终的 JSON 代码块，用于自动更新玩家状态。根据用户输入 "${consoleText}"，提取其中明确提到的角色宣称、死亡状态或中毒状态。格式严格要求如下：
\`\`\`json
{
  "events": [
    {"seat": 4, "claim": "厨师"},
    {"seat": 2, "claim": "共情者", "alive": true},
    {"seat": 6, "alive": false},
    {"seat": 3, "poisoned": true}
  ]
}
\`\`\`
规则：
- "claim" 必须是本剧本中角色定义里的精确中文角色名（从上面村民/外来者/爪牙/恶魔角色名中取）。
- 仅包含用户在输入中明确提到的座位和字段。不要猜测，不要补充。
- 如果用户说某玩家"跳了" / "宣称" / "是" / "跳的" 某个角色，设置其 "claim"。
- 如果用户说某玩家"死了" / "死亡" / "被处决" / "出局"，设置 "alive": false。
- 如果用户说某玩家"存活" / "复活"，设置 "alive": true。
- 如果用户说某玩家"中毒" / "醉酒"，设置 "poisoned": true。
- 如果用户说某玩家"恢复" / "解毒" / "正常"，设置 "poisoned": false。
- 如果用户输入中没有明确提及任何状态变化，输出 {"events": []}。
- 仅输出 JSON 代码块，不要在此之后附加任何其他内容。`;
    }

    // ---- 统一组装最终 Prompt ----
    return `
${systemRolePrompt}
${scriptHeader}
${coreLawsBlock}${charDescBlock}
=== ${configLabel} ===
${configBody}

=== ${statusLabel} ===
${playerStatuses}

=== ${logsLabel} ===
${gameLogs}
${aiHistoryPrompt}

---
${footer}
`;
}
