/* ==========================================================================
   rules.js - 剧本与角色技能具体规则配置数据库 (Rules Domain)
   ========================================================================== */

// --- 剧本/板子数据配置 ---
export const SCRIPTS_DATA = {
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
        demon: ["方吉", "诺·达鲺", "亡骨魔", "涡流"]
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
export const CHARACTER_DETAILS = {
    wushang: {
        "贵族": "你的首个夜晚，你会得知三名玩家：其中有且只有一名玩家是邪恶的。",
        "厨师": "在你的首个夜晚，你会得知场上邻座的邪恶玩家有多少对。",
        "共情者": "每个夜晚，你会得知与你邻近的两名存活的玩家中邪恶玩家的数量。",
        "罂粟种植者": "爪牙和恶魔互相不认识。如果你死亡，当晚他们会互相认识。",
        "博学者": "每个白天，你可以私下询问说书人以得知两条信息：一个是正确的，一个是错误的。",
        "茶艺师": "如果与你邻近的两名存活的玩家是善良的，他们不会死亡。",
        "城镇公告员": "每个夜晚*，你会得知在今天白天时是否有爪牙发起过提名。",
        "舞蛇人": "每个夜晚，你要选择一名存活的玩家：如果你选中了恶魔，你和他交换角色和阵营，然后他中毒。",
        "送葬者": "每个夜晚*，你会得知今天白天死于处决的玩家的角色。",
        "熊孩子": "每个夜晚，你要选择一个镇民角色：他的能力会产生错误信息，直到下个黄昏。",
        "传教士": "每个夜晚，你要选择一名玩家：如果你选中了爪牙，他会得知被传教士选中。所有被你选中的爪牙失去能力。",
        "水手": "每个夜晚，你要选择一名存活的玩家：你或他之一会醉酒直到下个黄昏。你不会死亡。",
        "赏金猎人": "在你的首个夜晚，你会得知一名邪恶玩家。每当你得知的玩家死亡，你会在当晚得知另一名邪恶玩家。[会有一名镇民转变为邪恶阵营]",
        "炼金术士": "你拥有一个爪牙角色的能力。当你使用能力时，说书人可能会要求你更换选择。",
        "气球驾驶员": "每个夜晚，你会得知一名与之首夜夜晚得知的玩家角色类型不同的玩家，直到集满4种类型。[+0~1外来者]",
        "畸形秀演员": "如果你“疯狂”地证明自己是外来者，你可能被处决。",
        "魔像": "每局游戏你只能发起提名一次。当你发起提名时，如果被你提名的玩家不是恶魔，他死亡。",
        "政客": "如果你是对你的阵营落败负最大责任的人，你转变阵营并获胜，即使你已死亡。",
        "瘟疫医生": "当你死亡时，说书人会获得一个爪牙能力。",
        "理发师": "如果你死亡，在当晚恶魔可以选择两名玩家（不能选择其他恶魔）交换角色。",
        "精神病患者": "每个白天，在提名开始前，你可以公开选择一名玩家：他死亡。如果你被处决，提名你的玩家需要和你猜拳，只有你输了你才会死亡。",
        "皮克希": "每局游戏限一次，在夜晚时*，你可以选择一个非恶魔角色：如果该角色不在场，你要再选择一名玩家：他变成该角色。",
        "洗脑师": "每夜，你要选择一名玩家和一个善良角色。他明天白天 and 夜晚需要“疯狂”地证明自己是这个角色，不然他可能被处决。",
        "召唤师": "在首个夜晚，你会得知三个伪装。在第三个夜晚，你要选择一名玩家：他变成你选择的邪恶恶魔。",
        "教父": "在首夜，你会得知有哪些外来者角色在场。如果有外来者在白天死亡，你可在当晚杀死一名玩家。[-1 或 +1 外来者]",
        "涡流": "每个夜晚*，你要选择一名玩家：他死亡。镇民玩家的能力都会产生错误信息。如果白天没人被处决，邪恶阵营获胜。",
        "卡扎力": "每个夜晚*，你要选择一名玩家：他死亡。[由你决定是什么爪牙，-或+任意数量外来者]",
        "诺达鲺": "每个夜晚*，你要选择一名玩家：他死亡。与你邻近的两名镇民中毒。",
        "哈迪寂亚": "每个夜晚*，你可以选择三名玩家（所有玩家都会得知你选了谁）：他们分别秘密决定自己的生死，然后如果他们都存活则都死亡。"
    },
    anliu: {
        "洗衣妇": "在你的首个夜晚，你会得知两名玩家和一个镇民角色：这两名玩家之一是该角色。",
        "图书管理员": "在你的首个夜晚，你会得知两名玩家和一个外来者角色：这两名玩家之一是该角色（或者你会得知没有外来者在场）。",
        "调查员": "在你的首个夜晚，你会得知两名玩家和一个爪牙角色：这两名玩家之一是该角色（或者你会得知没有爪牙在场）。",
        "厨师": "在你的首个夜晚，你会得知场上邻座的邪恶玩家有多少对。",
        "共情者": "每个夜晚，你会得知与你邻近的两名存活的玩家中邪恶玩家的数量。",
        "占卜师": "每个夜晚，你要选择两名玩家：你会得知他们之中是否有恶魔。会有一名善良玩家始终被你的能力当作恶魔。",
        "送葬者": "每个夜晚*，你会得知今天白天死于处决的玩家的角色。",
        "僧侣": "每个夜晚*，你要选择除你以外的一名玩家：当晚恶魔的负面能力对他无效。",
        "守鸦人": "如果你在夜晚死亡，你会被唤醒，然后你要选择一名玩家：你会得知他的角色。",
        "贞洁者": "当你首次被提名时，如果提名你的玩家是镇民，他立刻被处决。",
        "猎手": "每局游戏限一次，你可以在白天时公开选择一名玩家：如果他是恶魔，他死亡。",
        "士兵": "恶魔的负面能力对你无效。",
        "镇长": "如果只有三名玩家存活且白天没有人被处决，你的阵营获胜。如果你在夜晚即将死亡，可能会有一名其他玩家代替你死亡。",
        "管家": "每个夜晚，你要选择除你以外的一名玩家：明天白天，只有他投票时你才能投票。",
        "酒鬼": "你不知道你是酒鬼。你以为你是一个镇民角色，但其实你不是。",
        "陌客": "你可能会被当作邪恶阵营、爪牙角色或恶魔角色，即使你已死亡。",
        "圣徒": "如果你死于处决，你的阵营落败。",
        "投毒者": "每个夜晚，你要选择一名玩家：他在当晚和明天白天中毒。",
        "间谍": "每个夜晚，你能查看魔典。你可能会被当作善良阵营、镇民角色或外来者角色，即使你已死亡。",
        "男爵": "会有额外的外来者在场。[+2外来者]",
        "红唇女郎": "如果大于等于五名玩家存活时（旅行者不计算在内）恶魔死亡，你变成那个恶魔。",
        "小恶魔": "每个夜晚*，你要选择一名玩家：他死亡。如果你以这种方式自杀，一名爪牙会变成小恶魔。"
    },
    mengyun: {
        "钟表匠": "在你的首个夜晚，你会得知恶魔与爪牙之间最近的距离。（邻座的玩家距离为1）",
        "筑梦师": "每个夜晚，你要选择（除你及旅行者以外的）一名玩家：你会得知一个善良角色和一个邪恶角色，该玩家是其中一个角色。",
        "舞蛇人": "每个夜晚，你要选择一名存活的玩家：如果你选中了恶魔，你和他交换角色和阵营，然后他中毒。",
        "数学家": "每个夜晚，你会得知有多少名玩家能力因为其他角色的能力而未正常生效（从上个黎明到你被唤醒时）。",
        "卖花女孩": "每个夜晚*，你会得知在今天白天时是否有恶魔投过票。",
        "城镇公告员": "每个夜晚*，你会得知在今天白天时是否有爪牙发起过提名。",
        "神谕者": "每个夜晚*，你会得知有多少名死亡的玩家是邪恶的。",
        "杂耍艺人": "在你的首个白天，你可以公开猜测任意玩家的角色最多五次。在当晚，你会得知猜测正确的角色数量。",
        "博学者": "每个白天，你可以私下拜访说书人获得两条信息：一个是正确的，一个是错误的。",
        "女裁缝": "每局游戏限一次，在夜晚时，你可以选择（除你以外）的两名玩家：你会得知他们是否为同一阵营。",
        "哲学家": "每局游戏限一次，在夜晚时，你可以选择一个善良角色：你获得该角色的能力。如果这个角色在场，他醉酒。",
        "艺术家": "每局游戏限一次，在白天时，你可以私下拜访说书人提问一个是非题，你会得知该问题的答案（是 / 不是 / 我不知道）。",
        "贤者": "如果恶魔杀死了你，在当晚你会被唤醒并得知两名玩家，其中一名是杀死你的那个恶魔。",
        "畸形秀演员": "如果你“疯狂”地证明自己是外来者，你可能被处决。",
        "理发师": "如果你死亡，在当晚恶魔可以选择两名玩家（不能选择其他恶魔）交换角色（今晚理发）。",
        "心上人": "当你死亡时，会有一名玩家开始醉酒。",
        "呆瓜": "当你得知你死亡时，你要公开选择一名存活的玩家：如果他是邪恶的，你的阵营落败。",
        "女巫": "每个夜晚，你要选择一名玩家：如果他明天白天发起提名，他死亡。如果只有三名存存活的玩家，你失去此能力。",
        "洗脑师": "每个夜晚，你要选择一名玩家和一个善良角色。他明天白天和夜晚需要“疯狂”地证明自己是这个角色，不然他可能被处决。",
        "麻脸巫婆": "每个夜晚*，你要选择一名玩家和一个角色，如果该角色不在场，他变成该角色。如果因此创造了一个恶魔，当晚的死亡由说书人决定（生死无常夜）。",
        "镜像双子": "你与一名对立阵营的玩家互相知道对方是什么角色。如果其中善良玩家被处决，邪恶阵营获胜。如果你们都存活，善良阵营无法获胜。",
        "方吉": "每个夜晚*，你要选择一名玩家：他死亡。被该能力杀死的外来者改为变成邪恶的方吉且代替他死亡，但每局游戏仅能成功转化一次。[+1外来者]",
        "诺·达鲺": "每个夜晚*，你要选择一名玩家：他死亡。与你邻近的两名镇民中毒。",
        "亡骨魔": "每个夜晚*，你要选择一名玩家：他死亡。被你杀死的爪牙保留他的能力，且与他邻近的两名镇民之一中毒。[-1外来者]",
        "涡流": "每个夜晚*，你要选择一名玩家：他死亡。镇民玩家的能力都会产生错误信息。如果白天没人被处决，邪恶阵营获胜。"
    },
    wafuleiming: {
        "调查员": "在你的首个夜晚，你会得知两名玩家和一个爪牙角色：这两名玩家之一是该角色（或者你会得知没有爪牙在场）。",
        "厨师": "在你的首个夜晚，你会得知场上邻座的邪恶玩家有多少对。",
        "祖母": "在你的首个夜晚，你会得知一名善良玩家和他的角色。如果恶魔杀死了他，你也会死亡。",
        "占卜师": "每个夜晚，你要选择两名玩家：你会得知他们之中是否有恶魔。会有一名善良玩家始终被你的能力当作恶魔（干扰项）。",
        "气球驾驶员": "每个夜晚，你会得知一名不同角色类型的玩家，直到场上所有的角色类型你都得知过一次。[+1 外来者]",
        "筑梦师": "每个夜晚，你要选择除你及旅行者以外的一名玩家：你会得知一个善良角色和一个邪恶角色，该玩家是其中一个角色。",
        "舞蛇人": "每个夜晚，你要选择一名存活的玩家：如果你选中了恶魔，你和他交换角色 and 阵营，然后他中毒。",
        "赌徒": "每个夜晚*，你要选择一名玩家并猜测他的角色：如果你猜错了，你会死亡。",
        "博学者": "每个白天，你可以私下询问说书人以得知两条信息：一个是正确的，一个是错误的。",
        "哲学家": "每局游戏限一次，在夜晚时，你可以选择一个善良角色：你获得该角色的能力。如果这个角色在场，他醉酒。",
        "守鸦人": "如果你在夜晚死亡，你会被唤醒，然后你要选择一名玩家：你会得知他的角色。",
        "失忆者": "你不知道你的能力是什么。每个白天你可以找说书人猜测一次，你会得知你的猜测有多准确。",
        "食人族": "你拥有上个死于处决的玩家的能力。如果该玩家属于邪恶阵营，你中毒直到下个善良玩家死于处决。",
        "酒鬼": "你不知道你是酒鬼。你以为你是一个镇民角色，但其实你不是。",
        "畸形秀演员": "如果你“疯狂”地证明自己是外来者，你可能被处决。",
        "疯子": "你以为你是一个恶魔，但其实你不是。恶魔知道你是疯子以及你在每个夜晚选择了哪些玩家。",
        "陌客": "你可能会被当作邪恶阵营、爪牙角色或恶魔角色，即使你已死亡。",
        "心上人": "当你死亡时，会有一名玩家开始醉酒。",
        "教父": "在你的首个夜晚，你会得知有哪些外来者角色在场。如果有外来者在白天死亡，你会在当晚被唤醒并且你要选择一名玩家：他死亡。[-1 或 +1 外来者]",
        "洗脑师": "每个夜晚，你要选择一名玩家和一个善良角色。他明天白天和夜晚需要“疯狂”地证明自己是这个角色，不然他可能被处决。",
        "麻脸巫婆": "每个夜晚*，你要选择一名玩家和一个角色，如果该角色不在场，他变成该角色。",
        "寡妇": "在你的首个夜晚，你能查看魔典并选择一名玩家：他中毒。随后，始终会有一名善良玩家知道寡妇在场。",
        "小恶魔": "每个夜晚*，你要选择一名玩家：他死亡. 如果你以这种方式自杀，一名爪牙会变成小恶魔。",
        "方吉": "每个夜晚*，你要选择一名玩家：他死亡。被该能力杀死的外来者改为变成邪恶的方吉且代替他死亡，但每局游戏仅能成功转化一次。[+1 外来者]",
        "亡骨魔": "每个夜晚*，你要选择一名玩家：他死亡。被你杀死的爪牙保留他的能力，且与他邻近的两名镇民之一中毒。[-1 外来者]"
    }
};

// --- English Scripts and Character Details Data ---
export const SCRIPTS_DATA_EN = {
    wushang: {
        name: "Supreme Slaughter",
        townsfolk: ["Noble", "Chef", "Empath", "Poppy Grower", "Savant", "Tea Lady", "Town Crier", "Snake Charmer", "Undertaker", "Rascal", "Preacher", "Sailor", "Bounty Hunter", "Alchemist", "Balloonist"],
        outsider: ["Mutant", "Golem", "Politician", "Plague Doctor", "Barber"],
        minion: ["Psychopath", "Pixie", "Cerenovus", "Summoner", "Godfather"],
        demon: ["Vortox", "Kazali", "No-Dashi", "Al-Hadikhia"]
    },
    anliu: {
        name: "Trouble Brewing",
        townsfolk: ["Washerwoman", "Librarian", "Investigator", "Chef", "Empath", "Fortune Teller", "Undertaker", "Monk", "Ravenkeeper", "Virgin", "Slayer", "Soldier", "Mayor"],
        outsider: ["Butler", "Drunk", "Recluse", "Saint"],
        minion: ["Poisoner", "Spy", "Baron", "Scarlet Woman"],
        demon: ["Imp"]
    },
    mengyun: {
        name: "Sects & Violets",
        townsfolk: ["Clockmaker", "Dreamer", "Snake Charmer", "Mathematician", "Flowergirl", "Town Crier", "Oracle", "Juggler", "Savant", "Seamstress", "Philosopher", "Artist", "Sage"],
        outsider: ["Mutant", "Barber", "Sweetheart", "Klutz"],
        minion: ["Witch", "Cerenovus", "Pit-Hag", "Evil Twin"],
        demon: ["Fang Gu", "No-Dashi", "Vigormortis", "Vortox"]
    },
    wafuleiming: {
        name: "Laissez un Faire",
        townsfolk: ["Investigator", "Chef", "Grandma", "Fortune Teller", "Balloonist", "Dreamer", "Snake Charmer", "Gambler", "Savant", "Philosopher", "Ravenkeeper", "Amnesiac", "Cannibal"],
        outsider: ["Drunk", "Recluse", "Mutant", "Sweetheart", "Lunatic"],
        minion: ["Godfather", "Pit-Hag", "Cerenovus", "Widow"],
        demon: ["Imp", "Vigormortis", "Fang Gu"]
    }
};

export const CHARACTER_DETAILS_EN = {
    wushang: {
        "Noble": "On your first night, you learn 3 players: exactly one is evil.",
        "Chef": "On your first night, you learn the number of pairs of adjacent evil players.",
        "Empath": "Each night, you learn the number of evil players among your 2 alive neighbors.",
        "Poppy Grower": "Minions & Demons do not know each other. If you die, they learn each other that night.",
        "Savant": "Each day, you may visit the Storyteller privately to learn 2 statements: 1 is correct & 1 is incorrect.",
        "Tea Lady": "If your 2 alive neighbors are good, they cannot die.",
        "Town Crier": "Each night*, you learn if a Minion nominated today.",
        "Snake Charmer": "Each night, choose an alive player: if you choose the Demon, you swap characters and alignments, then they become poisoned.",
        "Undertaker": "Each night*, you learn the character of the player executed today.",
        "Rascal": "Each night, choose a Townsfolk character: their ability yields incorrect information until next dusk.",
        "Preacher": "Each night, choose a player: if they are a Minion, they learn they were chosen by the Preacher. All Minions chosen by you lose their abilities.",
        "Sailor": "Each night, choose an alive player: either you or they are drunk until next dusk. You cannot die.",
        "Bounty Hunter": "On your first night, you learn an evil player. Each time your learned player dies, you learn another evil player tonight. [1 Townsfolk is evil]",
        "Alchemist": "You have a Minion ability. When you use it, the Storyteller may prompt you to make a different choice.",
        "Balloonist": "Each night, you learn an alive player of a different character type than those you've learned on previous nights, until you have learned all 4 types. [+0 to +1 Outsider]",
        "Mutant": "If you are 'mad' about being an Outsider, you might be executed.",
        "Golem": "You may only nominate once per game. When you nominate, if the nominee is not the Demon, they die.",
        "Politician": "If you are the player most responsible for your team losing, you change alignment and win, even if dead.",
        "Plague Doctor": "When you die, the Storyteller gains a Minion ability.",
        "Barber": "If you die, the Demon may swap the characters of 2 players tonight (cannot choose other Demons).",
        "Psychopath": "Each day, before nominations start, you may publicly choose a player: they die. If executed, your nominator plays Rock-Paper-Scissors with you; you only die if you lose.",
        "Pixie": "Once per game, at night*, choose a non-Demon character: if they are not in play, choose a player: they become that character.",
        "Cerenovus": "Each night, choose a player and a good character: they must be mad about being that character tomorrow, or they might be executed.",
        "Summoner": "On your first night, you learn 3 bluffs. On the third night, choose a player: they become your chosen evil Demon.",
        "Godfather": "On your first night, you learn which Outsiders are in play. If an Outsider dies during the day, you may kill a player tonight. [-1 or +1 Outsider]",
        "Vortox": "Each night*, choose a player: they die. Townsfolk abilities yield incorrect information. If no one is executed by day, Evil wins.",
        "Kazali": "Each night*, choose a player: they die. [You choose the Minions in play, - or + any number of Outsiders]",
        "No-Dashi": "Each night*, choose a player: they die. Your 2 alive Townsfolk neighbors are poisoned.",
        "Al-Hadikhia": "Each night*, choose 3 players (all learn who): they secretly decide whether to live or die. If all choose to live, they all die."
    },
    anliu: {
        "Washerwoman": "On your first night, you learn 2 players and 1 Townsfolk character: 1 of those players is that character.",
        "Librarian": "On your first night, you learn 2 players and 1 Outsider character: 1 of those players is that character (or that there are no Outsiders).",
        "Investigator": "On your first night, you learn 2 players and 1 Minion character: 1 of those players is that character (or that there are no Minions).",
        "Chef": "On your first night, you learn the number of pairs of adjacent evil players.",
        "Empath": "Each night, you learn how many of your 2 alive neighbors are evil.",
        "Fortune Teller": "Each night, choose 2 players: you learn if at least 1 is a Demon. 1 good player is registered as a Demon to you.",
        "Undertaker": "Each night*, you learn the character of the player executed today.",
        "Monk": "Each night*, choose a player other than yourself: the Demon's negative ability has no effect on them tonight.",
        "Ravenkeeper": "If you die at night, you are woken to choose a player: you learn their character.",
        "Virgin": "The first time you are nominated, if the nominator is a Townsfolk, they are executed immediately.",
        "Slayer": "Once per game, during the day, choose a player: if they are the Demon, they die.",
        "Soldier": "The Demon's negative ability has no effect on you.",
        "Mayor": "If only 3 players are alive & no execution occurs, your team wins. If you die at night, another player might die instead.",
        "Butler": "Each night, choose a player other than yourself: tomorrow, you can only vote if they vote.",
        "Drunk": "You do not know you are the Drunk. You think you are a Townsfolk, but you are not.",
        "Recluse": "You might register as evil, a Minion, or a Demon, even if dead.",
        "Saint": "If you die by execution, your team loses.",
        "Poisoner": "Each night, choose a player: they are poisoned tonight and tomorrow.",
        "Spy": "Each night, you may look at the Grimoire. You might register as good, a Townsfolk, or an Outsider, even if dead.",
        "Baron": "There are extra Outsiders in play. [+2 Outsiders]",
        "Scarlet Woman": "If 5 or more players are alive (excluding Travelers) and the Demon dies, you become the Demon.",
        "Imp": "Each night*, choose a player: they die. If you kill yourself, a Minion becomes the Imp."
    },
    mengyun: {
        "Clockmaker": "On your first night, you learn the distance from the Demon to the nearest Minion.",
        "Dreamer": "Each night, choose a player other than yourself or Travelers: you learn 1 good & 1 evil character, and 1 is their real character.",
        "Snake Charmer": "Each night, choose an alive player: if they are the Demon, you swap characters and alignments, then they become poisoned.",
        "Mathematician": "Each night, you learn how many players' abilities did not work correctly due to other abilities since dawn.",
        "Flowergirl": "Each night*, you learn if the Demon voted today.",
        "Town Crier": "Each night*, you learn if a Minion nominated today.",
        "Oracle": "Each night*, you learn how many dead players are evil.",
        "Juggler": "On your first day, you may publicly guess up to 5 players' characters. Tonight, you learn how many guesses were correct.",
        "Savant": "Each day, you may visit the Storyteller privately to learn 2 statements: 1 is correct & 1 is incorrect.",
        "Seamstress": "Once per game, at night, choose 2 players other than yourself: you learn if they are of the same alignment.",
        "Philosopher": "Once per game, at night, choose a good character: you gain their ability. If that character is in play, they are drunk.",
        "Artist": "Once per game, during the day, you may privately ask the Storyteller any yes/no question.",
        "Sage": "If the Demon kills you, you wake tonight and learn 2 players: 1 is the Demon.",
        "Mutant": "If you are 'mad' about being an Outsider, you might be executed.",
        "Barber": "If you die, the Demon may swap the characters of 2 players tonight (cannot choose other Demons).",
        "Sweetheart": "When you die, one player becomes drunk permanently.",
        "Klutz": "When you learn you died, publicly choose an alive player: if they are evil, your team loses.",
        "Witch": "Each night, choose a player: they are poisoned tonight and tomorrow. If only 3 players are alive, you lose this ability.",
        "Cerenovus": "Each night, choose a player and a good character: they must be mad about being that character tomorrow, or they might be executed.",
        "Pit-Hag": "Each night*, choose a player and a character: if that character is not in play, they become that character. If a Demon is created, night deaths are decided by the Storyteller.",
        "Evil Twin": "You and an opposing alignment player know each other's characters. If the good twin is executed, Evil wins. While both live, Good cannot win.",
        "Fang Gu": "Each night*, choose a player: they die. The first Outsider killed becomes the evil Fang Gu instead, and you die. [+1 Outsider]",
        "No-Dashi": "Each night*, choose a player: they die. Your 2 alive Townsfolk neighbors are poisoned.",
        "Vigormortis": "Each night*, choose a player: they die. Minions killed by you retain their ability, and 1 of their Townsfolk neighbors is poisoned. [-1 Outsider]",
        "Vortox": "Each night*, choose a player: they die. Townsfolk abilities yield incorrect information. If no one is executed by day, Evil wins."
    },
    wafuleiming: {
        "Investigator": "On your first night, you learn 2 players and 1 Minion character: 1 of those players is that character (or that there are no Minions).",
        "Chef": "On your first night, you learn the number of pairs of adjacent evil players.",
        "Grandma": "On your first night, you learn 1 good player and their character. If the Demon kills them, you die too.",
        "Fortune Teller": "Each night, choose 2 players: you learn if at least 1 is a Demon. 1 good player is registered as a Demon to you.",
        "Balloonist": "Each night, you learn a player of a different character type, until you have learned all character types. [+1 Outsider]",
        "Dreamer": "Each night, choose a player other than yourself or Travelers: you learn 1 good & 1 evil character, and 1 is their real character.",
        "Snake Charmer": "Each night, choose an alive player: if they are the Demon, you swap characters and alignments, then they become poisoned.",
        "Gambler": "Each night*, choose a player and guess their character: if you guess wrong, you die tonight.",
        "Savant": "Each day, you may visit the Storyteller to learn 2 statements: 1 is true & 1 is false.",
        "Philosopher": "Once per game, at night, choose a good character: you gain their ability. If that character is in play, they are drunk.",
        "Ravenkeeper": "If you die at night, you are woken to choose a player: you learn their character.",
        "Amnesiac": "You do not know what your ability is. Each day, you may guess your ability to the Storyteller: they tell you how accurate you are.",
        "Cannibal": "You have the ability of the last player executed. If they were evil, you are poisoned until next execution.",
        "Drunk": "You do not know you are the Drunk. You think you are a Townsfolk, but you are not.",
        "Recluse": "You might register as evil, a Minion, or a Demon, even if dead.",
        "Mutant": "If you are 'mad' about being an Outsider, you might be executed.",
        "Sweetheart": "When you die, one player becomes drunk permanently.",
        "Lunatic": "You think you are the Demon, but you are not. You act as the Demon, but the real Demon knows who you are and what you chose.",
        "Godfather": "On your first night, you learn which Outsiders are in play. If an Outsider dies during the day, you are woken tonight to choose a player: they die. [-1 or +1 Outsider]",
        "Pit-Hag": "Each night*, choose a player and a character: if that character is not in play, they become that character.",
        "Cerenovus": "Each night, choose a player and a good character: they must be mad about being that character tomorrow, or they might be executed.",
        "Widow": "On your first night, you look at the Grimoire and choose a player to poison. One good player learns that a Widow is in play.",
        "Imp": "Each night*, choose a player: they die. If you kill yourself, a Minion becomes the Imp.",
        "Vigormortis": "Each night*, choose a player: they die. Minions killed by you retain their ability, and 1 of their Townsfolk neighbors is poisoned. [-1 Outsider]",
        "Fang Gu": "Each night*, choose a player: they die. The first Outsider killed becomes the evil Fang Gu instead, and you die. [+1 Outsider]"
    }
};

export const CORE_LOGIC_RULES = `
=== 血染钟楼核心推理钢性法则 (必须严格作为逻辑推导约束) ===
1. 说书人好人伪装 (Demon Bluffs) 不在场定理：
   说书人在首夜分配给恶魔的 3 个伪装身份（Bluffs）在魔典中绝对不存在。如果场上有玩家起跳这 3 个角色，则该玩家必然是在说谎（大几率是邪恶伪装，或受洗脑师疯狂、畸形秀演员自保、酒鬼等干扰）。
2. 邪恶阵营首夜互认规则：
   邪恶阵营玩家（爪牙与恶魔）在首夜默认互认彼此。如果开局你是恶魔或爪牙但说书人没有让你确认队友，则场上必然存在【罂粟种植者】。在它死前，绝对不能暴露狼队友。
3. 邻座死亡收缩与共情者锁定：
   当夹在中间的玩家死亡时，邻座关系会自动向外收缩，锁定新的存活玩家（如共情者、茶艺师、诺达鲺邻座）。共情者的信息变动结合邻座收缩，可以直接进行逻辑差值求解，锁定已死玩家和新邻座玩家的阵营。
4. 涡流 (Vortox) 的“必须错误”绝对约束：
   如果恶魔是【涡流】，所有镇民（Townsfolk）的技能得到的信息必须是错误的。任何镇民玩家得到真实信息，即违背规则。如果确认是涡流局，可以通过将所有镇民信息做 100% 反向理解来还原真实魔典。
5. 唯一角色冲突推论：
   每个善良角色在开局魔典中是唯一的。如果场上同时有两个人起跳同一个非外来者角色，且排除洗脑师、酒鬼或角色转化干扰，则两人中必有一人是邪恶的。
6. 疯狂违背与白天雷击处决：
   白天如果突然发生非提名导致的莫名其妙雷击处决，极大可能是【洗脑师】或【畸形秀演员】因为违背疯狂行为受到的惩罚，可以直接定位洗脑源或外来者座位。
`;

export const CORE_LOGIC_RULES_EN = `
=== BOTC CORE DEDUCTION LAWS (MUST BE STRICTLY ENFORCED) ===
1. Demon Bluffs (Skins) Inexistence Theorem:
   The 3 Townsfolk/Outsider bluffs given by the Storyteller to the Demon on Night 1 are DEFINITELY not in play. If any player claims one of these bluffs, they are 100% lying (either Evil bluffing, Cerenovus mad, Mutant self-protecting, Drunk, or Lunatic).
2. Evil Mutual Recognition on Night 1:
   Evil players (Demon and Minions) recognize each other on Night 1 by default. If you are Evil and the Storyteller did not show you your teammates, a [Poppy Grower] is DEFINITELY in play. Do not expose teammates until they die.
3. Seating Contraction & Empath Math:
   When an in-between player dies, living neighbors contract immediately (for Empath, Tea Lady, No-Dashi, etc.). Empath values combined with neighbor contraction can mathematically solve and lock down exact alignments.
4. Vortox "Must Be False" Absolute Constraint:
   If the Demon is a [Vortox], ALL Townsfolk information MUST be false. No exceptions. If Vortox is confirmed, good team can reconstruct the Grimoire by 100% inverting all Townsfolk claims. (Outsiders are not subject to this rule).
5. Character Uniqueness Contradiction:
   Every good character is unique. If two players claim the same Townsfolk role (excluding Pit-Hag transformation, Cerenovus madness, or Drunk interference), at least one is definitely Evil.
6. Madness Violations & Sudden Execution:
   Sudden daytime executions without nominations are almost always Cerenovus or Mutant madness violations, allowing you to instantly identify the Cerenovus target or Mutant seat.
`;

