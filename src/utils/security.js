import DOMPurify from 'dompurify'

/**
 * 净化 HTML 内容，防止 XSS 攻击
 */
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title']
  })
}

/**
 * 净化 URL，只允许安全协议
 */
export function sanitizeUrl(url) {
  if (!url) return ''
  
  // 只允许 http, https, mailto 协议
  const safeProtocols = ['http://', 'https://', 'mailto:', '/']
  const isSafe = safeProtocols.some(p => url.toLowerCase().startsWith(p))
  
  if (!isSafe) {
    return ''
  }
  
  // 防止 javascript: 等危险协议
  try {
    const parsed = new URL(url, window.location.origin)
    if (parsed.protocol === 'javascript:') {
      return ''
    }
    return parsed.href
  } catch {
    return ''
  }
}

/**
 * 转义 HTML 特殊字符
 */
export function escapeHtml(text) {
  if (!text) return ''
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

/**
 * 验证并返回安全的头像 URL
 */
export function getSafeAvatarUrl(url, fallback = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default') {
  if (!url) return fallback
  
  // 允许的域名白名单
  const allowedDomains = [
    'api.dicebear.com',
    'avatars.githubusercontent.com',
    'lh3.googleusercontent.com',
    'graph.facebook.com',
    'q.qlogo.cn'
  ]
  
  try {
    const parsed = new URL(url)
    if (allowedDomains.some(d => parsed.hostname.endsWith(d))) {
      return url
    }
  } catch {
    // URL 解析失败
  }
  
  return fallback
}

/**
 * 内容长度限制
 */
export function truncateText(text, maxLength = 1000) {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
