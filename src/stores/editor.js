import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  // 草稿存储
  const drafts = ref(JSON.parse(localStorage.getItem('editorDrafts') || '{}'))

  function getCurrentUserId() {
    return JSON.parse(localStorage.getItem('currentUser'))?.id || 'anonymous'
  }

  // 保存草稿
  function saveDraft(key, content) {
    drafts.value[key] = {
      content,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem('editorDrafts', JSON.stringify(drafts.value))
  }

  // 获取草稿
  function getDraft(key) {
    return drafts.value[key]?.content || ''
  }

  // 删除草稿
  function deleteDraft(key) {
    delete drafts.value[key]
    localStorage.setItem('editorDrafts', JSON.stringify(drafts.value))
  }

  // 清空所有草稿
  function clearAllDrafts() {
    drafts.value = {}
    localStorage.setItem('editorDrafts', JSON.stringify(drafts.value))
  }

  return {
    drafts,
    saveDraft,
    getDraft,
    deleteDraft,
    clearAllDrafts
  }
})
