// 性能优化工具函数

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param limit 时间间隔（毫秒）
 */
export function throttle(fn, limit = 300) {
  let inThrottle = false
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 图片懒加载
 * @param selector 图片选择器
 */
export function lazyLoadImages(selector = 'img[data-src]') {
  const images = document.querySelectorAll(selector)

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.removeAttribute('data-src')
          img.classList.add('loaded')
          observer.unobserve(img)
        }
      })
    })

    images.forEach(img => imageObserver.observe(img))
  } else {
    // 降级方案：直接加载所有图片
    images.forEach(img => {
      img.src = img.dataset.src
      img.removeAttribute('data-src')
    })
  }
}

/**
 * 虚拟滚动辅助函数
 * @param options 配置选项
 */
export function useVirtualScroll(options = {}) {
  const {
    itemHeight = 100,
    bufferSize = 5,
    containerHeight = 600
  } = options

  let scrollTop = 0

  const getVisibleRange = (totalCount) => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize)
    const visibleCount = Math.ceil(containerHeight / itemHeight) + bufferSize * 2
    const end = Math.min(totalCount, start + visibleCount)

    return { start, end }
  }

  const handleScroll = throttle((e) => {
    scrollTop = e.target.scrollTop
  }, 16)

  return {
    getVisibleRange,
    handleScroll
  }
}

/**
 * 本地缓存装饰器
 * @param fn 要缓存的函数
 * @param key 缓存键
 * @param ttl 缓存时间（毫秒）
 */
export function withCache(fn, key, ttl = 60000) {
  const cache = new Map()

  return function (...args) {
    const cacheKey = `${key}:${JSON.stringify(args)}`
    const cached = cache.get(cacheKey)

    if (cached && Date.now() - cached.time < ttl) {
      return cached.value
    }

    const value = fn.apply(this, args)
    cache.set(cacheKey, { value, time: Date.now() })

    return value
  }
}

/**
 * 请求Idle回调的兼容封装
 */
export function requestIdleCallbackCompat(callback) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback)
  } else {
    return setTimeout(callback, 1)
  }
}

/**
 * 批量处理函数
 * @param items 要处理的项
 * @param fn 处理函数
 * @param batchSize 每批数量
 */
export async function batchProcess(items, fn, batchSize = 10) {
  const results = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(fn))
    results.push(...batchResults)

    // 让出主线程
    await new Promise(resolve => requestIdleCallbackCompat(resolve))
  }

  return results
}
