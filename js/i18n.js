/* ==========================================================================
   i18n.js - 双语国际化翻译适配核心引擎 (Localization Controller)
   ========================================================================== */

import {
    SCRIPTS_DATA,
    SCRIPTS_DATA_EN,
    CHARACTER_DETAILS,
    CHARACTER_DETAILS_EN
} from './data/rules.js';

import {
    ROLE_TRANSLATIONS,
    ROLE_TRANSLATIONS_REVERSE,
    TRANSLATIONS
} from './data/translations.js';

import { gameState, saveToLocalStorage } from './state.js';
import { dom } from './dom.js';

import { renderSeatingChart } from './components/seatingChart.js';
import { renderPlayerList } from './components/playerList.js';
import { renderTimelineLogs } from './components/timelineLogs.js';
import { populateScriptPreview } from './components/scriptPreview.js';
import { saveLanguage } from './services/storage.js';

export function getLocalizedRole(roleName) {
    if (gameState.lang === "en") {
        return ROLE_TRANSLATIONS[roleName] || roleName;
    }
    return roleName;
}

export function getLocalizedClaim(claim) {
    if (claim === "未知") {
        return gameState.lang === "en" ? "Unknown" : "未知";
    }
    return getLocalizedRole(claim);
}

export function getLocalizedLog(log, lang) {
    let displayLog = log;
    if (lang === "en") {
        displayLog = displayLog
            .replace(/对局初始化：(\d+) 人本，板子《(.*?)》。/g, (match, count, script) => {
                const scriptEn = SCRIPTS_DATA_EN[gameState.scriptName]?.name || script;
                return `Game initialized: ${count}-player game, Script: "${scriptEn}".`;
            })
            .replace(/我的位置是 <strong>(\d+) 号<\/strong>，角色是 <strong>(.*?)<\/strong> \((.*?)\)。/g, (match, seat, role, alignment) => {
                const mappedRole = ROLE_TRANSLATIONS[role] || role;
                const mappedAlign = alignment === "善良阵营" ? "Good Team" : "Evil Team";
                return `My seat is <strong>Seat ${seat}</strong>, Role: <strong>${mappedRole}</strong> (${mappedAlign}).`;
            })
            .replace(/说书人给的 3 个好人伪装身份：<strong>(.*?)<\/strong>。/g, (match, bluffs) => {
                const mappedBluffs = bluffs.split('、').map(b => ROLE_TRANSLATIONS[b] || b).join(', ');
                return `3 Demon Bluffs given by Storyteller: <strong>${mappedBluffs}</strong>.`;
            })
            .replace(/<strong>(.*?)<\/strong> 状态更新为：存活/g, "<strong>$1</strong> status updated to: Alive")
            .replace(/<strong>(.*?)<\/strong> 状态更新为：❌ 死亡/g, "<strong>$1</strong> status updated to: ❌ Dead")
            .replace(/<strong>(.*?)<\/strong> 标记为：🟣 中毒\/醉酒状态/g, "<strong>$1</strong> marked as: 🟣 Drunk/Poisoned")
            .replace(/<strong>(.*?)<\/strong> 标记为：已恢复健康状态/g, "<strong>$1</strong> marked as: Healthy")
            .replace(/手动更新了 <strong>(.*?)<\/strong> 的状态：/g, "Manually updated <strong>$1</strong> status: ")
            .replace(/宣称变更为 <strong>(.*?)<\/strong>/g, (match, role) => `Claim updated to <strong>${ROLE_TRANSLATIONS[role] || role}</strong>`)
            .replace(/生命状态变更为 <strong>存活<\/strong>/g, "Life status changed to <strong>Alive</strong>")
            .replace(/生命状态变更为 <strong>死亡<\/strong>/g, "Life status changed to <strong>Dead</strong>")
            .replace(/推测阵营变更为 <strong>善良<\/strong>/g, "Suspected alignment changed to <strong>Good</strong>")
            .replace(/推测阵营变更为 <strong>邪恶<\/strong>/g, "Suspected alignment changed to <strong>Evil</strong>")
            .replace(/推测阵营变更为 <strong>未知<\/strong>/g, "Suspected alignment changed to <strong>Unknown</strong>")
            .replace(/状态标记为 <strong>中毒\/醉酒<\/strong>/g, "Status marked as <strong>Drunk/Poisoned</strong>")
            .replace(/状态标记为 <strong>正常<\/strong>/g, "Status marked as <strong>Normal</strong>")
            .replace(/备注："(.*?)"/g, 'Notes: "$1"')
            .replace(/，/g, ", ")
            .replace(/已自动为您恢复上次对局状态！/g, "Automatically recovered the last game state!")
            .replace(/对局已成功从本地浏览器缓存恢复！继续推演分析吧。/g, "Game state successfully recovered from local browser cache! Continue analysis.")
            .replace(/白天进展陈述："(.*?)"/g, 'Day progress updates: "$1"')
            .replace(/白天进展陈述\(暂存\)："(.*?)"/g, 'Day progress updates (cached): "$1"');

        displayLog = displayLog
            .replace(/<strong>我<\/strong>/g, "<strong>Me</strong>")
            .replace(/<strong>玩家 (\d+)<\/strong>/g, "<strong>Player $1</strong>");
    } else {
        displayLog = displayLog
            .replace(/Game initialized: (\d+)-player game, Script: "(.*?)"./g, (match, count, script) => {
                const scriptNameMap = { "Supreme Slaughter": "无上杀戮", "Trouble Brewing": "暗流涌动", "Sects & Violets": "梦殒春宵", "Laissez un Faire": "瓦釜雷鸣" };
                const cnScript = scriptNameMap[script] || script;
                return `对局初始化：${count} 人本，板子《${cnScript}》。`;
            })
            .replace(/My seat is <strong>Seat (\d+)<\/strong>, Role: <strong>(.*?)<\/strong> \((.*?)\)./g, (match, seat, role, alignment) => {
                const mappedRole = ROLE_TRANSLATIONS_REVERSE[role] || role;
                const mappedAlign = alignment === "Good Team" ? "善良阵营" : "邪恶阵营";
                return `我的位置是 <strong>${seat} 号</strong>，角色是 <strong>${mappedRole}</strong> (${mappedAlign})。`;
            })
            .replace(/3 Demon Bluffs given by Storyteller: <strong>(.*?)<\/strong>./g, (match, bluffs) => {
                const mappedBluffs = bluffs.split(', ').map(b => ROLE_TRANSLATIONS_REVERSE[b] || b).join('、');
                return `说书人给的 3 个好人伪装身份：<strong>${mappedBluffs}</strong>。`;
            })
            .replace(/<strong>Me<\/strong>/g, "<strong>我</strong>")
            .replace(/<strong>Player (\d+)<\/strong>/g, "<strong>玩家 $1</strong>")
            .replace(/ status updated to: Alive/g, " 状态更新为：存活")
            .replace(/ status updated to: ❌ Dead/g, " 状态更新为：❌ 死亡")
            .replace(/ marked as: 🟣 Drunk\/Poisoned/g, " 标记为：🟣 中毒/醉酒状态")
            .replace(/ marked as: Healthy/g, " 标记为：已恢复健康状态")
            .replace(/Manually updated <strong>(.*?)<\/strong> status: /g, "手动更新了 <strong>$1</strong> 的状态：")
            .replace(/Claim updated to <strong>(.*?)<\/strong>/g, (match, role) => `宣称变更为 <strong>${ROLE_TRANSLATIONS_REVERSE[role] || role}</strong>`)
            .replace(/Life status changed to <strong>Alive<\/strong>/g, "生命状态变更为 <strong>存活</strong>")
            .replace(/Life status changed to <strong>Dead<\/strong>/g, "生命状态变更为 <strong>死亡</strong>")
            .replace(/Suspected alignment changed to <strong>Good<\/strong>/g, "推测阵营变更为 <strong>善良</strong>")
            .replace(/Suspected alignment changed to <strong>Evil<\/strong>/g, "推测阵营变更为 <strong>邪恶</strong>")
            .replace(/Suspected alignment changed to <strong>Unknown<\/strong>/g, "推测阵营变更为 <strong>未知</strong>")
            .replace(/Status marked as <strong>Drunk\/Poisoned<\/strong>/g, "状态标记为 <strong>中毒/醉酒</strong>")
            .replace(/Status marked as <strong>Normal<\/strong>/g, "状态标记为 <strong>正常</strong>")
            .replace(/Notes: "(.*?)"/g, '备注："$1"')
            .replace(/, /g, "，")
            .replace(/Automatically recovered the last game state!/g, "已自动为您恢复上次对局状态！")
            .replace(/Game state successfully recovered from local browser cache! Continue analysis./g, "对局已成功从本地浏览器缓存恢复！继续推演分析吧。")
            .replace(/Day progress updates: "(.*?)"/g, '白天进展陈述："$1"')
            .replace(/Day progress updates \(cached\): "(.*?)"/g, '白天进展陈述(暂存)："$1"');
    }
    return displayLog;
}

export function useEnOrZh(zh, en) {
    return gameState.lang === "en" ? en : zh;
}

export function translateDropdowns(lang) {
    const isEn = lang === "en";
    
    // 1. Player Count Dropdown options
    if (dom.playerCountSelect) {
        const select = dom.playerCountSelect;
        Array.from(select.options).forEach(opt => {
            const val = opt.value;
            if (val === "7") opt.textContent = isEn ? "7 Players (5 Townsfolk / 1 Outsider / 1 Minion / 1 Demon)" : "7 人本 (5村民 / 1外来 / 1爪牙 / 1恶魔)";
            else if (val === "8") opt.textContent = isEn ? "8 Players (5 Townsfolk / 1 Outsider / 1 Minion / 1 Demon) *Balloonist +1" : "8 人本 (5村民 / 1外来 / 1爪牙 / 1恶魔) *气球等+1";
            else if (val === "9") opt.textContent = isEn ? "9 Players (5 Townsfolk / 2 Outsiders / 1 Minion / 1 Demon)" : "9 人本 (5村民 / 2外来 / 1爪牙 / 1恶魔)";
            else if (val === "10") opt.textContent = isEn ? "10 Players (7 Townsfolk / 0 Outsiders / 2 Minions / 1 Demon)" : "10 人本 (7村民 / 0外来 / 2爪牙 / 1恶魔)";
            else if (val === "11") opt.textContent = isEn ? "11 Players (7 Townsfolk / 1 Outsider / 2 Minions / 1 Demon)" : "11 人本 (7村民 / 1外来 / 2爪牙 / 1恶魔)";
            else if (val === "12") opt.textContent = isEn ? "12 Players (7 Townsfolk / 2 Outsiders / 2 Minions / 1 Demon)" : "12 人本 (7村民 / 2外来 / 2爪牙 / 1恶魔)";
            else if (val === "13") opt.textContent = isEn ? "13 Players (9 Townsfolk / 0 Outsiders / 3 Minions / 1 Demon)" : "13 人本 (9村民 / 0外来 / 3爪牙 / 1恶魔)";
            else if (val === "14") opt.textContent = isEn ? "14 Players (9 Townsfolk / 1 Outsider / 3 Minions / 1 Demon)" : "14 人本 (9村民 / 1外来 / 3爪牙 / 1恶魔)";
            else if (val === "15") opt.textContent = isEn ? "15 Players (9 Townsfolk / 2 Outsiders / 3 Minions / 1 Demon)" : "15 人本 (9村民 / 2外来 / 3爪牙 / 1恶魔)";
        });
    }

    // 2. Script Select Dropdown options
    if (dom.scriptSelect) {
        const select = dom.scriptSelect;
        Array.from(select.options).forEach(opt => {
            const val = opt.value;
            if (val === "wushang") opt.textContent = isEn ? "Supreme Slaughter (Custom High-Interaction Board)" : "无上杀戮 (自定义强交互板)";
            else if (val === "anliu") opt.textContent = isEn ? "Trouble Brewing (Classic Novice Board)" : "暗流涌动 (经典新手板)";
            else if (val === "mengyun") opt.textContent = isEn ? "Sects & Violets (Classic Advanced Board)" : "梦殒春宵 (经典进阶板)";
            else if (val === "wafuleiming") opt.textContent = isEn ? "Laissez un Faire (Classic Advanced Board)" : "瓦釜雷鸣 (经典进阶板)";
        });
    }

    // 3. API Provider options
    if (dom.apiProviderSelect) {
        const select = dom.apiProviderSelect;
        Array.from(select.options).forEach(opt => {
            const val = opt.value;
            if (val === "gemini") opt.textContent = "Google Gemini";
            else if (val === "chatgpt") opt.textContent = "OpenAI ChatGPT";
            else if (val === "claude") opt.textContent = "Anthropic Claude";
            else if (val === "deepseek") opt.textContent = "DeepSeek";
            else if (val === "qwen") opt.textContent = isEn ? "Alibaba Qwen" : "阿里通义千问 (Qwen)";
            else if (val === "zhipu") opt.textContent = isEn ? "Zhipu GLM" : "智谱清言 (GLM)";
            else if (val === "doubao") opt.textContent = isEn ? "ByteDance Doubao" : "字节跳动火山引擎 (Doubao)";
            else if (val === "kimi") opt.textContent = isEn ? "Moonshot Kimi" : "月之暗面 (Kimi)";
            else if (val === "baidu") opt.textContent = isEn ? "Baidu ERNIE" : "百度文心一言 (ERNIE)";
            else if (val === "custom") opt.textContent = isEn ? "Custom / OpenAI Compatible" : "自定义 / 其他兼容协议 (Custom)";
        });
    }
}

export function setLanguage(lang) {
    gameState.lang = lang;
    saveLanguage(lang);
    
    if (dom.langToggleText) {
        dom.langToggleText.textContent = lang === "zh" ? "English" : "简体中文";
    }
    
    translateDropdowns(lang);
    
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.textContent = TRANSLATIONS[lang][key];
        }
    });
    
    const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
    placeholders.forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.placeholder = TRANSLATIONS[lang][key];
        }
    });
    
    const titles = document.querySelectorAll("[data-i18n-title]");
    titles.forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.title = TRANSLATIONS[lang][key];
        }
    });
    
    updateMyRoleOptions();
    
    if (gameState.players && gameState.players.length > 0) {
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
    
    populateScriptPreview();
    updateApiModelOptions();
    
    if (dom.analysisBox && dom.analysisBox.querySelector(".ai-welcome")) {
        resetAnalysisBoxes();
    }
    
    saveToLocalStorage();
}

export function updateMyRoleOptions() {
    const isEn = gameState.lang === "en";
    const selectedScriptValue = dom.scriptSelect ? dom.scriptSelect.value : "wushang";
    const script = isEn ? SCRIPTS_DATA_EN[selectedScriptValue] : SCRIPTS_DATA[selectedScriptValue];
    if (!script) return;
    
    dom.myRoleSelect.innerHTML = "";
    
    const cnScript = SCRIPTS_DATA[selectedScriptValue];
    const allRolesCn = [...cnScript.townsfolk, ...cnScript.outsider, ...cnScript.minion, ...cnScript.demon];
    
    allRolesCn.forEach(role => {
        const option = document.createElement("option");
        option.value = role;
        option.textContent = getLocalizedRole(role);
        if (role === gameState.myRole) option.selected = true;
        dom.myRoleSelect.appendChild(option);
    });

    dom.popoverRoleSelect.innerHTML = `<option value="未知">${isEn ? "Unknown Character" : "未知角色"}</option>`;
    allRolesCn.forEach(role => {
        const option = document.createElement("option");
        option.value = role;
        option.textContent = getLocalizedRole(role);
        dom.popoverRoleSelect.appendChild(option);
    });

    const goodRolesCn = [...cnScript.townsfolk, ...cnScript.outsider];
    [dom.evilBluff1, dom.evilBluff2, dom.evilBluff3].forEach((select, idx) => {
        if (!select) return;
        select.innerHTML = `<option value="">${isEn ? `-- Bluff ${idx + 1} --` : `-- 伪装 ${idx + 1} --`}</option>`;
        goodRolesCn.forEach(role => {
            const option = document.createElement("option");
            option.value = role;
            option.textContent = getLocalizedRole(role);
            select.appendChild(option);
        });
    });
}

export function updateApiModelOptions() {
    const provider = dom.apiProviderSelect.value;
    dom.aiModelSelect.innerHTML = "";
    const useEnglish = gameState.lang === "en";
    
    let presets = [];
    
    if (provider === "gemini") {
        presets = [
            { value: "gemini-flash-latest", text: useEnglish ? "Gemini Flash Latest (Dynamic)" : "Gemini Flash 最新动态版 (当前指向 3.5 Flash)" },
            { value: "gemini-3.5-flash", text: useEnglish ? "Gemini 3.5 Flash (Latest 2026)" : "Gemini 3.5 Flash (最新 2026 闪电旗舰/带推理)" },
            { value: "gemini-3.1-pro-preview", text: useEnglish ? "Gemini 3.1 Pro (Reasoning)" : "Gemini 3.1 Pro (最新 2026 深度推理Pro/带推理)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.add("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("Gemini API Key (密钥)", "Gemini API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "已自动填充 Google Gemini 原生密钥，支持最新的 3.5 Flash 极速推理模型以及 3.1 Pro 深度推理模型，无需配置直接使用！",
            "Google Gemini key pre-filled by default. Supports latest Gemini 3.5 Flash and Gemini 3.1 Pro models instantly!"
        );
    } else if (provider === "chatgpt") {
        presets = [
            { value: "gpt-5.5", text: useEnglish ? "GPT-5.5 Flagship" : "GPT-5.5 Flagship (最新 2026 核心旗舰)" },
            { value: "gpt-5.4", text: useEnglish ? "GPT-5.4 Standard" : "GPT-5.4 Standard (主力高吞吐工作流模型)" },
            { value: "gpt-5.4-mini", text: useEnglish ? "GPT-5.4 Mini" : "GPT-5.4 Mini (低延迟轻量级大模型)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("OpenAI API Key (密钥)", "OpenAI API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "请填入您的 OpenAI API 密钥。支持自定义中转接口 Base URL（支持各大中转代理平台）。",
            "Please enter your OpenAI API Key. Custom Base URL is supported (useful for third-party proxies)."
        );
    } else if (provider === "claude") {
        presets = [
            { value: "claude-opus-4-8", text: useEnglish ? "Claude Opus 4.8" : "Claude Opus 4.8 (最新 2026 终极智能旗舰)" },
            { value: "claude-sonnet-4-6", text: useEnglish ? "Claude Sonnet 4.6" : "Claude Sonnet 4.6 (高速度与深度推理平衡模范)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("Anthropic API Key / 代理密钥", "Anthropic API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "支持原生 Claude 密钥（直连需要本地开发或翻墙），以及各类 OpenAI 格式中转代理密钥（修改 Base URL 即可）。",
            "Supports native Claude keys (needs local routing) and various OpenAI format proxy keys (just change Base URL)."
        );
    } else if (provider === "deepseek") {
        presets = [
            { value: "deepseek-v4-pro", text: useEnglish ? "DeepSeek V4 Pro" : "DeepSeek V4 Pro (最新 2026 深度思考旗舰)" },
            { value: "deepseek-v4-flash", text: useEnglish ? "DeepSeek V4 Flash" : "DeepSeek V4 Flash (最新 2026 极速旗舰)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("DeepSeek API Key (密钥)", "DeepSeek API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "支持 DeepSeek 官方密钥（基地址为 https://api.deepseek.com/v1）或各大厂商兼容中转密钥。",
            "Supports DeepSeek official keys (Base URL: https://api.deepseek.com/v1) or compatible reseller API keys."
        );
    } else if (provider === "qwen") {
        presets = [
            { value: "qwen3.7-max", text: useEnglish ? "Qwen 3.7 Max" : "通义千问 Qwen 3.7 Max (最新 2026 商业旗舰)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("阿里通义 API Key (密钥)", "Alibaba DashScope Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "支持阿里云 DashScope 密钥（基地址为 https://dashscope.aliyuncs.com/compatible-mode/v1）及其代理密钥。",
            "Supports Alibaba DashScope compatible keys (Base URL: https://dashscope.aliyuncs.com/compatible-mode/v1) and their proxies."
        );
    } else if (provider === "zhipu") {
        presets = [
            { value: "glm-5.1", text: useEnglish ? "GLM-5.1 Flagship" : "GLM-5.1 Flagship (最新 2026 本土最强 MoE 旗舰)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("智谱 GLM API Key (密钥)", "Zhipu GLM API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "支持智谱开放平台 API 密钥（基地址为 https://open.bigmodel.cn/api/paas/v4/）。",
            "Supports Zhipu open platform keys (Base URL: https://open.bigmodel.cn/api/paas/v4/)."
        );
    } else if (provider === "doubao") {
        presets = [
            { value: "doubao-seed-2-0-pro-260215", text: useEnglish ? "Doubao Seed 2.0 Pro" : "Doubao Seed 2.0 Pro (最新 2026 字节旗舰)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("火山引擎 API Key (密钥)", "Volcengine API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "支持火山引擎大模型服务平台 API 密钥（基地址为 https://ark.cn-beijing.volces.com/api/v3）。",
            "Supports ByteDance Volcengine ARK API keys (Base URL: https://ark.cn-beijing.volces.com/api/v3)."
        );
    } else if (provider === "kimi") {
        presets = [
            { value: "kimi-k2.6", text: useEnglish ? "Kimi K2.6" : "Kimi K2.6 (最新 2026 Agent Swarm 深度推理)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("月之暗面 Kimi API Key", "Moonshot Kimi API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "支持月之暗面开放平台 API 密钥（基地址为 https://api.moonshot.cn/v1）。",
            "Supports Moonshot Kimi open platform keys (Base URL: https://api.moonshot.cn/v1)."
        );
    } else if (provider === "baidu") {
        presets = [
            { value: "ernie-5.1", text: useEnglish ? "ERNIE 5.1" : "ERNIE 5.1 (最新 2026 百度中文搜索推理旗舰)" },
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("百度 API Key (AccessToken)", "Baidu Qianfan AccessToken");
        dom.apiConfigTip.textContent = useEnOrZh(
            "支持百度文心千帆/AI Studio 开放平台 API 密钥（基地址为 https://aistudio.baidu.com/llm/lmapi/v3）。",
            "Supports Baidu Qianfan / AI Studio open platform keys (Base URL: https://aistudio.baidu.com/llm/lmapi/v3)."
        );
    } else { // custom / others
        presets = [
            { value: "custom", text: useEnglish ? "-- Custom Model ID --" : "-- 自定义模型 ID (Custom) --" }
        ];
        dom.apiBaseUrlContainer.classList.remove("hidden");
        dom.apiKeyLabel.textContent = useEnOrZh("API Key / 接口密钥", "API Key");
        dom.apiConfigTip.textContent = useEnOrZh(
            "用于对接各类未列出的模型网关协议、SiliconFlow 代理、本地 Ollama 离线部署等。",
            "Used for other custom model integrations, SiliconFlow gateway, local Ollama endpoints, etc."
        );
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

export function resetAnalysisBoxes() {
    const isEn = gameState.lang === "en";
    
    const welcomeTitle = isEn ? "Hello, Clocktower Explorer" : "你好，钟楼探索者";
    const welcomeDesc = isEn 
        ? "Game successfully initialized! Please enter the first round of night or day updates in the console on the right, and I will analyze the match for you using our logical solver and parallel world algorithms."
        : "对局已成功初始化！请在右侧控制台输入第一轮夜晚或白天的信息，我将通过逻辑求解器与平行世界算法为您演算战局。";
        
    const worldlinesDesc = isEn
        ? "Waiting for data. Later, this section will calculate the logic probabilities of <b>Normal Worldline</b>, <b>Vortox Worldline</b>, and <b>Drunk/Poisoned Worldline</b>."
        : "等待局势录入中。稍后这里会推演 <b>正常世界线</b>、<b>涡流世界线</b> 以及 <b>中毒世界线</b> 的逻辑概率。";
        
    const tipsDesc = isEn
        ? "Waiting for data. Later, this section will generate recommended players to chat with and emergency warnings."
        : "等待局势录入中。稍后将为你生成本轮最推荐私聊的玩家以及防死警告。";

    dom.analysisBox.innerHTML = `
        <div class="ai-welcome">
            <i data-lucide="bot" class="welcome-icon"></i>
            <h3>${welcomeTitle}</h3>
            <p>${welcomeDesc}</p>
        </div>
    `;
    dom.worldlinesBox.innerHTML = `
        <div class="empty-tab-state">
            <p>${worldlinesDesc}</p>
        </div>
    `;
    dom.tipsBox.innerHTML = `
        <div class="empty-tab-state">
            <p>${tipsDesc}</p>
        </div>
    `;
    lucide.createIcons();
}
