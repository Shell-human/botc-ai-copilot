/* ==========================================================================
   constants.js - 全局常量与厂商配置映射 (Magic Values & Provider Configs)
   ========================================================================== */

// Provider → 默认 Base URL 映射
export const PROVIDER_BASE_URLS = {
    gemini: "",
    chatgpt: "https://api.openai.com/v1",
    claude: "https://api.anthropic.com/v1",
    deepseek: "https://api.deepseek.com/v1",
    qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    zhipu: "https://open.bigmodel.cn/api/paas/v4/",
    doubao: "https://ark.cn-beijing.volces.com/api/v3",
    kimi: "https://api.moonshot.cn/v1",
    baidu: "https://aistudio.baidu.com/llm/lmapi/v3",
    custom: "http://localhost:11434/v1"
};

// Provider 名称映射（用于 UI 展示，不依赖 i18n）
export const PROVIDER_TITLES = {
    gemini: "Google Gemini",
    chatgpt: "OpenAI ChatGPT",
    claude: "Anthropic Claude",
    deepseek: "DeepSeek",
    qwen: "Alibaba Qwen / 阿里通义千问",
    zhipu: "Zhipu GLM / 智谱清言",
    doubao: "ByteDance Doubao / 字节跳动火山引擎",
    kimi: "Moonshot Kimi / 月之暗面",
    baidu: "Baidu ERNIE / 百度文心一言",
    custom: "Custom / 自定义兼容协议"
};

// 模型友好名称映射（用于加载文案与状态指示灯）
export const MODEL_FRIENDLY_NAMES = {
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

// 剧本名中英对照表（用于日志翻译中的反向映射）
export const SCRIPT_NAME_MAP = {
    "Supreme Slaughter": "无上杀戮",
    "Trouble Brewing": "暗流涌动",
    "Sects & Violets": "梦殒春宵",
    "Laissez un Faire": "瓦釜雷鸣"
};

export const SCRIPT_NAME_MAP_REVERSE = {
    "无上杀戮": "Supreme Slaughter",
    "暗流涌动": "Trouble Brewing",
    "梦殒春宵": "Sects & Violets",
    "瓦釜雷鸣": "Laissez un Faire"
};
