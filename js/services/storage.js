/* ==========================================================================
   storage.js - 浏览器持久化本地存储与数据管理中心 (Persistence Service)
   ========================================================================== */

const STATE_KEY = "botc_game_state";
const LANG_KEY = "botc_lang";

/**
 * 保存当前的完整游戏状态到本地缓存
 * @param {Object} stateData 需要打包存储的运行时状态数据
 */
export function saveGameState(stateData) {
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify(stateData));
        return true;
    } catch (e) {
        console.error("无法保存对局数据到本地缓存:", e);
        return false;
    }
}

/**
 * 从本地缓存加载游戏状态
 * @returns {Object|null} 解析成功返回数据对象，否则返回 null
 */
export function loadGameState() {
    try {
        const saved = localStorage.getItem(STATE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error("读取本地缓存对局失败:", e);
        return null;
    }
}

/**
 * 清理本地缓存的游戏状态
 */
export function clearGameState() {
    try {
        localStorage.removeItem(STATE_KEY);
        return true;
    } catch (e) {
        console.error("清除本地缓存对局失败:", e);
        return false;
    }
}

/**
 * 检测本地是否存在以保存的游戏局势
 * @returns {boolean}
 */
export function hasSavedGame() {
    try {
        return !!localStorage.getItem(STATE_KEY);
    } catch (e) {
        return false;
    }
}

/**
 * 保存用户选择的语言偏好
 * @param {string} lang 
 */
export function saveLanguage(lang) {
    try {
        localStorage.setItem(LANG_KEY, lang);
        return true;
    } catch (e) {
        console.error("保存语言配置失败:", e);
        return false;
    }
}

/**
 * 获取本地保存的语言偏好，缺省返回 zh
 * @returns {string}
 */
export function loadLanguage() {
    try {
        return localStorage.getItem(LANG_KEY) || "zh";
    } catch (e) {
        return "zh";
    }
}

const API_KEY_PREFIX = "botc_api_key_";

/**
 * 根据厂商保存 API Key 到本地缓存中
 * @param {string} provider 
 * @param {string} key 
 */
export function saveApiKey(provider, key) {
    try {
        localStorage.setItem(API_KEY_PREFIX + provider, key);
        return true;
    } catch (e) {
        console.error("保存 API 密钥失败:", e);
        return false;
    }
}

/**
 * 从本地缓存加载对应厂商的 API Key
 * @param {string} provider 
 * @returns {string}
 */
export function loadApiKey(provider) {
    try {
        return localStorage.getItem(API_KEY_PREFIX + provider) || "";
    } catch (e) {
        return "";
    }
}
