/* ==========================================================================
   gateway.js - AI API 网关统一调用层 (API Gateway) v2.0
   职责：根据 provider 分发到不同 API，返回 { reply, thoughtHtml }
   v2.0: 添加超时+重试+Gemini自定义baseUrl支持
   ========================================================================== */

import { gameState } from '../../core/state.js';
import { dom } from '../../core/dom.js';
import { MODEL_FRIENDLY_NAMES } from '../../core/constants.js';
import { buildThoughtHtml } from './responseParser.js';

// --- 超时与重试配置 ---
const REQUEST_TIMEOUT_MS = 30000;       // 30秒单次超时
const MAX_RETRIES = 2;                  // 最多重试2次（共3次尝试）
const RETRY_BASE_DELAY_MS = 1000;       // 指数退避基数

/**
 * 带超时的 fetch 封装
 */
function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    return fetch(url, { ...options, signal }).finally(() => clearTimeout(timeoutId));
}

/**
 * 判断错误是否可重试（网络错误、超时、5xx服务端错误）
 */
function isRetryableError(error) {
    if (error.name === 'AbortError') return true;          // 超时
    if (error.message && error.message.includes('Failed to fetch')) return true; // 网络错误
    if (error.statusCode) {
        return error.statusCode >= 500 && error.statusCode < 600; // 仅 5xx 服务器错误重试
    }
    if (error.message && /5\d\d/.test(error.message)) return true; // 降级兼容
    return false;
}

/**
 * 带重试的 API 调用包装器
 */
async function withRetry(fn, maxRetries = MAX_RETRIES) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries && isRetryableError(error)) {
                const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
                console.log(`🔄 [Gateway] 第 ${attempt + 1} 次尝试失败，${delay}ms 后重试...`, error.message);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
    throw lastError;
}

export async function callAI(prompt, { provider, apiKey, baseUrl, model, apiModelCustom }) {
    let reply = "";
    let thoughtHtml = "";
    const friendlyModelName = MODEL_FRIENDLY_NAMES[model] || model;

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

        const supportsThinkingConfig = model === "gemini-3.5-flash" || model === "gemini-3.1-pro-preview" || model === "gemini-flash-latest";
        if (supportsThinkingConfig) {
            reqBody.generationConfig.thinkingConfig = {
                thinkingBudget: 2048
            };
        } else {
            reqBody.generationConfig.temperature = 0.2;
        }

        // v2.0: Gemini 也支持自定义 baseUrl（使用 header 认证，避开 URL 泄露 Key 隐患）
        let targetUrl;
        if (baseUrl && baseUrl !== "https://generativelanguage.googleapis.com") {
            let cleanBaseUrl = baseUrl.trim();
            if (cleanBaseUrl.endsWith("/")) cleanBaseUrl = cleanBaseUrl.slice(0, -1);
            targetUrl = `${cleanBaseUrl}/v1beta/models/${model}:generateContent`;
        } else {
            targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        }

        await withRetry(async () => {
            const response = await fetchWithTimeout(targetUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify(reqBody)
            }, REQUEST_TIMEOUT_MS);

            if (!response.ok) {
                const errText = await response.text();
                const err = new Error(`Gemini API 错误 (${response.status}): ${errText}`);
                err.statusCode = response.status;
                throw err;
            }

            const data = await response.json();
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("Gemini API 未能返回候选内容，请核对 API 密钥是否有效。");
            }

            const parts = data.candidates[0].content.parts;
            
            const finalParts = parts.filter(p => !p.thought);
            reply = finalParts.map(p => p.text).join('\n');

            const thoughtPart = parts.find(p => p.thought);
            if (thoughtPart && thoughtPart.text.trim()) {
                thoughtHtml = buildThoughtHtml(thoughtPart.text.trim(), friendlyModelName);
            }
        });

    } else if (provider === "claude" && baseUrl.includes("anthropic.com")) {
        let cleanBaseUrl = baseUrl.trim();
        if (cleanBaseUrl.endsWith("/")) cleanBaseUrl = cleanBaseUrl.slice(0, -1);

        await withRetry(async () => {
            const response = await fetchWithTimeout(`${cleanBaseUrl}/messages`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'dangerously-allow-browser': 'true'
                },
                body: JSON.stringify({
                    model: model === "custom" ? apiModelCustom : model,
                    max_tokens: 4000,
                    messages: [
                        { role: "user", content: prompt }
                    ]
                })
            }, REQUEST_TIMEOUT_MS);

            if (!response.ok) {
                const errText = await response.text();
                const err = new Error(`Claude API 错误 (${response.status}): ${errText}`);
                err.statusCode = response.status;
                throw err;
            }

            const data = await response.json();
            if (!data.content || data.content.length === 0) {
                throw new Error("Claude API 未能返回有效正文。");
            }
            reply = data.content[0].text || "";
        });

    } else {
        let cleanBaseUrl = baseUrl.trim();
        if (cleanBaseUrl.endsWith("/")) cleanBaseUrl = cleanBaseUrl.slice(0, -1);

        await withRetry(async () => {
            const headers = {
                'Content-Type': 'application/json'
            };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const reqBody = {
                model: model === "custom" ? apiModelCustom : model,
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.2
            };

            const response = await fetchWithTimeout(`${cleanBaseUrl}/chat/completions`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(reqBody)
            }, REQUEST_TIMEOUT_MS);

            if (!response.ok) {
                const errText = await response.text();
                const err = new Error(`API 兼容网关错误 (${response.status}): ${errText}`);
                err.statusCode = response.status;
                throw err;
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
        });
    }

    return { reply, thoughtHtml };
}
