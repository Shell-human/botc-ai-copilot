/* ==========================================================================
   core/lang.js - 语言工具函数 (Language Utility)
   职责：提供 useEnOrZh 等跨模块语言选择函数，避免 engine.js ↔ optionProviders.js
   循环依赖。仅依赖 core/state.js。
   ========================================================================== */

import { gameState } from './state.js';

/**
 * 根据当前语言返回中文或英文文本
 * @param {string} zh - 中文文本
 * @param {string} en - 英文文本
 * @returns {string}
 */
export function useEnOrZh(zh, en) {
    return gameState.lang === "en" ? en : zh;
}
