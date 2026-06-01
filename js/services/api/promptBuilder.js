/* ==========================================================================
   promptBuilder.js - System/User Prompt 构建器 (Prompt Builder)
   职责：根据 gameState 构建完整的 AI Prompt 字符串
   ========================================================================== */

import { gameState } from '../../core/state.js';
import {
    GAME_DISTRIBUTIONS,
    SCRIPTS_DATA,
    SCRIPTS_DATA_EN,
    CHARACTER_DETAILS,
    CORE_LOGIC_RULES,
    CORE_LOGIC_RULES_EN
} from '../../data/rules.js';
import {
    ROLE_TRANSLATIONS
} from '../../data/translations.js';
import { getLocalizedLog } from '../../i18n/logTranslator.js';

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

    const teammates = gameState.players.filter(p => p.alignment === 'evil' && p.seat !== gameState.mySeat);

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

    let gameLogs = "";
    if (gameState.lang === "en") {
        gameLogs = gameState.logs.map((log, idx) => `[Event ${idx+1}] ${getLocalizedLog(log, "en")}`).join('\n');
    } else {
        gameLogs = gameState.logs.map((log, idx) => `[第 ${idx+1} 条事件] ${getLocalizedLog(log, "zh")}`).join('\n');
    }

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
            systemRolePrompt = `你是一名极其资深的《血染钟楼》逻辑学家、顶尖博弈大宗师。你正在作为一名玩家（即玩家 ${gameState.mySeat} 号，实际身份为【${gameState.myAlignment === 'evil' ? '邪恶阵营' : '善良阵营'}】的 ${gameState.myRole}）的"AI战术副驾驶"帮助他解答规则问题，或者提供实时的个人角色打法与策略选择。
【对话模式】重要限制：
当前用户是以【对话交流/提问模式】在向你发起提问。
请直接、自然、亲切地用第一人称对话形式来回答他的问题，**绝对不要**在回复中包含 \`=== ANALYSIS ===\`、\`=== WORLDLINES ===\`、\`=== TIPS ===\` 这三个分类标签！直接在 Markdown 中给出一份详实、深入且充满战术智慧的直接回答即可！
回答时你可以参考下面的当前游戏配置和状态，但要100%集中于精准地解答用户的问题："${consoleText}"。`;
            setupPrompt = `- 我的真实身份：${gameState.myRole}（${gameState.myAlignment === 'evil' ? '【邪恶阵营】' : '善良阵营'}）\n- 游戏人数角色标准分布：${baseDistStrZh}\n- 当前处于：与 AI 自由提问对话模式\n- 用户对话问题：${consoleText}`;
        } else if (gameState.myAlignment === "evil") {
            const bluffsStr = gameState.evilBluffs.length > 0 ? gameState.evilBluffs.join('、') : "未填报";
            const teammatesStr = teammates.map(t => `${t.seat}号玩家 (${t.name || '未命名'}, 宣称: ${t.claim})`).join('、') || "暂未在座位图中标记其他邪恶队友";
            systemRolePrompt = `你是一名极其资深的《血染钟楼》逻辑学家、顶尖博弈高手。你正在作为一名玩家（即玩家 ${gameState.mySeat} 号，实际身份为【邪恶阵营】的 ${gameState.myRole}）的"AI战术副驾驶"帮助他和邪恶同伴打配合、欺骗好人阵营、混淆视听并获得最终胜利。
说书人在首夜分配给他的 3 个【好人伪装身份 (Bluffs，场上绝对不在场的好人角色)】是：【${bluffsStr}】。
【邪恶同盟已知约束】重要：
由于你是【邪恶阵营】，用户已经在座位图中明确标出了目前已确认的邪恶队友：【${teammatesStr}】。
在进行推演时，请务必遵守以下硬性逻辑：
1. **绝对不要**分析、猜测或假设其他任何玩家（不在该队友列表中的玩家）是否是你的邪恶队友（除非存在赏金猎人转换、政客、蛇发等可能中途变换阵营的角色，否则默认其他玩家全为好人）。
2. 将列表中标记的同盟视为 100% 确信的邪恶队友。你的任务是提供最完美的团队协作建议（谁扮演什么伪装、如何打配合相互做高身份、怎么转移焦点），而不是在己方阵营内瞎猜队友。
请务必站在邪恶阵营（恶魔或爪牙）的视角进行策略分析：
- 指导他如何巧妙地"穿"这 3 件伪装皮肤，协助时间和他的邪恶队友进行高水准的身份伪装配合。
- 提供抹黑好人、抗推好人、做高同伴身份、伪造假信息的最佳阴险战术！
- 分析哪些好人的宣称是真实的，哪些是我们可以利用逻辑漏洞击破的！`;
            setupPrompt = `- 我的真实身份：${gameState.myRole}（【邪恶阵营】）\n- 游戏人数角色标准分布：${baseDistStrZh}\n- 说书人给的 3 个好人伪装 (Bluffs)：${bluffsStr}\n- 已确认的邪恶队友：${teammatesStr}`;
        } else {
            systemRolePrompt = `你是一名极其资深的《血染钟楼》逻辑学家、顶尖博弈高手。你正在作为一名玩家（即玩家 ${gameState.mySeat} 号，真实身份为【善良阵营】的 ${gameState.myRole}）的"AI战术副驾驶"帮助他梳理局势、检测逻辑冲突并找出隐藏的恶魔与爪牙。
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
请帮我根据最新的变化"${consoleText}"，输出四个模块的分析。
为了让我极高体验地使用，请严格按照以下四个标签标记划分你的输出：

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

=== WORLDLINES ===
这里进行【平行世界线推演】。请至少拆分为以下3种世界线：
1. 【正常世界线】：假设没有"涡流"，没有中毒。若大家的信息皆为真，最可能的恶魔是几号？谁是穿衣服的坏人？
2. 【涡流世界线（Vortox World）】：若恶魔是"涡流"，所有村民的信息必须是**假的**！在这个前提下，哪些信息反向变成了线索？谁最可能是涡流恶魔？（注意：如果白天没人被处决，涡流直接获胜，请提示我防止猝死）。
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
