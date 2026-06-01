/* ==========================================================================
   utils.js - 静态 UI 工具库 (包含 Toast 气泡框与 Markdown 解析器)
   ========================================================================== */

// --- 全局 HTML 实体转义辅助 (防范 XSS 注入) ---
export function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// --- 全局 Toast 提示辅助 ---
export function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message glass";
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "12px";
    toast.style.border = "1px solid rgba(0, 210, 255, 0.25)";
    toast.style.background = "rgba(10, 25, 50, 0.85)";
    toast.style.color = "var(--text-primary)";
    toast.style.fontFamily = "Outfit, sans-serif";
    toast.style.fontSize = "12.5px";
    toast.style.fontWeight = "600";
    toast.style.zIndex = "9999";
    toast.style.boxShadow = "0 8px 32px rgba(0, 210, 255, 0.15)";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "8px";
    toast.style.animation = "slideIn 0.3s ease-out forwards";
    toast.innerHTML = `<i data-lucide="check-circle" style="width:16px;height:16px;color:var(--color-good);"></i> ${message}`;
    
    document.body.appendChild(toast);
    lucide.createIcons({ attrs: { class: 'icon-sm' } });

    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s ease-in forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- 简易高效的 Markdown 解析器 ---
export function parseMarkdown(md) {
    if (!md) return "";
    let html = escapeHtml(md);
    
    // GitHub Alert 警示框处理
    html = html.replace(/^\>\s*\[!NOTE\]\s*(.*$)/gim, '<blockquote class="alert note"><i data-lucide="info" class="icon-sm"></i> $1</blockquote>');
    html = html.replace(/^\>\s*\[!WARNING\]\s*(.*$)/gim, '<blockquote class="alert warning"><i data-lucide="alert-triangle" class="icon-sm"></i> $1</blockquote>');
    html = html.replace(/^\>\s*\[!IMPORTANT\]\s*(.*$)/gim, '<blockquote class="alert important"><i data-lucide="shield-alert" class="icon-sm"></i> $1</blockquote>');
    
    // 粗体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 标题
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // 引用块 (排除了 Alert 块，防止冲突)
    html = html.replace(/^\>\s*(?!\[!NOTE\]|\[!WARNING\]|\[!IMPORTANT\])(.*$)/gim, '<blockquote>$1</blockquote>');
    
    // 列表项格式化
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, ''); 

    // 换行替换为段落
    html = html.split('\n\n').map(p => {
        const trimmed = p.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<block') || trimmed.startsWith('<div')) {
            return trimmed;
        }
        return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return html;
}
