/* ==========================================================================
   chatRenderer.js - 聊天对话气泡渲染器 (Chat Bubble Renderer)
   职责：将 gameState.chatMessages 渲染为 chatbot 风格气泡消息列表
   ========================================================================== */

import { gameState } from '../core/state.js';
import { dom } from '../core/dom.js';
import { parseMarkdown, escapeHtml } from '../utils.js';

/**
 * 格式化时间戳为 HH:MM 格式
 */
function formatTime(timestamp) {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * 生成单个消息气泡的 HTML
 */
function buildMessageBubble(msg) {
    const isUser = msg.role === 'user';
    const roleClass = isUser ? 'chat-message--user' : 'chat-message--assistant';
    const timeStr = formatTime(msg.timestamp);
    
    const contentHtml = isUser
        ? escapeHtml(msg.content).replace(/\n/g, '<br>')
        : parseMarkdown(msg.content);
    
    return `
        <div class="chat-message ${roleClass}">
            <div class="chat-message__bubble">${contentHtml}</div>
            <div class="chat-message__timestamp">${timeStr}</div>
        </div>
    `;
}

/**
 * 生成打字指示器 HTML
 */
function buildTypingIndicator() {
    return `
        <div class="chat-typing-indicator" id="chatTypingIndicator">
            <span></span><span></span><span></span>
        </div>
    `;
}

/**
 * 完全重新渲染所有聊天消息（从 gameState.chatMessages）
 */
export function renderChatMessages() {
    if (!dom.chatBox) return;
    
    if (!gameState.chatMessages || gameState.chatMessages.length === 0) {
        resetChatBox();
        return;
    }
    
    const bubblesHtml = gameState.chatMessages.map(buildMessageBubble).join('');
    dom.chatBox.innerHTML = bubblesHtml;
    scrollChatToBottom();
}

/**
 * 追加一条新消息气泡（不重建整个列表）
 */
export function appendChatMessage(msg) {
    if (!dom.chatBox) return;
    
    // 如果还是欢迎界面，清空它
    const welcomeEl = dom.chatBox.querySelector('.chat-welcome');
    if (welcomeEl) {
        dom.chatBox.innerHTML = '';
    }
    
    const bubbleHtml = buildMessageBubble(msg);
    dom.chatBox.insertAdjacentHTML('beforeend', bubbleHtml);
    scrollChatToBottom();
}

/**
 * 显示打字指示器（AI 思考中）
 */
export function showChatTyping() {
    if (!dom.chatBox) return;
    
    // 移除已有指示器避免重复
    hideChatTyping();
    
    const welcomeEl = dom.chatBox.querySelector('.chat-welcome');
    if (welcomeEl) {
        dom.chatBox.innerHTML = '';
    }
    
    dom.chatBox.insertAdjacentHTML('beforeend', buildTypingIndicator());
    scrollChatToBottom();
}

/**
 * 隐藏打字指示器
 */
export function hideChatTyping() {
    const indicator = document.getElementById('chatTypingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * 滚动聊天框到底部
 */
function scrollChatToBottom() {
    if (!dom.chatBox) return;
    requestAnimationFrame(() => {
        dom.chatBox.scrollTop = dom.chatBox.scrollHeight;
    });
}

/**
 * 重置聊天框到欢迎状态
 */
export function resetChatBox() {
    if (!dom.chatBox) return;
    
    const lang = gameState.lang || 'zh';
    const title = lang === 'en' ? 'AI Tactical Chat' : 'AI 战术对话';
    const desc = lang === 'en'
        ? 'Discuss tactics, ask rules, and analyze strategies freely with AI. Chat history is auto-saved and persists across page refreshes.'
        : '与 AI 自由讨论战术、提问规则、推演策略。对话记录将自动保存，刷新页面后也不会丢失。';
    
    dom.chatBox.innerHTML = `
        <div class="chat-welcome">
            <i data-lucide="bot" class="chat-welcome-icon"></i>
            <h3>${title}</h3>
            <p>${desc}</p>
        </div>
    `;
    
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}
