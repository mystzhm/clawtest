/**
 * 重置所有数据到初始状态
 * 在浏览器控制台运行: resetAllData()
 */
export function resetAllData() {
  // 清除所有数据
  localStorage.removeItem('users')
  localStorage.removeItem('questions')
  localStorage.removeItem('answers')
  localStorage.removeItem('comments')
  localStorage.removeItem('userRatings')
  localStorage.removeItem('currentUser')
  localStorage.removeItem('seedDataInitialized')
  
  console.log('数据已清除，刷新页面将重新初始化种子数据')
  
  // 刷新页面
  window.location.reload()
}

// 暴露到全局
if (typeof window !== 'undefined') {
  window.resetAllData = resetAllData
}
