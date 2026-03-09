import { computed } from 'vue'

/**
 * 高亮关键词的 composable
 */
export function useHighlight() {
  /**
   * 在文本中高亮关键词
   */
  const highlightKeyword = (text, keyword, className = 'bg-yellow-200') => {
    if (!text || !keyword) return text
    
    const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map(part => {
      if (part.toLowerCase() === keyword.toLowerCase()) {
        return `<mark class="${className} rounded px-0.5">${part}</mark>`
      }
      return part
    }).join('')
  }

  /**
   * 转义正则表达式特殊字符
   */
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 截取包含关键词的文本片段
   */
  const getSnippet = (text, keyword, contextLength = 50) => {
    if (!text || !keyword) return text
    
    const lowerText = text.toLowerCase()
    const lowerKeyword = keyword.toLowerCase()
    const index = lowerText.indexOf(lowerKeyword)
    
    if (index === -1) {
      return text.length > contextLength * 2 
        ? text.slice(0, contextLength * 2) + '...'
        : text
    }
    
    const start = Math.max(0, index - contextLength)
    const end = Math.min(text.length, index + keyword.length + contextLength)
    
    let snippet = text.slice(start, end)
    
    if (start > 0) snippet = '...' + snippet
    if (end < text.length) snippet = snippet + '...'
    
    return snippet
  }

  return {
    highlightKeyword,
    escapeRegExp,
    getSnippet
  }
}
