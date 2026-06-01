/* ==========================================================================
   i18n/optionProviders.js - 下拉框选项填充器 (Dropdown Option Providers)
   职责：填充角色选择器、API 模型选择器、下拉框翻译
   注意：本模块不依赖 engine.js，避免循环引用。直接使用 ROLE_TRANSLATIONS 和 gameState。
   ========================================================================== */

import { gameState } from '../core/state.js';
import { dom } from '../core/dom.js';
import {
    SCRIPTS_DATA,
    SCRIPTS_DATA_EN
} from '../data/rules.js';
import { ROLE_TRANSLATIONS } from '../data/translations.js';

function localizedRole(roleName) {
    if (gameState.lang === "en") {
        return ROLE_TRANSLATIONS[roleName] || roleName;
    }
    return roleName;
}

// 注意：此函数与 engine.js 中的 useEnOrZh 功能相同但刻意独立定义，
// 避免 optionProviders.js → engine.js 的循环依赖（engine.js 会 import 本模块）。
// 两个副本必须保持同步，修改时请同时更新 engine.js:37。
function useEnOrZh(zh, en) {
    return gameState.lang === "en" ? en : zh;
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
        option.textContent = localizedRole(role);
        if (role === gameState.myRole) option.selected = true;
        dom.myRoleSelect.appendChild(option);
    });

    dom.popoverRoleSelect.innerHTML = `<option value="未知">${isEn ? "Unknown Character" : "未知角色"}</option>`;
    allRolesCn.forEach(role => {
        const option = document.createElement("option");
        option.value = role;
        option.textContent = localizedRole(role);
        dom.popoverRoleSelect.appendChild(option);
    });

    const goodRolesCn = [...cnScript.townsfolk, ...cnScript.outsider];
    [dom.evilBluff1, dom.evilBluff2, dom.evilBluff3].forEach((select, idx) => {
        if (!select) return;
        select.innerHTML = `<option value="">${isEn ? `-- Bluff ${idx + 1} --` : `-- 伪装 ${idx + 1} --`}</option>`;
        goodRolesCn.forEach(role => {
            const option = document.createElement("option");
            option.value = role;
            option.textContent = localizedRole(role);
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
    } else {
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

export function translateDropdowns(lang) {
    const isEn = lang === "en";
    
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
