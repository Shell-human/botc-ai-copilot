/* ==========================================================================
   rules.js - 剧本与角色技能具体规则配置数据库 (Rules Domain)
   ========================================================================== */

// --- 游戏人数角色分布配置 ---
export const GAME_DISTRIBUTIONS = {
    5: { townsfolk: 3, outsider: 0, minion: 1, demon: 1 },
    6: { townsfolk: 3, outsider: 1, minion: 1, demon: 1 },
    7: { townsfolk: 5, outsider: 0, minion: 1, demon: 1 },
    8: { townsfolk: 5, outsider: 1, minion: 1, demon: 1 },
    9: { townsfolk: 5, outsider: 2, minion: 1, demon: 1 },
    10: { townsfolk: 7, outsider: 0, minion: 2, demon: 1 },
    11: { townsfolk: 7, outsider: 1, minion: 2, demon: 1 },
    12: { townsfolk: 7, outsider: 2, minion: 2, demon: 1 },
    13: { townsfolk: 9, outsider: 0, minion: 3, demon: 1 },
    14: { townsfolk: 9, outsider: 1, minion: 3, demon: 1 },
    15: { townsfolk: 9, outsider: 2, minion: 3, demon: 1 },
};

// --- 剧本/板子数据配置 ---
export const SCRIPTS_DATA = {
    wushang: {
        name: "无上杀戮",
        townsfolk: ["贵族", "厨师", "共情者", "罂粟种植者", "博学者", "茶艺师", "城镇公告员", "舞蛇人", "送葬者", "熊孩子", "传教士", "水手", "赏金猎人", "炼金术士", "气球驾驶员"],
        outsider: ["畸形秀演员", "魔像", "政客", "瘟疫医生", "理发师"],
        minion: ["精神病患者", "皮克希", "洗脑师", "召唤师", "教父"],
        demon: ["涡流", "卡扎力", "诺·达鲺", "哈迪寂亚"]
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
        "贵族": "首夜知3人中恰1邪恶。",
        "厨师": "首夜知邻座邪恶对数。",
        "共情者": "每夜知两存活邻座中邪恶数。",
        "罂粟种植者": "爪牙恶魔互不知。你死当夜他们互知。",
        "博学者": "每日私询说书人获2信息：1真1假。",
        "茶艺师": "两存活善良邻座不死。",
        "城镇公告员": "每夜*知白天爪牙是否提名。",
        "舞蛇人": "每夜选1存活玩家：若中恶魔，互换角色阵营，他中毒。",
        "送葬者": "每夜*知白天被处决者角色。",
        "熊孩子": "每夜选1镇民角色：其能力产生错误信息至下个黄昏。",
        "传教士": "每夜选1玩家：若为爪牙，得知被选且失去能力。",
        "水手": "每夜选1存活玩家：你或他之一醉酒至下黄昏。你不会死。",
        "赏金猎人": "首夜知1邪恶玩家。他死当夜知另一邪恶。[1镇民变邪恶]",
        "炼金术士": "拥有1爪牙能力。使用时说书人可要求换选。",
        "气球驾驶员": "每夜知1不同角色类型玩家，集满4种。[+0~1外来者]",
        "畸形秀演员": "若疯狂证明是外来者，可能被处决。",
        "魔像": "每局提名1次。提名时若非恶魔，他死。",
        "政客": "若对阵营落败负最大责，变阵营获胜，即使已死。",
        "瘟疫医生": "死时说书人获1爪牙能力。",
        "理发师": "若死，恶魔当夜可选2玩家(非恶魔)互换角色。",
        "精神病患者": "每日提名前公开选1玩家：他死。被处决时提名者需猜拳赢你。",
        "皮克希": "每局1次，夜*选非恶魔角色：若不在场，选1人变该角。",
        "洗脑师": "每夜选1玩家及1善良角：他明天须疯狂证明该角，否则可能被处决。",
        "召唤师": "首夜知3伪装。第三夜选1玩家变你选的邪恶恶魔。",
        "教父": "首夜知在场外来者。白天有外来者死，当夜可杀1人。[±1外来者]",
        "涡流": "每夜*杀1人。所有镇民信息必假。白天无处决→邪恶胜。",
        "卡扎力": "每夜*杀1人。[你定爪牙，±任意外来者]",
        "诺·达鲺": "每夜*杀1人。两存活邻座镇民中毒。",
        "哈迪寂亚": "每夜*可选3人(全知)：各自秘密定生死，全选活则全死。"
    },
    anliu: {
        "洗衣妇": "首夜知2玩家及1镇民角，其中1人是该角。",
        "图书管理员": "首夜知2玩家及1外来者角，其中1人是该角(或知无外来者)。",
        "调查员": "首夜知2玩家及1爪牙角，其中1人是该角(或知无爪牙)。",
        "厨师": "首夜知邻座邪恶对数。",
        "共情者": "每夜知两存活邻座中邪恶数。",
        "占卜师": "每夜选2玩家：知是否有恶魔。始终有1善良玩家被当恶魔。",
        "送葬者": "每夜*知白天被处决者角色。",
        "僧侣": "每夜*选除你外1玩家：当夜恶魔负面能力对他无效。",
        "守鸦人": "若死于夜晚，醒后选1玩家知角色。",
        "贞洁者": "首次被提名时，若提名者为镇民，他立刻被处决。",
        "猎手": "每局1次，白天公开选1玩家：若为恶魔，他死。",
        "士兵": "恶魔负面能力对你无效。",
        "镇长": "若仅3人存活且白天无处决，阵营获胜。若夜晚将死，可能他人代死。",
        "管家": "每夜选除你外1玩家：明天仅他投票时你才能投。",
        "酒鬼": "不知是酒鬼。以为是某镇民，实则不是。",
        "陌客": "可能被当作邪恶/爪牙/恶魔，即使已死。",
        "圣徒": "若死于处决，阵营落败。",
        "投毒者": "每夜选1玩家：他当夜及明天白天中毒。",
        "间谍": "每夜可看魔典。可能被当作善良/镇民/外来者，即使已死。",
        "男爵": "额外外来者在场。[+2外来者]",
        "红唇女郎": "若≥5人存活时恶魔死，你变恶魔。",
        "小恶魔": "每夜*杀1人。若自杀，1爪牙变小恶魔。"
    },
    mengyun: {
        "钟表匠": "首夜知恶魔到最近爪牙距离。",
        "筑梦师": "每夜选1玩家(非你及旅行者)：知1善1恶角，他是其一。",
        "舞蛇人": "每夜选1存活玩家：若中恶魔，互换角色阵营，他中毒。",
        "数学家": "每夜知能力异常生效的玩家数(黎明至唤醒间)。",
        "卖花女孩": "每夜*知白天恶魔是否投票。",
        "城镇公告员": "每夜*知白天爪牙是否提名。",
        "神谕者": "每夜*知死亡邪恶玩家数。",
        "杂耍艺人": "首日可公开猜至多5玩家角色。当夜知猜对数。",
        "博学者": "每日私询说书人获2信息：1真1假。",
        "女裁缝": "每局1次，夜选2玩家(非你)：知是否同阵营。",
        "哲学家": "每局1次，夜选1善良角：获其能力。若在场，他醉酒。",
        "艺术家": "每局1次，白天私询说书人1个是非题。",
        "贤者": "若恶魔杀你，当夜醒知2玩家，其1是恶魔。",
        "畸形秀演员": "若疯狂证明是外来者，可能被处决。",
        "理发师": "若死，恶魔当夜可选2玩家(非恶魔)互换角色。",
        "心上人": "你死时有1玩家永久醉酒。",
        "呆瓜": "知死时公开选1存活玩家：若邪恶，阵营落败。",
        "女巫": "每夜选1玩家：若他明天提名，他死。仅3存活时失此能力。",
        "洗脑师": "每夜选1玩家及1善良角：他明天须疯狂证明该角，否则可能被处决。",
        "麻脸巫婆": "每夜*选1玩家及1角：若不在场，他变该角。若创恶魔，死由说书人定。",
        "镜像双子": "与对立阵营1玩家互知角色。善良双被处决→邪恶胜。二人皆活时善良无法获胜。",
        "方吉": "每夜*杀1人。首外来者被杀变邪恶方吉代死。[+1外来者]",
        "诺·达鲺": "每夜*杀1人。两存活邻座镇民中毒。",
        "亡骨魔": "每夜*杀1人。被杀爪牙保留能力，其1邻座镇民中毒。[-1外来者]",
        "涡流": "每夜*杀1人。所有镇民信息必假。白天无处决→邪恶胜。"
    },
    wafuleiming: {
        "调查员": "首夜知2玩家及1爪牙角，其中1人是该角(或知无爪牙)。",
        "厨师": "首夜知邻座邪恶对数。",
        "祖母": "首夜知1善良玩家及角色。若恶魔杀他，你同死。",
        "占卜师": "每夜选2玩家：知是否有恶魔。始终有1善良玩家被当恶魔。",
        "气球驾驶员": "每夜知1不同角色类型玩家，集满所有类型。[+1外来者]",
        "筑梦师": "每夜选1玩家(非你及旅行者)：知1善1恶角，他是其一。",
        "舞蛇人": "每夜选1存活玩家：若中恶魔，互换角色阵营，他中毒。",
        "赌徒": "每夜*选1玩家猜角色：猜错则你死。",
        "博学者": "每日私询说书人获2信息：1真1假。",
        "哲学家": "每局1次，夜选1善良角：获其能力。若在场，他醉酒。",
        "守鸦人": "若死于夜晚，醒后选1玩家知角色。",
        "失忆者": "不知自己能力。每日可猜1次，说书人告知准确度。",
        "食人族": "拥有上个被处决者能力。若他邪恶，你中毒至下次善良处决。",
        "酒鬼": "不知是酒鬼。以为是某镇民，实则不是。",
        "陌客": "可能被当作邪恶/爪牙/恶魔，即使已死。",
        "畸形秀演员": "若疯狂证明是外来者，可能被处决。",
        "疯子": "以为自己是恶魔，实则不是。恶魔知你是疯子及你每夜选谁。",
        "心上人": "你死时有1玩家永久醉酒。",
        "教父": "首夜知在场外来者。白天外来者死，当夜醒可选1玩家杀。[±1外来者]",
        "洗脑师": "每夜选1玩家及1善良角：他明天须疯狂证明该角，否则可能被处决。",
        "麻脸巫婆": "每夜*选1玩家及1角：若不在场，他变该角。",
        "寡妇": "首夜看魔典并选1玩家中毒。始终有1善良玩家知寡妇在场。",
        "小恶魔": "每夜*杀1人。若自杀，1爪牙变小恶魔。",
        "方吉": "每夜*杀1人。首外来者被杀变邪恶方吉代死。[+1外来者]",
        "亡骨魔": "每夜*杀1人。被杀爪牙保留能力，其1邻座镇民中毒。[-1外来者]"
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
        "Noble": "1st night: learn 3 players, exactly 1 evil.",
        "Chef": "1st night: learn # of adjacent evil pairs.",
        "Empath": "Each night: learn evil count among 2 alive neighbors.",
        "Poppy Grower": "Minions & Demon don't know each other. When you die, they learn each other that night.",
        "Savant": "Each day: privately ask Storyteller for 2 statements, 1 true & 1 false.",
        "Tea Lady": "If both alive neighbors are good, they cannot die.",
        "Town Crier": "Each night*: learn if a Minion nominated today.",
        "Snake Charmer": "Each night: pick alive player; if Demon, swap characters & alignments, they're poisoned.",
        "Undertaker": "Each night*: learn character of today's executed player.",
        "Rascal": "Each night: pick a Townsfolk; their ability yields false info until next dusk.",
        "Preacher": "Each night: pick player; if Minion, they learn & lose ability.",
        "Sailor": "Each night: pick alive player; you or they drunk until dusk. You cannot die.",
        "Bounty Hunter": "1st night: learn 1 evil player. When they die, learn another that night. [1 Townsfolk is evil]",
        "Alchemist": "You have a Minion ability. Storyteller may change your choice.",
        "Balloonist": "Each night: learn player of new character type until all 4 collected. [+0~1 Outsider]",
        "Mutant": "If 'mad' about being an Outsider, may be executed.",
        "Golem": "1 nomination/game. Nominee not Demon → they die.",
        "Politician": "If most responsible for team losing, swap alignment & win (even dead).",
        "Plague Doctor": "When you die, Storyteller gains a Minion ability.",
        "Barber": "When you die, Demon may swap 2 non-Demon players' characters tonight.",
        "Psychopath": "Each day, before noms: publicly pick a player, they die. If executed, Rock-Paper-Scissors with nominator.",
        "Pixie": "Once per game, night*: pick non-Demon char; if not in play, pick player to become it.",
        "Cerenovus": "Each night: pick player & good char; they must be mad about it tomorrow or may be executed.",
        "Summoner": "1st night: learn 3 bluffs. 3rd night: pick player to become your chosen evil Demon.",
        "Godfather": "1st night: learn in-play Outsiders. If Outsider dies by day, may kill tonight. [±1 Outsider]",
        "Vortox": "Each night*: kill 1. All Townsfolk info false. No execution → Evil wins.",
        "Kazali": "Each night*: kill 1. [You choose Minions, ±any Outsiders]",
        "No-Dashi": "Each night*: kill 1. 2 alive neighbor Townsfolk poisoned.",
        "Al-Hadikhia": "Each night*: pick 3 (all know); each secretly chooses live/die. All choose live → all die."
    },
    anliu: {
        "Washerwoman": "1st night: learn 2 players & 1 Townsfolk; 1 of them is that character.",
        "Librarian": "1st night: learn 2 players & 1 Outsider; 1 is that char (or learn no Outsiders).",
        "Investigator": "1st night: learn 2 players & 1 Minion; 1 is that char (or learn no Minions).",
        "Chef": "1st night: learn # of adjacent evil pairs.",
        "Empath": "Each night: learn evil count among 2 alive neighbors.",
        "Fortune Teller": "Each night: pick 2; learn if there's a Demon. 1 good player always registers as Demon.",
        "Undertaker": "Each night*: learn character of today's executed player.",
        "Monk": "Each night*: pick another player; Demon's harmful ability blocked on them.",
        "Ravenkeeper": "If killed at night, wake to pick a player: learn their character.",
        "Virgin": "1st time nominated: if nominator is Townsfolk, they are executed immediately.",
        "Slayer": "Once/game, day: publicly pick player; if Demon, they die.",
        "Soldier": "Demon's harmful ability has no effect on you.",
        "Mayor": "If 3 alive & no execution, team wins. If dying at night, another may die instead.",
        "Butler": "Each night: pick another player; tomorrow you may only vote if they do.",
        "Drunk": "You think you're a Townsfolk but you're not. You don't know this.",
        "Recluse": "May register as evil/Minion/Demon, even if dead.",
        "Saint": "If executed, your team loses.",
        "Poisoner": "Each night: pick player; they're poisoned tonight & tomorrow.",
        "Spy": "Each night: may see Grimoire. May register as good/Townsfolk/Outsider, even dead.",
        "Baron": "Extra Outsiders in play. [+2 Outsiders]",
        "Scarlet Woman": "If ≥5 alive (excl. Travelers) & Demon dies, you become the Demon.",
        "Imp": "Each night*: kill 1. If you kill yourself, a Minion becomes the Imp."
    },
    mengyun: {
        "Clockmaker": "1st night: learn distance from Demon to nearest Minion.",
        "Dreamer": "Each night: pick non-you/Traveler; learn 1 good & 1 evil char, 1 is their real role.",
        "Snake Charmer": "Each night: pick alive player; if Demon, swap characters & alignments, they're poisoned.",
        "Mathematician": "Each night: learn how many abilities malfunctioned since dawn.",
        "Flowergirl": "Each night*: learn if Demon voted today.",
        "Town Crier": "Each night*: learn if a Minion nominated today.",
        "Oracle": "Each night*: learn how many dead players are evil.",
        "Juggler": "1st day: publicly guess up to 5 player characters. Night: learn correct count.",
        "Savant": "Each day: privately ask Storyteller for 2 statements, 1 true & 1 false.",
        "Seamstress": "Once/game, night: pick 2 non-you players; learn if same alignment.",
        "Philosopher": "Once/game, night: pick good char; gain its ability. If in play, they're drunk.",
        "Artist": "Once/game, day: privately ask Storyteller 1 yes/no question.",
        "Sage": "If Demon kills you, wake tonight: learn 2 players, 1 is the Demon.",
        "Mutant": "If 'mad' about being an Outsider, may be executed.",
        "Barber": "When you die, Demon may swap 2 non-Demon players' characters tonight.",
        "Sweetheart": "When you die, 1 player becomes drunk permanently.",
        "Klutz": "When you learn you died: publicly pick alive player; if evil, team loses.",
        "Witch": "Each night: pick player; if they nominate tomorrow, they die. Lost when 3 alive.",
        "Cerenovus": "Each night: pick player & good char; they must be mad about it tomorrow or may be executed.",
        "Pit-Hag": "Each night*: pick player & char; if not in play, they become it. If Demon created, deaths arbitrary.",
        "Evil Twin": "You & opposing-alignment player know each other. Good twin executed → Evil wins. Both alive → Good can't win.",
        "Fang Gu": "Each night*: kill 1. 1st Outsider killed becomes evil Fang Gu instead. [+1 Outsider]",
        "No-Dashi": "Each night*: kill 1. 2 alive neighbor Townsfolk poisoned.",
        "Vigormortis": "Each night*: kill 1. Killed Minions keep ability, 1 neighbor Townsfolk poisoned. [-1 Outsider]",
        "Vortox": "Each night*: kill 1. All Townsfolk info false. No execution → Evil wins."
    },
    wafuleiming: {
        "Investigator": "1st night: learn 2 players & 1 Minion; 1 is that char (or learn no Minions).",
        "Chef": "1st night: learn # of adjacent evil pairs.",
        "Grandma": "1st night: learn 1 good player & their char. If Demon kills them, you die too.",
        "Fortune Teller": "Each night: pick 2; learn if there's a Demon. 1 good player always registers as Demon.",
        "Balloonist": "Each night: learn player of new character type until all types learned. [+1 Outsider]",
        "Dreamer": "Each night: pick non-you/Traveler; learn 1 good & 1 evil char, 1 is their real role.",
        "Snake Charmer": "Each night: pick alive player; if Demon, swap characters & alignments, they're poisoned.",
        "Gambler": "Each night*: pick player & guess char; wrong → you die.",
        "Savant": "Each day: privately ask Storyteller for 2 statements, 1 true & 1 false.",
        "Philosopher": "Once/game, night: pick good char; gain its ability. If in play, they're drunk.",
        "Ravenkeeper": "If killed at night, wake to pick a player: learn their character.",
        "Amnesiac": "You don't know your ability. Each day, guess it; Storyteller tells accuracy.",
        "Cannibal": "You have last executed player's ability. If they were evil, poisoned until next good execution.",
        "Drunk": "You think you're a Townsfolk but you're not. You don't know this.",
        "Recluse": "May register as evil/Minion/Demon, even if dead.",
        "Mutant": "If 'mad' about being an Outsider, may be executed.",
        "Sweetheart": "When you die, 1 player becomes drunk permanently.",
        "Lunatic": "You think you're the Demon but aren't. Real Demon knows you & your picks.",
        "Godfather": "1st night: learn in-play Outsiders. If Outsider dies by day, wake to kill tonight. [±1 Outsider]",
        "Pit-Hag": "Each night*: pick player & char; if not in play, they become it.",
        "Cerenovus": "Each night: pick player & good char; they must be mad about it tomorrow or may be executed.",
        "Widow": "1st night: see Grimoire + poison 1 player. 1 good player learns Widow is in play.",
        "Imp": "Each night*: kill 1. If you kill yourself, a Minion becomes the Imp.",
        "Vigormortis": "Each night*: kill 1. Killed Minions keep ability, 1 neighbor Townsfolk poisoned. [-1 Outsider]",
        "Fang Gu": "Each night*: kill 1. 1st Outsider killed becomes evil Fang Gu instead. [+1 Outsider]"
    }
};

export const CORE_LOGIC_RULES = `
=== 血染钟楼核心推理公理 (Deduction Axioms v4.0) ===

1. 伪装排他: 恶魔的3个Bluffs角色物理卡牌不在场中。任何宣称Bluffs角色者必为假。
2. 座位收缩: 结算邻座(共情者/茶艺师/诺达鲺)时，死亡玩家被物理跳过，两侧存活直接并拢形成新邻座。
3. 醉毒一命: 一次性技能(杀手/猎手/魔像)在醉酒/中毒时发动 → 永久消耗且无效。圣徒/呆瓜醉毒时处决 → 胜负判定不触发。
4. 恶魔传承: 恶魔身份传给已死玩家 → 邪恶立刻战败(无存活恶魔在场)。
5. 角色唯一: 同一善良角色在场至多1个。两人宣称同一善良身份 → 必有一假(排除洗脑/巫婆/酒鬼干扰后)。
`;

export const CORE_LOGIC_RULES_EN = `
=== BOTC CORE DEDUCTION AXIOMS (v4.0) ===

1. Bluff Exclusivity: The 3 Demon Bluffs are NOT physically in play. Any claim of a Bluff role = FALSE.
2. Seating Contraction: Dead players are physically skipped for neighbor checks (Empath/Tea Lady/No-Dashi). Adjacent alive players merge directly.
3. One-Shot Burn: Using a one-shot ability (Slayer/Hunter/Golem) while drunk/poisoned → permanently consumed and fails. Saint/Klutz execution while drunk/poisoned → game-ending effect does NOT trigger.
4. Demon Succession: Passing Demonhood to a dead player → Evil loses immediately (no living Demon exists).
5. Role Uniqueness: Each good character appears at most once in play. Two players claiming the same good role → at least one is false (after ruling out Cerenovus/Pit-Hag/Drunk interference).
`;

