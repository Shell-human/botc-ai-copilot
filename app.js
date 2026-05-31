/* ==========================================================================
   无上杀戮 - 血染钟楼 AI 战术助手逻辑控制系统 (Vanilla JS)
   ========================================================================== */

// 全局运行时错误监听器，方便在调试时即时捕获隐藏的 JS 报错
window.onerror = function (message, source, lineno, colno, error) {
    alert("🚨 发现未捕获的运行时错误！\n\n错误信息: " + message + "\n出错文件: " + source + "\n出错行号: " + lineno + "\n出错列号: " + colno);
    return false;
};

// --- 剧本/板子数据配置 ---
const SCRIPTS_DATA = {
    wushang: {
        name: "无上杀戮",
        townsfolk: ["贵族", "厨师", "共情者", "罂粟种植者", "博学者", "茶艺师", "城镇公告员", "舞蛇人", "送葬者", "熊孩子", "传教士", "水手", "赏金猎人", "炼金术士", "气球驾驶员"],
        outsider: ["畸形秀演员", "魔像", "政客", "瘟疫医生", "理发师"],
        minion: ["精神病患者", "皮克希", "洗脑师", "召唤师", "教父"],
        demon: ["涡流", "卡扎力", "诺达鲺", "哈迪寂亚"]
    },
    anliu: {
        name: "暗流涌动",
        townsfolk: ["洗衣妇", "图书管理员", "调查员", "厨师", "共情者", "占卜师", "送葬者", "僧侣", "守鸦人", "贞洁者", "猎手", "士兵", "镇长"],
        outsider: ["管家", "酒鬼", "陌客", "圣徒"],
        minion: ["投毒者", "间谍", "男爵", "红唇女郎"],
        demon: ["小恶魔"]
    },
    mengyun: {
        name: "梦殒春宵",
        townsfolk: ["钟表匠", "筑梦师", "舞蛇人", "数学家", "卖花女孩", "城镇公告员", "神谕者", "杂耍艺人", "博学者", "女裁缝", "哲学家", "艺术家", "贤者"],
        outsider: ["畸形秀演员", "理发师", "心上人", "呆瓜"],
        minion: ["女巫", "洗脑师", "麻脸巫婆", "镜像双子"],
        demon: ["方吉", "诺达鲺", "亡骨魔", "涡流"]
    },
    wafuleiming: {
        name: "瓦釜雷鸣",
        townsfolk: ["调查员", "厨师", "祖母", "占卜师", "气球驾驶员", "筑梦师", "舞蛇人", "赌徒", "博学者", "哲学家", "守鸦人", "失忆者", "食人族"],
        outsider: ["酒鬼", "陌客", "畸形秀演员", "心上人", "疯子"],
        minion: ["教父", "麻脸巫婆", "洗脑师", "寡妇"],
        demon: ["小恶魔", "亡骨魔", "方吉"]
    }
};

// --- 板子角色详细技能定义 ---
const CHARACTER_DETAILS = {
    wushang: {
        "贵族": "首个夜晚得知三名玩家，其中恰好有一名是邪恶的。",
        "厨师": "首个夜晚得知场上有多少对相邻的邪恶玩家。",
        "共情者": "每个夜晚得知与你相邻的存活玩家中，有多少名是邪恶的。",
        "罂粟种植者": "若你死亡，恶魔与爪牙才能互相认识。",
        "博学者": "每个白天你可以私下向说书人获取两个陈述：一个为真，一个为假。",
        "茶艺师": "只要你相邻的两个存活玩家都是好人，他们就不会死亡。",
        "城镇公告员": "每个夜晚*，你会得知今天是否有爪牙进行了提名。",
        "舞蛇人": "每个夜晚选择一名玩家：若他是恶魔，你成为新的恶魔并且中毒，而他成为中毒的舞蛇人。",
        "送葬者": "每个夜晚*，你会得知今天白天被处决的玩家的真实底牌角色。",
        "熊孩子": "每个夜晚，选择一个村民角色：直到下个黄昏，他的能力产生错误信息。",
        "传教士": "每个夜晚选择一名存活玩家：若他是爪牙，他永久失去能力。",
        "水手": "每个夜晚选择一名玩家：你或他中的一人会醉酒直到下个夜晚。你不会在夜晚死亡。",
        "赏金猎人": "首个夜晚得知一名邪恶玩家。场上会多出一名邪恶的好人角色。",
        "炼金术士": "你获得一个在场爪牙的角色能力，但你可能因此醉酒。",
        "气球驾驶员": "每个夜晚得知一个特定阵营的存活玩家。[+0或+1外来者]",
        "畸形秀演员": "若你向他人宣称自己是外来者，你可能会被处决。",
        "魔像": "一局游戏一次，你可以选择一名玩家提名，若他不是恶魔，他立刻死亡。",
        "政客": "若你的阵营获胜但你倒向另一个阵营，你依然算作获胜。",
        "瘟疫医生": "若你死亡，说书人会获得一个额外的爪牙能力。",
        "理发师": "若你死亡，恶魔在今晚可以选择两名玩家交换他们的角色。",
        "精神病患者": "白天可公开找人决斗剪刀石头布，你胜则他立刻死亡。你被处决时不会死亡。",
        "皮克希": "首夜得知一个不在场的好人。若你宣称是该角色，可获得其真实能力。",
        "洗脑师": "每晚指定一名玩家和好人角色：该玩家明天白天必须宣称自己是该角色。",
        "召唤师": "前三个夜晚不行动。在第三个夜晚，创造一个新的恶魔。",
        "教父": "首夜得知外来者总数。每个夜晚*，若今天有人被处决，你可以杀死一名玩家。[+1或-1外来者]",
        "涡流": "每个夜晚*，选择一名玩家：他死亡。所有村民得到的信息必须是假的。若白天无人被处决则邪恶方直接获胜。",
        "卡扎力": "在你的首个夜晚，选择好人玩家并将他们的角色变更为你指定的爪牙角色。每个夜晚*，你要选择一名玩家：他死亡。[-或+任意数量外来者]",
        "诺达鲺": "每个夜晚*，你要选择一名玩家：他死亡。你相邻的两个存活的好人玩家永久中毒。",
        "哈迪寂亚": "每个夜晚*，你可以选择三名玩家（所有人都得知是谁）：他们秘密决定自己的生死，如果他们都选择存活，则他们全部死亡。已死亡的玩家可以通过此技能复活。"
    },
    anliu: {
        "洗衣妇": "在你的首个夜晚，你会得知两名玩家和一个村民角色：这两名玩家之一是该角色。",
        "图书管理员": "在你的首个夜晚，你会得知两名玩家和一个外来者角色：这两名玩家之一是该角色（或者你会得知没有外来者在场）。",
        "调查员": "在你的首个夜晚，你会得知两名玩家和一个爪牙角色：这两名玩家之一是该角色（或者你会得知没有爪牙在场）。",
        "厨师": "首个夜晚得知场上有多少对相邻的邪恶玩家。",
        "共情者": "每个夜晚得知与你相邻的存活玩家中，有多少名是邪恶的。",
        "占卜师": "每个夜晚，你要选择两名玩家：你会得知他们之中是否有恶魔。会有一名善良玩家始终被你的能力当作恶魔。",
        "送葬者": "每个夜晚*，你会得知今天白天被处决的玩家的真实底牌角色。",
        "僧侣": "每个夜晚*，你要选择除你以外的一名玩家：当晚恶魔的负面能力对他无效。",
        "守鸦人": "如果你在夜晚死亡，你会被唤醒，然后你要选择一名玩家：你会得知他的角色。",
        "贞洁者": "当你首次被提名时，如果提名你的玩家是村民，他立刻被处决。",
        "猎手": "每局游戏限一次，你可以在白天时公开选择一名玩家：如果他是恶魔，他死亡。",
        "士兵": "恶魔的负面能力对你无效。",
        "镇长": "如果只有三名玩家存活且白天没有人被处决，你的阵营获胜。如果你在夜晚即将死亡，可能会有一名其他玩家代替你死亡。",
        "管家": "每个夜晚，你要选择除你以外的一名玩家：明天白天，只有他投票时你才能投票。",
        "酒鬼": "你不知道自己是酒鬼。你以为你是一个村民角色，但其实你不是。",
        "陌客": "你可能会被当作邪恶阵营、爪牙角色或恶魔角色，即使你已死亡。",
        "圣徒": "如果你死于处决，你的阵营落败。",
        "投毒者": "每个夜晚，你要选择一名玩家：他在当晚和明天白天中毒。",
        "间谍": "每个夜晚，你能查看魔典。你可能会被当作善良阵营、村民角色或外来者角色，即使你已死亡。",
        "男爵": "会有额外的外来者在场。[+2外来者]",
        "红唇女郎": "如果大于等于五名玩家存活时（旅行者不计算在内）恶魔死亡，你变成那个恶魔。",
        "小恶魔": "每个夜晚*，你要选择一名玩家：他死亡。如果你以这种方式自杀，一名爪牙会变成小恶魔。"
    },
    mengyun: {
        "钟表匠": "在你的首个夜晚，你会得知恶魔与爪牙之间最近的距离。（邻座的玩家距离为 1）",
        "筑梦师": "每个夜晚，你要选择（除你及旅行者以外的）一名玩家：你会得知一个善良角色和一个邪恶角色，该玩家是其中一个角色。",
        "舞蛇人": "每个夜晚选择一名玩家：若他是恶魔，你成为新的恶魔并且中毒，而他成为中毒的舞蛇人。",
        "数学家": "每个夜晚，你会得知有多少名玩家的能力因为其他角色的能力而未正常生效（从上个黎明到你被唤醒时）。",
        "卖花女孩": "每个夜晚*，你会得知在今天白天是否有恶魔投过票。",
        "城镇公告员": "每个夜晚*，你会得知今天是否有爪牙进行了提名。",
        "神谕者": "每个夜晚*，你会得知有多少名死亡的玩家是邪恶的。",
        "杂耍艺人": "在你的首个白天，你可以公开猜测任意玩家的角色最多五次。在当晚，你会得知猜测正确的角色数量。",
        "博学者": "每个白天你可以私下向说书人获取两个陈述：一个为真，一个为假。",
        "女裁缝": "每局游戏限一次，在夜晚时，你可以选择（除你以外的）两名玩家：你会得知他们是否为同一阵营。",
        "哲学家": "每局游戏限一次，在夜晚时，你可以选择一个善良角色：你获得该角色的能力。如果这个角色在场，他醉酒。",
        "艺术家": "每局游戏限一次，在白天时，你可以私下拜访说书人提问一个是非题，你会得知该问题的答案（是/不是/我不知道）。",
        "贤者": "如果恶魔杀死了你，在当晚你会被唤醒并得知两名玩家，其中一名是杀死你的那个恶魔。",
        "畸形秀演员": "若你向他人宣称自己是外来者，你可能会被处决。",
        "理发师": "若你死亡，恶魔在今晚可以选择两名玩家交换他们的角色。",
        "心上人": "当你死亡时，会有一名玩家开始醉酒。",
        "呆瓜": "当你得知你死亡时，你要公开选择一名存活的玩家：如果他是邪恶的，你的阵营落败。",
        "女巫": "每个夜晚，你要选择一名玩家：如果他明天白天发起提名，他死亡。如果只有三名存活的玩家，你失去此能力。",
        "洗脑师": "每晚指定一名玩家和好人角色：该玩家明天白天必须宣称自己是该角色。",
        "麻脸巫婆": "每个夜晚*，你要选择一名玩家和一个角色，如果该角色不在场，他变成该角色。如果因此创造了一个恶魔，当晚的死亡由说书人决定。",
        "镜像双子": "你与一名对立阵营的玩家互相知道对方是什么角色。如果其中善良玩家被处决，邪恶阵营获胜。如果你们都存活，善良阵营无法获胜。",
        "方吉": "每个夜晚*，你要选择一名玩家：他死亡。被该能力杀死的外来者会变为邪恶的方吉且你代替他死亡，但每局游戏仅能成功转化一次。[+1外来者]",
        "诺达鲺": "每个夜晚*，你要选择一名玩家：他死亡。你相邻的两个存活的好人玩家永久中毒。",
        "亡骨魔": "每个夜晚*，你要选择一名玩家：他死亡。被你杀死的爪牙保留他的能力，且与他邻近的两名村民之一中毒。[-1外来者]",
        "涡流": "每个夜晚*，选择一名玩家：他死亡。所有村民得到的信息必须是假的。若白天无人被处决则邪恶方直接获胜。"
    },
    wafuleiming: {
        "调查员": "在你的首个夜晚，你会得知两名玩家和一个爪牙角色：这两名玩家之一是该角色（或者你会得知没有爪牙在场）。",
        "厨师": "首个夜晚得知场上有多少对相邻的邪恶玩家。",
        "祖母": "在你的首个夜晚，你会得知一名善良玩家和他的角色。如果恶魔杀死了他，你也会死亡。",
        "占卜师": "每个夜晚，你要选择两名玩家：你会得知他们之中是否有恶魔。会有一名善良玩家始终被你的能力当作恶魔。",
        "气球驾驶员": "每个夜晚得知一个特定阵营的存活玩家。[+1外来者]",
        "筑梦师": "每个夜晚，你要选择（除你及旅行者以外的）一名玩家：你会得知一个善良角色和一个邪恶角色，该玩家是其中一个角色。",
        "舞蛇人": "每个夜晚选择一名玩家：若他是恶魔，你成为新的恶魔并且中毒，而他成为中毒的舞蛇人。",
        "赌徒": "每个夜晚*，你要选择一名玩家并猜测他的角色：如果你猜错了，你会死亡。",
        "博学者": "每个白天你可以私下向说书人获取两个陈述：一个为真，一个为假。",
        "哲学家": "每局游戏限一次，在夜晚时，你可以选择一个善良角色：你获得该角色的能力。如果这个角色在场，他醉酒。",
        "守鸦人": "如果你在夜晚死亡，你会被唤醒，然后你要选择一名玩家：你会得知他的角色。",
        "失忆者": "你不知道你的能力是什么。每个白天你可以找说书人猜测一次，你会得知你的猜测有多准确。",
        "食人族": "你拥有上个死于处决的玩家的能力。如果该玩家属于邪恶阵营，你中毒直到下个善良玩家死于处决。",
        "酒鬼": "你不知道自己是酒鬼。你以为你是一个村民角色，但其实你不是。",
        "陌客": "你可能会被当作邪恶阵营、爪牙角色或恶魔角色，即使你已死亡。",
        "畸形秀演员": "若你向他人宣称自己是外来者，你可能会被处决。",
        "心上人": "当你死亡时，会有一名玩家开始醉酒。",
        "疯子": "你以为你是一个恶魔，但其实你不是。恶魔知道你是疯子以及你在每个夜晚选择了哪些玩家。",
        "教父": "首夜得知外来者总数。每个夜晚*，若今天有人被处决，你可以杀死一名玩家。[+1或-1外来者]",
        "麻脸巫婆": "每个夜晚*，你要选择一名玩家和一个角色，如果该角色不在场，他变成该角色。如果因此创造了一个恶魔，当晚的死亡由说书人决定。",
        "洗脑师": "每晚指定一名玩家和好人角色：该玩家明天白天必须宣称自己是该角色。",
        "寡妇": "在你的首个夜晚，你能查看魔典并选择一名玩家：他中毒。随后，始终会有一名善良玩家知道寡妇在场。",
        "小恶魔": "每个夜晚*，你要选择一名玩家：他死亡。如果你以这种方式自杀，一名爪牙会变成小恶魔。",
        "亡骨魔": "每个夜晚*，你要选择一名玩家：他死亡。被你杀死的爪牙保留他的能力，且与他邻近的两名村民之一中毒。[-1外来者]",
        "方吉": "每个夜晚*，你要选择一名玩家：他死亡。被该能力杀死的外来者会变为邪恶的方吉且你代替他死亡，但每局游戏仅能成功转化一次。[+1外来者]"
    }
};

const TRANSLATIONS = {
    zh: {
        restoreGame: "恢复上次对局",
        apiStatusReady: "Gemini API 已就绪",
        apiStatusOffline: "离线模式：数据已保存在本地",
        panelSetupTitle: "对局配置与管理",
        gatewayConfig: "AI 大脑多网关配置",
        apiProvider: "AI 驱动厂商 (Provider)",
        apiBaseUrl: "接口基地址 (Base URL)",
        apiKeyLabel: "API Key (密钥)",
        aiModel: "推理分析模型 (Model)",
        customModelId: "自定义模型 ID (Custom Model ID)",
        apiConfigTip: "已自动填充 Google Gemini 原生密钥，支持最新的 3.5 Flash 极速推理模型以及 3.1 Pro 深度推理模型，无需配置直接使用！",
        initGameTitle: "新对局初始化",
        playerCount: "玩家人数",
        scriptSelect: "板子/剧本",
        previewScript: "预览剧本角色表",
        mySeat: "我的座位号",
        myRole: "我的角色",
        myAlignment: "我的阵营",
        goodAlignment: "善良阵营",
        evilAlignment: "邪恶阵营",
        evilBluffsTitle: "说书人给的 3 个好人伪装 (Bluffs)",
        initGameBtn: "初始化并开启新游戏",
        playerQuickAdjust: "玩家状态快速调整",
        resetAll: "重置所有",
        legendGood: "好人",
        legendEvil: "坏人",
        legendDead: "死亡",
        legendPoisoned: "中毒/醉酒",
        panelMapTitle: "环形座位轨迹图",
        timelineTitle: "局势信息流水志",
        emptyLogs: "暂无游戏记录，在右侧控制台输入第一条局势变动吧",
        panelAiTitle: "AI 战术副驾驶 (Tactical Copilot)",
        consoleInputLabel: "输入本轮局势进展 (支持自然语言描述)",
        consoleInputPlaceholder: "输入例如：\n- 5号死了。白天2号跳了厨师，说得到信息是0。\n- 4号悄悄跟我说他是共情者，信息是1。\n- 3号（我）第一晚被熊孩子锁了，今天感觉信息不对劲。",
        clearConsole: "清空输入",
        analyzeBtn: "发送给AI分析局势",
        voiceInputTitle: "语音录入说明",
        tabAnalysis: "即时分析",
        tabWorldlines: "平行世界线",
        tabTips: "行动建议",
        welcomeTitle: "你好，钟楼探索者",
        welcomeDesc: "请配置你的游戏，并在上方输入局势变动。我将通过分析座位物理相对位置、技能边界及逻辑冲突，为你生成世界线分析与战术建议。",
        emptyWorldlines: "等待数据录入后，将在这里推演 <b>正常世界线</b>、<b>涡流世界线</b> 以及 <b>下毒世界线</b> 的逻辑合理性概率。",
        emptyTips: "这里将为你生成本轮白天最推荐私聊的玩家、应该核对的身份，以及防止猝死或邪恶阵营直接获胜的紧急提示。",
        popoverRole: "宣称角色 (Claimed)",
        popoverAlive: "存活状态",
        popoverAlignment: "推测阵营",
        popoverGood: "善良",
        popoverEvil: "邪恶",
        popoverUnknown: "未知",
        popoverPoisoned: "中毒/醉酒状态",
        popoverNotesLabel: "私聊记录 / 备注信息",
        popoverNotesPlaceholder: "输入例如：自称是守鸦人让我别碰他",
        saveStatus: "保存状态",
        townsfolkSection: "村民角色 (Townsfolk)",
        outsidersSection: "外来者角色 (Outsiders)",
        minionsSection: "爪牙角色 (Minions)",
        demonsSection: "恶魔角色 (Demons)"
    },
    en: {
        restoreGame: "Restore Previous Game",
        apiStatusReady: "Gemini API Ready",
        apiStatusOffline: "Offline Mode: Data Saved Locally",
        panelSetupTitle: "Setup & Management",
        gatewayConfig: "AI Engine Configuration",
        apiProvider: "AI Provider",
        apiBaseUrl: "API Base URL",
        apiKeyLabel: "API Key",
        aiModel: "Reasoning Model",
        customModelId: "Custom Model ID",
        apiConfigTip: "Google Gemini key pre-filled by default. Supports latest Gemini 3.5 Flash and Gemini 3.1 Pro models instantly!",
        initGameTitle: "Initialize New Game",
        playerCount: "Player Count",
        scriptSelect: "Script / Board",
        previewScript: "Preview Character Sheet",
        mySeat: "My Seat Number",
        myRole: "My Character",
        myAlignment: "My Alignment",
        goodAlignment: "Good Team",
        evilAlignment: "Evil Team",
        evilBluffsTitle: "3 Demon Bluffs Given by Storyteller",
        initGameBtn: "Initialize & Start Game",
        playerQuickAdjust: "Quick Status Adjustments",
        resetAll: "Reset All",
        legendGood: "Good",
        legendEvil: "Evil",
        legendDead: "Dead",
        legendPoisoned: "Poisoned/Drunk",
        panelMapTitle: "Interactive Seating Circle",
        timelineTitle: "Game Action & Interaction Logs",
        emptyLogs: "No game logs yet. Enter the first turn event or whisper in the console on the right.",
        panelAiTitle: "AI Tactical Copilot",
        consoleInputLabel: "Enter Current Turn Updates (Natural Language)",
        consoleInputPlaceholder: "E.g.,\n- Seat 5 is dead. During day, Seat 2 claimed Chef and got a '0'.\n- Seat 4 whispered to me that they are Empath with a '1'.\n- Seat 3 (Me) got locked by Rascal on Night 1, info feels poisoned.",
        clearConsole: "Clear Input",
        analyzeBtn: "Send to AI for Analysis",
        voiceInputTitle: "Voice Input Notes",
        tabAnalysis: "Instant Analysis",
        tabWorldlines: "Parallel Worldlines",
        tabTips: "Tactical Tips",
        welcomeTitle: "Hello, Clocktower Explorer",
        welcomeDesc: "Configure your setup and enter turn details. I will analyze seat positions, skill boundaries, and logical contradictions to generate deductions and suggestions.",
        emptyWorldlines: "Awaiting input. I will calculate normal, Vortox, and poisoned worldline probabilities here.",
        emptyTips: "I will suggest optimal private chat targets, alignment verifications, and urgent survival warnings here.",
        popoverRole: "Claimed Character",
        popoverAlive: "Survival Status",
        popoverAlignment: "Suspected Alignment",
        popoverGood: "Good",
        popoverEvil: "Evil",
        popoverUnknown: "Unknown",
        popoverPoisoned: "Drunk/Poisoned Status",
        popoverNotesLabel: "Private Chat & Notes",
        popoverNotesPlaceholder: "E.g., Claimed Ravenkeeper, asked me not to target him",
        saveStatus: "Save Status",
        townsfolkSection: "Townsfolk",
        outsidersSection: "Outsiders",
        minionsSection: "Minions",
        demonsSection: "Demons"
    }
};

const gameState = {
    apiKey: "AIzaSyATGfywDEpzV4uav_YLvVK7-HTLbO7TKrk",
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
    selectedSeatForEdit: null,
    lang: "zh"
};

// --- DOM 元素引用 ---
const dom = {
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
    consoleInput: document.getElementById("consoleInput"),
    clearConsoleBtn: document.getElementById("clearConsoleBtn"),
    analyzeBtn: document.getElementById("analyzeBtn"),
    tabButtons: document.querySelectorAll(".tab-btn"),
    tabContents: document.querySelectorAll(".tab-content"),
    analysisBox: document.getElementById("analysisBox"),
    worldlinesBox: document.getElementById("worldlinesBox"),
    tipsBox: document.getElementById("tipsBox"),
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
    langToggleText: document.getElementById("langToggleText")
};

// --- 初始化程序入口 ---
document.addEventListener("DOMContentLoaded", () => {
    // 渲染图标
    lucide.createIcons();
    
    // 初始化板子角色下拉框
    updateMyRoleOptions();
    
    // 初始化 AI 模型配置下拉框
    updateApiModelOptions();
    
    // 渲染并填充剧本板子角色对照表
    populateScriptPreview();
    
    // 监测网络连接状态
    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // 检查是否有未完成的缓存对局并自动加载，避免覆盖
    const hasSaved = checkSavedGame();
    if (hasSaved) {
        loadFromLocalStorage();
        const restoreMsg = gameState.lang === "en"
            ? "Successfully recovered the last game state!"
            : "已自动为您恢复上次对局状态！";
        showToast(restoreMsg);
    } else {
        initGame();
    }
    
    // 载入保存的语言选择，默认中文
    const savedLang = localStorage.getItem("botc_lang") || "zh";
    setLanguage(savedLang);
    
    // 注册事件监听器
    registerEventListeners();
});

// --- 动态填充角色下拉菜单 ---
function updateMyRoleOptions() {
    const script = SCRIPTS_DATA[dom.scriptSelect.value];
    dom.myRoleSelect.innerHTML = "";
    
    const allRoles = [...script.townsfolk, ...script.outsider, ...script.minion, ...script.demon];
    allRoles.forEach(role => {
        const option = document.createElement("option");
        option.value = role;
        option.textContent = role;
        if (role === "共情者") option.selected = true;
        dom.myRoleSelect.appendChild(option);
    });

    // 同时填充弹窗里的角色选择框
    dom.popoverRoleSelect.innerHTML = '<option value="未知">未知角色</option>';
    allRoles.forEach(role => {
        const option = document.createElement("option");
        option.value = role;
        option.textContent = role;
        dom.popoverRoleSelect.appendChild(option);
    });

    // 填充邪恶伪装选项 (只限村民和外来者，因为伪装一定是好人)
    const goodRoles = [...script.townsfolk, ...script.outsider];
    [dom.evilBluff1, dom.evilBluff2, dom.evilBluff3].forEach((select, idx) => {
        if (!select) return;
        select.innerHTML = `<option value="">-- 伪装 ${idx + 1} --</option>`;
        goodRoles.forEach(role => {
            const option = document.createElement("option");
            option.value = role;
            option.textContent = role;
            select.appendChild(option);
        });
    });
}

// --- 动态填充预设 AI 模型选项 ---
function updateApiModelOptions() {
    const provider = dom.apiProviderSelect.value;
    dom.aiModelSelect.innerHTML = "";
    
    let presets = [];
    
    if (provider === "gemini") {
        presets = [
            { value: "gemini-flash-latest", text: "Gemini Flash 最新动态版 (当前指向 3.5 Flash)" },
            { value: "gemini-3.5-flash", text: "Gemini 3.5 Flash (最新 2026 闪电旗舰/带推理)" },
            { value: "gemini-3.1-pro-preview", text: "Gemini 3.1 Pro (最新 2026 深度推理Pro/带推理)" },
            { value: "custom", text: "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.add("hidden");
        dom.apiKeyLabel.textContent = "Gemini API Key (密钥)";
        dom.apiConfigTip.textContent = "已自动填充 Google Gemini 原生密钥，支持最新的 3.5 Flash 极速推理模型以及 3.1 Pro 深度推理模型，无需配置直接使用！";
    } else if (provider === "chatgpt") {
        presets = [
            { value: "gpt-5.5", text: "GPT-5.5 Flagship (最新 2026 核心旗舰)" },
            { value: "gpt-5.4", text: "GPT-5.4 Standard (主力高吞吐工作流模型)" },
            { value: "gpt-5.4-mini", text: "GPT-5.4 Mini (低延迟轻量级大模型)" },
            { value: "custom", text: "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = "OpenAI API Key (密钥)";
        dom.apiConfigTip.textContent = "请填入您的 OpenAI API 密钥。支持自定义中转接口 Base URL（支持各大中转代理平台）。";
    } else if (provider === "claude") {
        presets = [
            { value: "claude-opus-4-8", text: "Claude Opus 4.8 (最新 2026 终极智能旗舰)" },
            { value: "claude-sonnet-4-6", text: "Claude Sonnet 4.6 (高速度与深度推理平衡模范)" },
            { value: "custom", text: "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = "Anthropic API Key / 代理密钥";
        dom.apiConfigTip.textContent = "支持原生 Claude 密钥（直连需要本地开发或翻墙），以及各类 OpenAI 格式中转代理密钥（修改 Base URL 即可）。";
    } else if (provider === "deepseek") {
        presets = [
            { value: "deepseek-v4-pro", text: "DeepSeek V4 Pro (最新 2026 深度思考旗舰)" },
            { value: "deepseek-v4-flash", text: "DeepSeek V4 Flash (最新 2026 极速旗舰)" },
            { value: "custom", text: "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = "DeepSeek API Key (密钥)";
        dom.apiConfigTip.textContent = "支持 DeepSeek 官方密钥（基地址为 https://api.deepseek.com/v1）或各大厂商兼容中转密钥。";
    } else if (provider === "qwen") {
        presets = [
            { value: "qwen3.7-max", text: "通义千问 Qwen 3.7 Max (最新 2026 商业旗舰)" },
            { value: "custom", text: "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = "阿里通义 API Key (密钥)";
        dom.apiConfigTip.textContent = "支持阿里云 DashScope 密钥（基地址为 https://dashscope.aliyuncs.com/compatible-mode/v1）及其代理密钥。";
    } else if (provider === "zhipu") {
        presets = [
            { value: "glm-5.1", text: "GLM-5.1 Flagship (最新 2026 本土最强 MoE 旗舰)" },
            { value: "custom", text: "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = "智谱 GLM API Key (密钥)";
        dom.apiConfigTip.textContent = "支持智谱开放平台 API 密钥（基地址为 https://open.bigmodel.cn/api/paas/v4/）。";
    } else if (provider === "doubao") {
        presets = [
            { value: "doubao-seed-2-0-pro-260215", text: "Doubao Seed 2.0 Pro (最新 2026 字节旗舰)" },
            { value: "custom", text: "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = "火山引擎 API Key (密钥)";
        dom.apiConfigTip.textContent = "支持火山引擎大模型服务平台 API 密钥（基地址为 https://ark.cn-beijing.volces.com/api/v3）。";
    } else if (provider === "kimi") {
        presets = [
            { value: "kimi-k2.6", text: "Kimi K2.6 (最新 2026 Agent Swarm 深度推理)" },
            { value: "custom", text: "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = "月之暗面 Kimi API Key";
        dom.apiConfigTip.textContent = "支持月之暗面开放平台 API 密钥（基地址为 https://api.moonshot.cn/v1）。";
    } else if (provider === "baidu") {
        presets = [
            { value: "ernie-5.1", text: "ERNIE 5.1 (最新 2026 百度中文搜索推理旗舰)" },
            { value: "custom", text: "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = "百度 API Key (AccessToken)";
        dom.apiConfigTip.textContent = "支持百度文心千帆/AI Studio 开放平台 API 密钥（基地址为 https://aistudio.baidu.com/llm/lmapi/v3）。";
    } else { // custom / others
        presets = [
            { value: "custom", text: "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = "API Key / 接口密钥";
        dom.apiConfigTip.textContent = "用于对接各类未列出的模型网关协议、SiliconFlow 代理、本地 Ollama 离线部署等。";
    }
    
    presets.forEach(preset => {
        const option = document.createElement("option");
        option.value = preset.value;
        option.textContent = preset.text;
        if (preset.value === gameState.aiModel) {
            option.selected = true;
        }
        dom.aiModelSelect.appendChild(option);
    });
    
    // 如果之前保存的是自定义模型，选中 custom
    const isPreset = presets.some(p => p.value === gameState.aiModel);
    if (!isPreset && gameState.aiModel) {
        Array.from(dom.aiModelSelect.options).forEach(opt => {
            if (opt.value === "custom") {
                opt.selected = true;
            }
        });
        dom.apiModelCustomContainer.classList.remove("hidden");
        dom.apiModelCustomInput.value = gameState.aiModel;
    } else {
        if (dom.aiModelSelect.value === "custom") {
            dom.apiModelCustomContainer.classList.remove("hidden");
            dom.apiModelCustomInput.value = gameState.apiModelCustom;
        } else {
            dom.apiModelCustomContainer.classList.add("hidden");
        }
    }
}

// --- 动态填充并渲染剧本板子角色对照表 ---
function populateScriptPreview() {
    const selectedScriptKey = dom.scriptSelect ? dom.scriptSelect.value : "wushang";
    const script = SCRIPTS_DATA[selectedScriptKey] || SCRIPTS_DATA.wushang;
    
    // 动态更新弹窗标题
    const previewTitle = document.querySelector("#scriptPreviewModal h4");
    if (previewTitle) {
        previewTitle.textContent = `《${script.name}》剧本角色对照表`;
    }

    // 动态更新分类下方的数量提示
    const containerHeaderGood = document.getElementById("previewTownsfolkContainer") ? document.getElementById("previewTownsfolkContainer").previousElementSibling : null;
    if (containerHeaderGood && containerHeaderGood.tagName === "H5") {
        const countText = containerHeaderGood.querySelector("span:last-child");
        if (countText) countText.textContent = `共 ${script.townsfolk.length} 个`;
    }
    const containerHeaderOutsider = document.getElementById("previewOutsidersContainer") ? document.getElementById("previewOutsidersContainer").previousElementSibling : null;
    if (containerHeaderOutsider && containerHeaderOutsider.tagName === "H5") {
        const countText = containerHeaderOutsider.querySelector("span:last-child");
        if (countText) countText.textContent = `共 ${script.outsider.length} 个`;
    }
    const containerHeaderMinion = document.getElementById("previewMinionsContainer") ? document.getElementById("previewMinionsContainer").previousElementSibling : null;
    if (containerHeaderMinion && containerHeaderMinion.tagName === "H5") {
        const countText = containerHeaderMinion.querySelector("span:last-child");
        if (countText) countText.textContent = `共 ${script.minion.length} 个`;
    }
    const containerHeaderDemon = document.getElementById("previewDemonsContainer") ? document.getElementById("previewDemonsContainer").previousElementSibling : null;
    if (containerHeaderDemon && containerHeaderDemon.tagName === "H5") {
        const countText = containerHeaderDemon.querySelector("span:last-child");
        if (countText) countText.textContent = `共 ${script.demon.length} 个`;
    }
    
    const renderCards = (roles, containerId, borderThemeClass) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = "";
        
        roles.forEach(role => {
            const desc = (CHARACTER_DETAILS[selectedScriptKey] && CHARACTER_DETAILS[selectedScriptKey][role]) || "暂无能力详细描述。";
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

// --- 初始化游戏核心逻辑 ---
function initGame() {
    gameState.apiKey = dom.apiKeyInput.value.trim() || gameState.apiKey;
    gameState.playerCount = parseInt(dom.playerCountSelect.value);
    gameState.scriptName = dom.scriptSelect.value;
    gameState.mySeat = parseInt(dom.mySeatInput.value);
    gameState.myRole = dom.myRoleSelect.value;
    gameState.myAlignment = dom.myAlignmentSelect.value;
    gameState.apiProvider = dom.apiProviderSelect.value;
    gameState.apiBaseUrl = dom.apiBaseUrlInput.value.trim();
    gameState.aiModel = dom.aiModelSelect.value;
    gameState.apiModelCustom = dom.apiModelCustomInput.value.trim();
    
    // 获取邪恶伪装身份
    gameState.evilBluffs = [
        dom.evilBluff1.value,
        dom.evilBluff2.value,
        dom.evilBluff3.value
    ].filter(b => b !== "");

    // 创建玩家数组
    gameState.players = [];
    for (let i = 1; i <= gameState.playerCount; i++) {
        const isMe = (i === gameState.mySeat);
        gameState.players.push({
            seat: i,
            name: isMe ? "我" : `玩家 ${i}`,
            alive: true,
            claim: isMe ? gameState.myRole : "未知",
            alignment: isMe ? gameState.myAlignment : "unknown",
            poisoned: false,
            note: isMe ? "这是我的底牌角色" : ""
        });
    }

    // 重置日志流水志
    gameState.logs = [
        `对局初始化：${gameState.playerCount} 人本，板子《${SCRIPTS_DATA[gameState.scriptName].name}》。`,
        `我的位置是 <strong>${gameState.mySeat} 号</strong>，角色是 <strong>${gameState.myRole}</strong> (${gameState.myAlignment === "good" ? "善良阵营" : "邪恶阵营"})。`
    ];

    // 如果是邪恶阵营，追加伪装记录
    if (gameState.myAlignment === "evil") {
        const bluffsText = gameState.evilBluffs.length > 0 ? gameState.evilBluffs.join('、') : "未填报";
        gameState.logs.push(`说书人给的 3 个好人伪装身份：<strong>${bluffsText}</strong>。`);
    }

    // 更新界面
    renderSeatingChart();
    renderPlayerList();
    renderTimelineLogs();

    // 重置分析框
    resetAnalysisBoxes();

    // 初始化完成后自动折叠配置面板，腾出空间给玩家列表
    const initGameDetails = document.getElementById("initGameDetails");
    if (initGameDetails) {
        initGameDetails.open = false;
    }

    // 保存状态到本地
    saveToLocalStorage();
}

// --- 重置分析输出框 ---
function resetAnalysisBoxes() {
    dom.analysisBox.innerHTML = `
        <div class="ai-welcome">
            <i data-lucide="bot" class="welcome-icon"></i>
            <h3>你好，钟楼探索者</h3>
            <p>对局已成功初始化！请在右侧控制台输入第一轮夜晚或白天的信息，我将通过逻辑求解器与平行世界算法为您演算战局。</p>
        </div>
    `;
    dom.worldlinesBox.innerHTML = `
        <div class="empty-tab-state">
            <p>等待局势录入中。稍后这里会推演 <b>正常世界线</b>、<b>涡流世界线</b> 以及 <b>中毒世界线</b> 的逻辑概率。</p>
        </div>
    `;
    dom.tipsBox.innerHTML = `
        <div class="empty-tab-state">
            <p>等待局势录入中。稍后将为你生成本轮最推荐私聊的玩家以及防死警告。</p>
        </div>
    `;
    lucide.createIcons();
}

// --- 渲染环形座位轨迹图 ---
function renderSeatingChart() {
    dom.seatingNodesContainer.innerHTML = "";
    const width = 360;
    const height = 360;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 130; // 环形半径
    const count = gameState.playerCount;

    // 动态更新圆桌中心的剧本背景水印与高贵霓虹呼吸灯效果
    if (dom.seatingChartWatermark) {
        const currentScript = SCRIPTS_DATA[gameState.scriptName];
        dom.seatingChartWatermark.textContent = currentScript.name;
        
        if (gameState.scriptName === "wushang" || gameState.scriptName === "mengyun") {
            dom.seatingChartWatermark.style.color = "rgba(255, 51, 102, 0.15)";
            dom.seatingChartWatermark.style.textShadow = "0 0 10px rgba(255, 51, 102, 0.05)";
        } else {
            dom.seatingChartWatermark.style.color = "rgba(0, 210, 255, 0.15)";
            dom.seatingChartWatermark.style.textShadow = "0 0 10px rgba(0, 210, 255, 0.05)";
        }
    }

    // 清空旧 SVG 连线
    dom.seatingSvg.innerHTML = "";

    // 绘制外部大圆桌底轮廓
    const tableCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    tableCircle.setAttribute("cx", centerX);
    tableCircle.setAttribute("cy", centerY);
    tableCircle.setAttribute("r", radius);
    tableCircle.setAttribute("stroke", "rgba(255, 255, 255, 0.05)");
    tableCircle.setAttribute("stroke-width", "1");
    tableCircle.setAttribute("fill", "none");
    dom.seatingSvg.appendChild(tableCircle);

    // 动态生成座位节点坐标，并保存到节点中，方便画线
    const nodeCoords = [];

    for (let i = 0; i < count; i++) {
        const player = gameState.players[i];
        
        // 动态旋转：确保“我”（gameState.mySeat）的座位始终位于正下方最中间（即 Math.PI / 2，90度角）
        const angle = Math.PI / 2 + ((player.seat - gameState.mySeat) * 2 * Math.PI) / count;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        nodeCoords.push({ seat: player.seat, x, y });

        // 渲染 HTML 节点
        const node = document.createElement("div");
        node.className = `seat-node ${player.alignment} ${player.poisoned ? 'poisoned' : ''} ${!player.alive ? 'dead' : ''}`;
        if (player.seat === gameState.mySeat) node.classList.add("me");
        
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        
        node.innerHTML = `
            <div class="seat-node-circle">
                <span class="seat-node-num">${player.seat}</span>
                <span class="seat-node-name">${player.name === "我" ? "我" : player.name}</span>
                ${player.claim !== "未知" ? `<span class="seat-node-role">${player.claim}</span>` : ""}
            </div>
        `;

        // 绑定点击事件，点击在地图上弹窗修改
        node.addEventListener("click", () => openPopover(player.seat));
        dom.seatingNodesContainer.appendChild(node);
    }

    // 针对相邻存活玩家，绘制物理邻座连线
    drawAdjacencyLines(nodeCoords);
}

// --- 动态绘制存活物理邻座连线 (Adjacency SVG Curves) ---
function drawAdjacencyLines(coords) {
    const count = gameState.players.length;
    
    // 找出所有存活玩家
    const alivePlayers = gameState.players.filter(p => p.alive);
    if (alivePlayers.length < 2) return;

    for (let i = 0; i < alivePlayers.length; i++) {
        const p1 = alivePlayers[i];
        const p2 = alivePlayers[(i + 1) % alivePlayers.length]; // 环形下一个人

        const c1 = coords.find(c => c.seat === p1.seat);
        const c2 = coords.find(c => c.seat === p2.seat);

        if (c1 && c2) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", c1.x);
            line.setAttribute("y1", c1.y);
            line.setAttribute("x2", c2.x);
            line.setAttribute("y2", c2.y);
            
            // 如果我活在场上，加亮与我相邻存活好人的物理连接
            const isRelatedToMe = (p1.seat === gameState.mySeat || p2.seat === gameState.mySeat);
            if (isRelatedToMe && gameState.myAlignment === "good") {
                line.setAttribute("stroke", "rgba(0, 210, 255, 0.35)");
                line.setAttribute("stroke-width", "2");
                line.setAttribute("stroke-dasharray", "4,4");
            } else {
                line.setAttribute("stroke", "rgba(255, 255, 255, 0.05)");
                line.setAttribute("stroke-width", "1");
            }
            dom.seatingSvg.appendChild(line);
        }
    }
}

// --- 渲染左下角玩家列表控制面板 ---
function renderPlayerList() {
    dom.playerListContainer.innerHTML = "";
    
    gameState.players.forEach(player => {
        const isMe = (player.seat === gameState.mySeat);
        const row = document.createElement("div");
        row.className = `player-item-row ${!player.alive ? 'dead' : ''}`;
        if (isMe) row.classList.add("me");

        row.innerHTML = `
            <div class="player-info-meta">
                <span class="seat-badge">${player.seat}</span>
                <span class="player-name-text">${player.name}</span>
                <span class="player-claim-badge">${player.claim}</span>
            </div>
            <div class="player-actions-toggles">
                <label class="toggle-switch" title="存活/死亡">
                     <input type="checkbox" class="alive-toggle" data-seat="${player.seat}" ${player.alive ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
                <label class="toggle-switch" title="中毒/醉酒">
                    <input type="checkbox" class="poison-toggle" data-seat="${player.seat}" ${player.poisoned ? 'checked' : ''}>
                    <span class="slider purple"></span>
                </label>
                <button class="btn-text edit-player-btn" data-seat="${player.seat}"><i data-lucide="edit-3" style="width:12px;height:12px;"></i></button>
            </div>
        `;

        // 绑定列表内的快速切换事件
        row.querySelector(".alive-toggle").addEventListener("change", (e) => {
            togglePlayerAlive(player.seat, e.target.checked);
        });

        row.querySelector(".poison-toggle").addEventListener("change", (e) => {
            togglePlayerPoison(player.seat, e.target.checked);
        });

        row.querySelector(".edit-player-btn").addEventListener("click", () => {
            openPopover(player.seat);
        });

        dom.playerListContainer.appendChild(row);
    });

    lucide.createIcons();
}

// --- 渲染局势流向日志 ---
function renderTimelineLogs() {
    dom.timelineLogsContainer.innerHTML = "";
    dom.logCountText.textContent = `共 ${gameState.logs.length} 条信息`;

    if (gameState.logs.length === 0) {
        dom.timelineLogsContainer.innerHTML = `
            <div class="empty-state">
                <i data-lucide="clipboard-list" class="empty-icon"></i>
                <p>暂无游戏记录，在右侧控制台输入第一条局势变动吧</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    gameState.logs.forEach((log, index) => {
        const item = document.createElement("div");
        item.className = "log-item";
        
        // 简单着色
        if (log.includes("邪恶") || log.includes("死亡") || log.includes("处决")) {
            item.classList.add("evil");
        } else if (log.includes("善良") || log.includes("共情者") || log.includes("初始化")) {
            item.classList.add("good");
        } else {
            item.classList.add("system");
        }

        item.innerHTML = `[事件 ${index + 1}] ${log}`;
        dom.timelineLogsContainer.appendChild(item);
    });
    
    // 自动滚动到底部
    dom.timelineLogsContainer.scrollTop = dom.timelineLogsContainer.scrollHeight;
}

// --- 状态变动辅助函数 ---
function togglePlayerAlive(seat, isAlive) {
    const player = gameState.players.find(p => p.seat === seat);
    if (player) {
        player.alive = isAlive;
        gameState.logs.push(`<strong>${player.name}</strong> 状态更新为：${isAlive ? '存活' : '❌ 死亡'}`);
        renderSeatingChart();
        renderPlayerList();
        renderTimelineLogs();
        saveToLocalStorage();
    }
}

function togglePlayerPoison(seat, isPoisoned) {
    const player = gameState.players.find(p => p.seat === seat);
    if (player) {
        player.poisoned = isPoisoned;
        gameState.logs.push(`<strong>${player.name}</strong> 标记为：${isPoisoned ? '🟣 中毒/醉酒状态' : '已恢复健康状态'}`);
        renderSeatingChart();
        renderPlayerList();
        renderTimelineLogs();
        saveToLocalStorage();
    }
}

// --- 弹窗 Modal 管理 ---
function openPopover(seat) {
    gameState.selectedSeatForEdit = seat;
    const player = gameState.players.find(p => p.seat === seat);
    if (!player) return;

    dom.popoverPlayerTitle.textContent = `${player.name === "我" ? "我 (自己)" : player.name} 状态编辑`;
    dom.popoverRoleSelect.value = player.claim;
    dom.popoverAliveCheckbox.checked = player.alive;
    dom.popoverAlignmentSelect.value = player.alignment;
    dom.popoverPoisonCheckbox.checked = player.poisoned;
    dom.popoverNoteInput.value = player.note;

    dom.popoverModal.classList.remove("hidden");
}

function closePopover() {
    dom.popoverModal.classList.add("hidden");
    gameState.selectedSeatForEdit = null;
}

function savePopoverData() {
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
    if (oldClaim !== newClaim) changes.push(`宣称变更为 <strong>${newClaim}</strong>`);
    if (oldAlive !== newAlive) changes.push(`生命状态变更为 <strong>${newAlive ? '存活' : '死亡'}</strong>`);
    if (oldAlignment !== newAlignment) changes.push(`推测阵营变更为 <strong>${newAlignment === 'good' ? '善良' : newAlignment === 'evil' ? '邪恶' : '未知'}</strong>`);
    if (oldPoison !== newPoison) changes.push(`状态标记为 <strong>${newPoison ? '中毒/醉酒' : '正常'}</strong>`);
    if (newNote && newNote !== player.note) changes.push(`备注："${newNote}"`);

    if (changes.length > 0) {
        gameState.logs.push(`手动更新了 <strong>${player.name}</strong> 的状态：${changes.join('，')}`);
    }

    closePopover();
    renderSeatingChart();
    renderPlayerList();
    renderTimelineLogs();
    
    // 保存状态到本地
    saveToLocalStorage();
}

// --- 网络状态指示灯更新 ---
function updateNetworkStatus() {
    if (!dom.apiStatusIndicator || !dom.apiStatusText) return;
    if (navigator.onLine) {
        dom.apiStatusIndicator.className = "status-indicator online";
        dom.apiStatusText.textContent = "AI 接口已就绪";
    } else {
        dom.apiStatusIndicator.className = "status-indicator offline";
        dom.apiStatusText.textContent = "离线模式 (数据已保存在本地)";
    }
}

// --- 全局 Toast 提示辅助 ---
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message glass";
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "12px";
    toast.style.border = "1px solid rgba(0, 210, 255, 0.25)";
    toast.style.background = "rgba(10, 25, 50, 0.85)";
    toast.style.color = "var(--text-primary)";
    toast.style.fontFamily = "Outfit, sans-serif";
    toast.style.fontSize = "12.5px";
    toast.style.fontWeight = "600";
    toast.style.zIndex = "9999";
    toast.style.boxShadow = "0 8px 32px rgba(0, 210, 255, 0.15)";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "8px";
    toast.style.animation = "slideIn 0.3s ease-out forwards";
    toast.innerHTML = `<i data-lucide="check-circle" style="width:16px;height:16px;color:var(--color-good);"></i> ${message}`;
    
    document.body.appendChild(toast);
    lucide.createIcons({ attrs: { class: 'icon-sm' } });

    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s ease-in forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- 事件监听器绑定 ---
function registerEventListeners() {
    // 剧本更换监听
    dom.scriptSelect.addEventListener("change", () => {
        updateMyRoleOptions();
        populateScriptPreview();
        saveToLocalStorage();
    });
    
    // 厂商协议更换监听
    dom.apiProviderSelect.addEventListener("change", (e) => {
        gameState.apiProvider = e.target.value;
        
        // 切换厂商时，防止不同平台密钥混用或无意泄露
        if (gameState.apiProvider === "gemini") {
            if (dom.apiKeyInput.value.startsWith("sk-") || dom.apiKeyInput.value.startsWith("sk-or-")) {
                dom.apiKeyInput.value = "";
            }
        } else if (gameState.apiProvider === "chatgpt" || gameState.apiProvider === "deepseek" || gameState.apiProvider === "qwen" || gameState.apiProvider === "claude") {
            if (dom.apiKeyInput.value.startsWith("AIzaSy")) {
                dom.apiKeyInput.value = "";
            }
        }
        
        updateApiModelOptions();
        
        // 自动切换对应的预设 Base URL
        if (gameState.apiProvider === "chatgpt") {
            dom.apiBaseUrlInput.value = "https://api.openai.com/v1";
        } else if (gameState.apiProvider === "claude") {
            dom.apiBaseUrlInput.value = "https://api.anthropic.com/v1";
        } else if (gameState.apiProvider === "deepseek") {
            dom.apiBaseUrlInput.value = "https://api.deepseek.com/v1";
        } else if (gameState.apiProvider === "qwen") {
            dom.apiBaseUrlInput.value = "https://dashscope.aliyuncs.com/compatible-mode/v1";
        } else if (gameState.apiProvider === "zhipu") {
            dom.apiBaseUrlInput.value = "https://open.bigmodel.cn/api/paas/v4/";
        } else if (gameState.apiProvider === "doubao") {
            dom.apiBaseUrlInput.value = "https://ark.cn-beijing.volces.com/api/v3";
        } else if (gameState.apiProvider === "kimi") {
            dom.apiBaseUrlInput.value = "https://api.moonshot.cn/v1";
        } else if (gameState.apiProvider === "baidu") {
            dom.apiBaseUrlInput.value = "https://aistudio.baidu.com/llm/lmapi/v3";
        } else if (gameState.apiProvider === "custom") {
            if (!dom.apiBaseUrlInput.value || dom.apiBaseUrlInput.value.includes("api.openai.com") || dom.apiBaseUrlInput.value.includes("api.deepseek.com") || dom.apiBaseUrlInput.value.includes("dashscope.aliyuncs.com") || dom.apiBaseUrlInput.value.includes("api.anthropic.com") || dom.apiBaseUrlInput.value.includes("bigmodel.cn") || dom.apiBaseUrlInput.value.includes("volces.com") || dom.apiBaseUrlInput.value.includes("moonshot.cn") || dom.apiBaseUrlInput.value.includes("baidu.com")) {
                dom.apiBaseUrlInput.value = "http://localhost:11434/v1";
            }
        }
        
        gameState.apiBaseUrl = dom.apiBaseUrlInput.value;
        gameState.aiModel = dom.aiModelSelect.value;
        
        saveToLocalStorage();
    });

    // 模型选择监听
    dom.aiModelSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val === "custom") {
            dom.apiModelCustomContainer.classList.remove("hidden");
            dom.apiModelCustomInput.focus();
            gameState.aiModel = dom.apiModelCustomInput.value.trim() || "custom";
        } else {
            dom.apiModelCustomContainer.classList.add("hidden");
            gameState.aiModel = val;
            
            // 切换模型时，如果是对应的厂商，也做一次智能预设
            if (gameState.apiProvider === "chatgpt") {
                dom.apiBaseUrlInput.value = "https://api.openai.com/v1";
            } else if (gameState.apiProvider === "claude") {
                dom.apiBaseUrlInput.value = "https://api.anthropic.com/v1";
            } else if (gameState.apiProvider === "deepseek") {
                dom.apiBaseUrlInput.value = "https://api.deepseek.com/v1";
            } else if (gameState.apiProvider === "qwen") {
                dom.apiBaseUrlInput.value = "https://dashscope.aliyuncs.com/compatible-mode/v1";
            } else if (gameState.apiProvider === "zhipu") {
                dom.apiBaseUrlInput.value = "https://open.bigmodel.cn/api/paas/v4/";
            } else if (gameState.apiProvider === "doubao") {
                dom.apiBaseUrlInput.value = "https://ark.cn-beijing.volces.com/api/v3";
            } else if (gameState.apiProvider === "kimi") {
                dom.apiBaseUrlInput.value = "https://api.moonshot.cn/v1";
            } else if (gameState.apiProvider === "baidu") {
                dom.apiBaseUrlInput.value = "https://aistudio.baidu.com/llm/lmapi/v3";
            }
            gameState.apiBaseUrl = dom.apiBaseUrlInput.value;
        }
        saveToLocalStorage();
    });

    // 自定义模型名称输入监听
    dom.apiModelCustomInput.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        gameState.aiModel = val || "custom";
        gameState.apiModelCustom = val;
        saveToLocalStorage();
    });

    // 接口基地址输入监听
    dom.apiBaseUrlInput.addEventListener("input", (e) => {
        gameState.apiBaseUrl = e.target.value.trim();
        saveToLocalStorage();
    });

    // 输入框草稿自动保存
    dom.consoleInput.addEventListener("input", () => {
        saveToLocalStorage();
    });
    
    // 阵营切换监听，如果是邪恶阵营则显示好人伪装配置框
    dom.myAlignmentSelect.addEventListener("change", (e) => {
        if (e.target.value === "evil") {
            dom.evilBluffsContainer.classList.remove("hidden");
        } else {
            dom.evilBluffsContainer.classList.add("hidden");
        }
        saveToLocalStorage();
    });

    // 新对局初始化
    dom.initGameBtn.addEventListener("click", initGame);
    
    // 重置所有玩家
    dom.resetPlayersBtn.addEventListener("click", () => {
        if (confirm("确定要重置当前对局所有玩家的状态吗？（日志和本地缓存也会被重置）")) {
            localStorage.removeItem("botc_game_state");
            initGame();
        }
    });

    // 弹出窗口控制
    dom.closePopoverBtn.addEventListener("click", closePopover);
    dom.savePopoverBtn.addEventListener("click", savePopoverData);

    // 剧本角色对照表预览窗口控制
    if (dom.previewScriptBtn && dom.scriptPreviewModal) {
        dom.previewScriptBtn.addEventListener("click", () => {
            dom.scriptPreviewModal.classList.remove("hidden");
        });
    }
    if (dom.closeScriptPreviewBtn && dom.scriptPreviewModal) {
        dom.closeScriptPreviewBtn.addEventListener("click", () => {
            dom.scriptPreviewModal.classList.add("hidden");
        });
    }

    // 控制台按钮控制
    dom.clearConsoleBtn.addEventListener("click", () => {
        dom.consoleInput.value = "";
        saveToLocalStorage();
    });

    // 选项卡切换
    dom.tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            dom.tabButtons.forEach(b => b.classList.remove("active"));
            dom.tabContents.forEach(c => c.classList.remove("active"));
            
            btn.classList.add("active");
            const tabId = btn.getAttribute("data-tab");
            document.getElementById(tabId).classList.add("active");
        });
    });

    // 语音输入说明提示
    dom.voiceInputBtn.addEventListener("click", () => {
        alert("语音输入支持：\n你可以使用操作系统自带的语音听写功能（Mac 快捷键：双击 Fn 或按 F5）在输入框内直接输入文字，随后点击发送分析即可！");
    });

    // 手动恢复上次对局
    dom.restoreGameBtn.addEventListener("click", () => {
        if (loadFromLocalStorage()) {
            dom.restoreGameBtn.classList.add("hidden");
            showToast("成功手动恢复上次对局！");
        }
    });

    // 发送至 AI 分析
    dom.analyzeBtn.addEventListener("click", handleAiAnalysis);
}

// ==========================================================================
/*  AI 分析处理逻辑 - 零后端极速网关调用 */
// ==========================================================================

async function handleAiAnalysis() {
    console.log("🚨 [DEBUG] === handleAiAnalysis() 开始执行 ===");
    const rawText = dom.consoleInput.value.trim();
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
            gameState.logs.push(`白天进展陈述(暂存)："${rawText}"`);
            renderTimelineLogs();
            dom.consoleInput.value = "";
        }
        saveToLocalStorage();
        alert("检测到您目前处于离线状态！已为您将当前白天局势安全保存在本地。等您重新连接网络后，直接点击【发送给AI分析局势】即可恢复网络并发送线上演练。");
        resetAnalysisBoxes();
        return;
    }

    const isLocalhost = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
    console.log("🚨 [DEBUG] 本地服务器判定 isLocalhost =", isLocalhost);
    
    if (!apiKey && !isLocalhost) {
        console.log("🚨 [DEBUG] 缺失 API Key，拦截。");
        alert("请输入有效的 API Key 以启用分析！");
        const apiKeyDetails = document.getElementById("apiKeyDetails");
        if (apiKeyDetails) apiKeyDetails.open = true;
        dom.apiKeyInput.focus();
        return;
    }

    // 1. 如果有输入输入框，先追加到日志中
    if (rawText) {
        gameState.logs.push(`白天进展陈述："${rawText}"`);
        renderTimelineLogs();
        dom.consoleInput.value = ""; // 清空
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

    // 2. 界面切换为加载态
    const loadingHtml = `
        <div class="ai-loading-container">
            <div class="spinner-glow"></div>
            <p class="animate-pulse">${friendlyModelName} 正在对局势做多维度世界线推演...</p>
        </div>
    `;
    console.log("🚨 [DEBUG] 正在将界面切换为加载态...");
    dom.analysisBox.innerHTML = loadingHtml;
    dom.worldlinesBox.innerHTML = loadingHtml;
    dom.tipsBox.innerHTML = loadingHtml;

    // 3. 构建 Prompt
    console.log("🚨 [DEBUG] 正在构建 AI 提示词...");
    const prompt = constructGeminiPrompt(rawText);
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
        distributeAiResponse(reply, thoughtHtml);

        // 恢复状态指示灯
        dom.apiStatusIndicator.className = "status-indicator online";
        dom.apiStatusText.textContent = `${friendlyModelName} 已就绪`;

        // 保存对局进度至本地 (包含最新的 AI 分析结果)
        saveToLocalStorage();

    } catch (error) {
        console.error("AI 分析时出错:", error);
        
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
function buildThoughtHtml(thoughtText, modelName) {
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
function constructGeminiPrompt(consoleText) {
    const currentScript = SCRIPTS_DATA[gameState.scriptName];
    const scriptDetails = CHARACTER_DETAILS[gameState.scriptName] || {};
    
    const townsfolkDesc = currentScript.townsfolk.map(r => `- ${r}: ${scriptDetails[r] || ''}`).join('\n');
    const outsiderDesc = currentScript.outsider.map(r => `- ${r}: ${scriptDetails[r] || ''}`).join('\n');
    const minionDesc = currentScript.minion.map(r => `- ${r}: ${scriptDetails[r] || ''}`).join('\n');
    const demonDesc = currentScript.demon.map(r => `- ${r}: ${scriptDetails[r] || ''}`).join('\n');
    
    // 玩家数据结构化描述
    const playerStatuses = gameState.players.map(p => {
        return `- [座位 ${p.seat}] 姓名: ${p.name}, 状态: ${p.alive ? '存活' : '❌ 死亡'}, 宣称身份: ${p.claim}, 判定阵营: ${p.alignment}, 中毒标记: ${p.poisoned ? '是' : '否'}, 备注: ${p.note || '无'}`;
    }).join('\n');

    // 日志信息描述
    const gameLogs = gameState.logs.map((log, idx) => `[第 ${idx+1} 条事件] ${log}`).join('\n');

    let systemRolePrompt = "";
    let setupPrompt = "";
    if (gameState.myAlignment === "evil") {
        const bluffsStr = gameState.evilBluffs.length > 0 ? gameState.evilBluffs.join('、') : "未填报";
        systemRolePrompt = `你是一名极其资深的《血染钟楼》逻辑学家、顶尖博弈高手。你正在作为一名玩家（即玩家 ${gameState.mySeat} 号，实际身份为【邪恶阵营】的 ${gameState.myRole}）的“AI战术副驾驶”帮助他和邪恶同伴打配合、欺骗好人阵营、混淆视听并获得最终胜利。
说书人在首夜分配给他的 3 个【好人伪装身份 (Bluffs，场上绝对不在场的好人角色)】是：【${bluffsStr}】。
请务必站在邪恶阵营（恶魔或爪牙）的视角进行策略分析：
- 指导他如何巧妙地“穿”这 3 件伪装皮肤，协助他和他的邪恶队友进行高水准的身份伪装配合。
- 提供抹黑好人、抗推好人、做高同伴身份、伪造假信息的最佳阴险战术！
- 分析哪些好人的宣称是真实的，哪些是我们可以利用逻辑漏洞击破的！`;
        
        setupPrompt = `- 我的真实身份：${gameState.myRole}（【邪恶阵营】）
- 说书人给的 3 个好人伪装 (Bluffs)：${bluffsStr}`;
    } else {
        systemRolePrompt = `你是一名极其资深的《血染钟楼》逻辑学家、顶尖博弈高手。你正在作为一名玩家（即玩家 ${gameState.mySeat} 号，真实身份为【善良阵营】的 ${gameState.myRole}）的“AI战术副驾驶”帮助他梳理局势、检测逻辑冲突并找出隐藏的恶魔与爪牙。
请站在善良阵营的绝对立场，帮他寻找逻辑漏洞，防备邪恶阵营的欺骗！`;
        
        setupPrompt = `- 我的真实身份：${gameState.myRole}（善良阵营）`;
    }

    return `
${systemRolePrompt}
目前我们正在进行的游戏剧本是：《${currentScript.name}》。

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

---
请帮我根据最新的变化“${consoleText}”，输出三个模块的分析。
为了让我极高体验地使用，请严格按照以下三个标签标记划分你的输出：

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
不要合并或者漏掉以上标签。每一块内容必须以 === ANALYSIS ===, === WORLDLINES ===, === TIPS === 这三个大写标签单独占一行开启！
所有的内容请采用精美的中文 Markdown 语法呈现，包含加粗、列表，请适当使用加粗和图标让重点内容极度清晰。
`;
}

// --- 解析并分发 Gemini API 响应 ---
function distributeAiResponse(text, thoughtHtml = "") {
    console.log("🚨 [DEBUG] === distributeAiResponse() 开始执行 ===");
    console.log("🚨 [DEBUG] 原始返回文本长度:", text ? text.length : 0);
    
    let analysisPart = "";
    let worldlinesPart = "";
    let tipsPart = "";

    // 极其稳健的正则表达式，匹配可能带有多级标题、星号或空格的标签段
    // 例如：### === ANALYSIS ===, **=== ANALYSIS ===**, === Worldlines ===
    const analysisRegex = /(?:###\s*)?(?:\*\*)?===\s*ANALYSIS\s*===(?:\*\*)?/i;
    const worldlinesRegex = /(?:###\s*)?(?:\*\*)?===\s*WORLDLINES\s*===(?:\*\*)?/i;
    const tipsRegex = /(?:###\s*)?(?:\*\*)?===\s*TIPS\s*===(?:\*\*)?/i;

    const analysisMatch = text.match(analysisRegex);
    const worldlinesMatch = text.match(worldlinesRegex);
    const tipsMatch = text.match(tipsRegex);

    console.log("🚨 [DEBUG] 正则强匹配结果：", {
        analysisMatched: !!analysisMatch,
        worldlinesMatched: !!worldlinesMatch,
        tipsMatched: !!tipsMatch
    });

    if (analysisMatch && worldlinesMatch && tipsMatch) {
        const analysisIdx = analysisMatch.index;
        const worldlinesIdx = worldlinesMatch.index;
        const tipsIdx = tipsMatch.index;

        // 整理匹配项的物理范围并排序，以防AI颠倒顺序输出
        const sections = [
            { name: "analysis", start: analysisIdx, end: analysisIdx + analysisMatch[0].length },
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
            const endPos = next ? next.start : text.length;
            return text.substring(startPos, endPos).trim();
        };

        analysisPart = getSectionContent("analysis");
        worldlinesPart = getSectionContent("worldlines");
        tipsPart = getSectionContent("tips");
    } else {
        console.log("🚨 [DEBUG] 正则强匹配失败，进入 split 兼容模式分割...");
        // 兼容性兜底正则分割（忽略大小写）
        const parts = text.split(/===\s*[a-zA-Z]+\s*===/i);
        console.log("🚨 [DEBUG] split 拆分出的 parts.length =", parts.length);
        
        if (parts.length < 4) {
            analysisPart = text;
            worldlinesPart = `<div class="empty-tab-state"><p>AI 未能完全按照标签格式输出。完整的局势推演与分析已全部渲染在第一页中，您可以直接前往通读。</p></div>`;
            tipsPart = `<div class="empty-tab-state"><p>请在【即时分析】页面中查看包含全部战术提示在内的完整推演信息。</p></div>`;
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

    // 渲染 Markdown
    console.log("🚨 [DEBUG] 正在将解析出的 HTML 渲染写入 DOM 元素中...");
    dom.analysisBox.innerHTML = thoughtHtml + parseMarkdown(analysisPart.trim());
    dom.worldlinesBox.innerHTML = parseMarkdown(worldlinesPart.trim());
    dom.tipsBox.innerHTML = parseMarkdown(tipsPart.trim());

    console.log("🚨 [DEBUG] DOM 写入完毕，数据核验：", {
        analysisBoxHtmlLength: dom.analysisBox.innerHTML.length,
        worldlinesBoxHtmlLength: dom.worldlinesBox.innerHTML.length,
        tipsBoxHtmlLength: dom.tipsBox.innerHTML.length
    });

    console.log("🚨 [DEBUG] 正在获取 DOM 物理渲染高度（若为 0 说明容器高度塌陷被 CSS 裁剪隐藏）：", {
        analysisBoxHeight: dom.analysisBox.offsetHeight,
        analysisBoxParentHeight: dom.analysisBox.parentElement ? dom.analysisBox.parentElement.offsetHeight : "No Parent",
        tipsBoxHeight: dom.tipsBox.offsetHeight,
        tipsBoxParentHeight: dom.tipsBox.parentElement ? dom.tipsBox.parentElement.offsetHeight : "No Parent",
        tabContentContainerHeight: document.querySelector(".tab-content-container") ? document.querySelector(".tab-content-container").offsetHeight : "No Container"
    });

    lucide.createIcons();
}

// --- 简易高效的 Markdown 解析器 ---
function parseMarkdown(md) {
    if (!md) return "";
    let html = md;
    
    // GitHub Alert 警示框处理
    html = html.replace(/^\>\s*\[!NOTE\]\s*(.*$)/gim, '<blockquote class="alert note"><i data-lucide="info" class="icon-sm"></i> $1</blockquote>');
    html = html.replace(/^\>\s*\[!WARNING\]\s*(.*$)/gim, '<blockquote class="alert warning"><i data-lucide="alert-triangle" class="icon-sm"></i> $1</blockquote>');
    html = html.replace(/^\>\s*\[!IMPORTANT\]\s*(.*$)/gim, '<blockquote class="alert important"><i data-lucide="shield-alert" class="icon-sm"></i> $1</blockquote>');
    
    // 粗体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 标题
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // 引用块 (排除了 Alert 块，防止冲突)
    html = html.replace(/^\>\s*(?!\[!NOTE\]|\[!WARNING\]|\[!IMPORTANT\])(.*$)/gim, '<blockquote>$1</blockquote>');
    
    // 列表项格式化
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, ''); 

    // 换行替换为段落
    html = html.split('\n\n').map(p => {
        const trimmed = p.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<block') || trimmed.startsWith('<div')) {
            return trimmed;
        }
        return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return html;
}

// ==========================================================================
//  LocalStorage 本地自动持久化存储 (Premium auto-save & crash prevention)
// ==========================================================================

function saveToLocalStorage() {
    try {
        localStorage.setItem("botc_game_state", JSON.stringify({
            playerCount: gameState.playerCount,
            scriptName: gameState.scriptName,
            mySeat: gameState.mySeat,
            myRole: gameState.myRole,
            myAlignment: gameState.myAlignment,
            evilBluffs: gameState.evilBluffs,
            apiProvider: gameState.apiProvider,
            apiBaseUrl: gameState.apiBaseUrl,
            aiModel: gameState.aiModel,
            apiModelCustom: gameState.apiModelCustom,
            players: gameState.players,
            logs: gameState.logs,
            consoleInputDraft: dom.consoleInput ? dom.consoleInput.value : "",
            analysisBoxHtml: dom.analysisBox ? dom.analysisBox.innerHTML : "",
            worldlinesBoxHtml: dom.worldlinesBox ? dom.worldlinesBox.innerHTML : "",
            tipsBoxHtml: dom.tipsBox ? dom.tipsBox.innerHTML : "",
            lang: gameState.lang
        }));
    } catch (e) {
        console.error("无法保存对局数据到本地缓存:", e);
    }
}

function checkSavedGame() {
    const saved = localStorage.getItem("botc_game_state");
    if (saved && dom.restoreGameBtn) {
        dom.restoreGameBtn.classList.remove("hidden");
        return true;
    }
    return false;
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem("botc_game_state");
    if (!saved) return false;
    try {
        const data = JSON.parse(saved);
        gameState.playerCount = data.playerCount;
        gameState.scriptName = data.scriptName;
        gameState.mySeat = data.mySeat;
        gameState.myRole = data.myRole;
        gameState.myAlignment = data.myAlignment;
        gameState.evilBluffs = data.evilBluffs || [];
        gameState.apiProvider = data.apiProvider || "gemini";
        gameState.apiBaseUrl = data.apiBaseUrl || "https://api.openai.com/v1";
        gameState.aiModel = data.aiModel || "gemini-flash-latest";
        gameState.apiModelCustom = data.apiModelCustom || "";
        gameState.players = data.players;
        gameState.logs = data.logs;
        gameState.lang = data.lang || "zh";

        // Sync i18n
        setLanguage(gameState.lang);

        // 同步 UI 控件状态
        dom.playerCountSelect.value = gameState.playerCount;
        dom.scriptSelect.value = gameState.scriptName;
        dom.mySeatInput.value = gameState.mySeat;
        dom.myRoleSelect.value = gameState.myRole;
        dom.myAlignmentSelect.value = gameState.myAlignment;
        dom.apiProviderSelect.value = gameState.apiProvider;
        dom.apiBaseUrlInput.value = gameState.apiBaseUrl;

        // 重新填充下拉框
        updateMyRoleOptions();
        updateApiModelOptions();

        // 恢复邪恶伪装面板及状态值
        if (gameState.myAlignment === "evil") {
            dom.evilBluffsContainer.classList.remove("hidden");
            if (gameState.evilBluffs[0]) dom.evilBluff1.value = gameState.evilBluffs[0];
            if (gameState.evilBluffs[1]) dom.evilBluff2.value = gameState.evilBluffs[1];
            if (gameState.evilBluffs[2]) dom.evilBluff3.value = gameState.evilBluffs[2];
        } else {
            dom.evilBluffsContainer.classList.add("hidden");
        }

        // 恢复输入框草稿与 AI 分析结果
        if (dom.consoleInput && data.consoleInputDraft) {
            dom.consoleInput.value = data.consoleInputDraft;
        }
        if (dom.analysisBox && data.analysisBoxHtml && data.analysisBoxHtml.trim()) {
            dom.analysisBox.innerHTML = data.analysisBoxHtml;
        } else {
            resetAnalysisBoxes();
        }
        if (dom.worldlinesBox && data.worldlinesBoxHtml && data.worldlinesBoxHtml.trim()) {
            dom.worldlinesBox.innerHTML = data.worldlinesBoxHtml;
        }
        if (dom.tipsBox && data.tipsBoxHtml && data.tipsBoxHtml.trim()) {
            dom.tipsBox.innerHTML = data.tipsBoxHtml;
        }

        // 重新渲染全部视图
        renderSeatingChart();
        renderPlayerList();
        renderTimelineLogs();

        // 自动折叠初始化面板
        const initGameDetails = document.getElementById("initGameDetails");
        if (initGameDetails) {
            initGameDetails.open = false;
        }

        // 隐藏恢复按钮，既然已经恢复
        if (dom.restoreGameBtn) {
            dom.restoreGameBtn.classList.add("hidden");
        }

        const restoreLog = gameState.lang === "en" 
            ? "Game state successfully recovered from local browser cache! Continue analysis."
            : "对局已成功从本地浏览器缓存恢复！继续推演分析吧。";
        gameState.logs.push(restoreLog);
        renderTimelineLogs();

        return true;
    } catch (e) {
        console.error("加载本地缓存对局失败:", e);
        return false;
    }
}

// --- 极简多语言切换引擎 (Client-Side Translation Engine) ---
function setLanguage(lang) {
    gameState.lang = lang;
    localStorage.setItem("botc_lang", lang);
    
    // 切换按钮指示文字 (Switch toggle text)
    if (dom.langToggleText) {
        dom.langToggleText.textContent = lang === "zh" ? "English" : "简体中文";
    }
    
    // 更新所有带有 data-i18n 的静态文本节点 (Process all elements with data-i18n)
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.textContent = TRANSLATIONS[lang][key];
        }
    });
    
    // 更新所有输入框的 placeholder (Process placeholders)
    const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
    placeholders.forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.placeholder = TRANSLATIONS[lang][key];
        }
    });
    
    // 更新所有悬浮文字提示 title (Process titles)
    const titles = document.querySelectorAll("[data-i18n-title]");
    titles.forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.title = TRANSLATIONS[lang][key];
        }
    });
    
    // 如果对局已初始化，同步更新动态生成的玩家列表与日志状态 (Sync dynamic data views)
    if (gameState.players && gameState.players.length > 0) {
        // 同步“我”的显示名字
        gameState.players.forEach(p => {
            const isMe = (p.seat === gameState.mySeat);
            if (isMe) {
                p.name = lang === "en" ? "Me" : "我";
            } else if (p.name === "我" || p.name === "Me") {
                p.name = lang === "en" ? "Me" : "我";
            } else if (p.name.startsWith("玩家") || p.name.startsWith("Player")) {
                p.name = lang === "en" ? `Player ${p.seat}` : `玩家 ${p.seat}`;
            }
        });
        
        renderPlayerList();
        renderSeatingChart();
        renderTimelineLogs();
    }
    
    // 更新剧本角色对照表的表头分类 (Update scripts preview UI headers)
    populateScriptPreview();
    
    // 更新 AI 驱动厂商对应的提示词 (Update provider option tip)
    updateApiModelOptions();
    
    // 自动刷新保存缓存
    saveToLocalStorage();
}
