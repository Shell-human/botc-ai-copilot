/* ==========================================================================
   core/state.js - 全局运行时状态对象 (Global Runtime State Object)
   职责：仅包含 gameState 数据对象，不包含任何业务逻辑。
   所有操作函数由 controllers/ 层提供。
   ========================================================================== */

const proxyCache = new WeakMap();
const changeListeners = [];

// 注册状态变更监听器，解耦 state.js ↔ gameController.js 的循环依赖
export function subscribeStateChange(listener) {
    if (typeof listener === "function" && !changeListeners.includes(listener)) {
        changeListeners.push(listener);
    }
}

let pending = false;
function triggerChange() {
    if (!pending) {
        pending = true;
        // 使用微任务队列（Microtask Queue）进行更新合并，防止连续修改状态时产生“渲染风暴”
        queueMicrotask(() => {
            changeListeners.forEach(listener => {
                try {
                    listener();
                } catch (err) {
                    console.error("[StateSync] Error in listener execution:", err);
                }
            });
            pending = false;
        });
    }
}

// 递归地将对象包装为 Proxy 响应式对象
function makeReactive(obj, callback) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    if (proxyCache.has(obj)) {
        return proxyCache.get(obj);
    }

    const handler = {
        get(target, key, receiver) {
            const val = Reflect.get(target, key, receiver);
            // 排除 Symbol 或原型链属性的非必要包装
            if (typeof key === 'symbol') {
                return val;
            }
            if (typeof val === 'object' && val !== null) {
                return makeReactive(val, callback);
            }
            return val;
        },
        set(target, key, value, receiver) {
            const oldVal = Reflect.get(target, key);
            if (oldVal !== value) {
                const res = Reflect.set(target, key, value, receiver);
                callback();
                return res;
            }
            return Reflect.set(target, key, value, receiver);
        },
        deleteProperty(target, key) {
            const hasKey = Reflect.has(target, key);
            const res = Reflect.deleteProperty(target, key);
            if (hasKey && res) {
                callback();
            }
            return res;
        }
    };

    const proxy = new Proxy(obj, handler);
    proxyCache.set(obj, proxy);
    return proxy;
}

const rawState = {
    apiKey: "",
    playerCount: 9,
    scriptName: "wushang",
    mySeat: 3,
    myRole: "共情者",
    myAlignment: "good",
    evilBluffs: ["", "", ""],
    apiProvider: "gemini",
    apiBaseUrl: "https://api.openai.com/v1",
    aiModel: "gemini-flash-latest",
    apiModelCustom: "",
    players: [],
    logs: [],
    aiOutputs: [],
    chatMessages: [],
    selectedSeatForEdit: null,
    lang: "zh"
};

export const gameState = makeReactive(rawState, triggerChange);

