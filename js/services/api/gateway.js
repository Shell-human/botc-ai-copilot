/* ==========================================================================
   gateway.js - AI API 网关统一调用层 (API Gateway)
   职责：根据 provider 分发到不同 API，返回 { reply, thoughtHtml }
   ========================================================================== */

import { gameState } from '../../core/state.js';
import { dom } from '../../core/dom.js';
import { MODEL_FRIENDLY_NAMES } from '../../core/constants.js';
import { buildThoughtHtml } from './responseParser.js';

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
                model: model === "custom" ? apiModelCustom : model,
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
            model: model === "custom" ? apiModelCustom : model,
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

    return { reply, thoughtHtml };
}
