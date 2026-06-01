/* ==========================================================================
   i18n/logTranslator.js - 双语日志正则翻译器 (Log Translation)
   职责：纯函数，输入日志字符串和语言，返回翻译后的字符串
   ========================================================================== */

import { gameState } from '../core/state.js';
import {
    ROLE_TRANSLATIONS,
    ROLE_TRANSLATIONS_REVERSE,
} from '../data/translations.js';
import { SCRIPTS_DATA_EN } from '../data/rules.js';
import { SCRIPT_NAME_MAP } from '../core/constants.js';

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
                const cnScript = SCRIPT_NAME_MAP[script] || script;
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
