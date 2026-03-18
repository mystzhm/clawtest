import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { escapeHtml } from '../utils/security'

export const useMessageStore = defineStore('message', () => {
  // 私信会话列表
  const conversations = ref(JSON.parse(localStorage.getItem('conversations') || '[]'))
  // 私信消息列表
  const messages = ref(JSON.parse(localStorage.getItem('privateMessages') || '[]'))

  function getCurrentUserId() {
    return JSON.parse(localStorage.getItem('currentUser'))?.id || 'anonymous'
  }

  // 获取或创建会话
  function getOrCreateConversation(userId) {
    const currentUserId = getCurrentUserId()
    if (!currentUserId || currentUserId === userId) return null

    // 查找现有会话
    let conversation = conversations.value.find(
      c => (c.userId1 === currentUserId && c.userId2 === userId) ||
           (c.userId1 === userId && c.userId2 === currentUserId)
    )

    if (!conversation) {
      // 创建新会话
      conversation = {
        id: Date.now().toString(),
        userId1: currentUserId,
        userId2: userId,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount1: 0, // userId1 的未读数
        unreadCount2: 0  // userId2 的未读数
      }
      conversations.value.push(conversation)
      saveConversations()
    }

    return conversation
  }

  // 发送私信
  function sendMessage(toUserId, content) {
    const currentUserId = getCurrentUserId()
    if (!currentUserId || !content.trim()) return null

    const conversation = getOrCreateConversation(toUserId)
    if (!conversation) return null

    const message = {
      id: Date.now().toString(),
      conversationId: conversation.id,
      fromUserId: currentUserId,
      toUserId: toUserId,
      content: escapeHtml(content.trim().slice(0, 5000)),
      read: false,
      createdAt: new Date().toISOString()
    }

    messages.value.push(message)

    // 更新会话
    conversation.lastMessage = message.content.slice(0, 100)
    conversation.lastMessageTime = message.createdAt

    // 增加接收者的未读数
    if (conversation.userId1 === toUserId) {
      conversation.unreadCount1++
    } else {
      conversation.unreadCount2++
    }

    saveMessages()
    saveConversations()

    return message
  }

  // 获取会话的消息列表
  function getMessagesByConversation(conversationId) {
    return messages.value
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  // 标记会话消息为已读
  function markConversationAsRead(conversationId) {
    const currentUserId = getCurrentUserId()
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (!conversation) return

    // 标记消息已读
    messages.value.forEach(m => {
      if (m.conversationId === conversationId && m.toUserId === currentUserId) {
        m.read = true
      }
    })

    // 清除未读数
    if (conversation.userId1 === currentUserId) {
      conversation.unreadCount1 = 0
    } else {
      conversation.unreadCount2 = 0
    }

    saveMessages()
    saveConversations()
  }

  // 获取我的会话列表
  const myConversations = computed(() => {
    const currentUserId = getCurrentUserId()
    return conversations.value
      .filter(c => c.userId1 === currentUserId || c.userId2 === currentUserId)
      .map(c => {
        const otherUserId = c.userId1 === currentUserId ? c.userId2 : c.userId1
        const unreadCount = c.userId1 === currentUserId ? c.unreadCount1 : c.unreadCount2
        return {
          ...c,
          otherUserId,
          unreadCount
        }
      })
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
  })

  // 总未读消息数
  const totalUnreadCount = computed(() => {
    return myConversations.value.reduce((sum, c) => sum + c.unreadCount, 0)
  })

  // 删除会话
  function deleteConversation(conversationId) {
    const index = conversations.value.findIndex(c => c.id === conversationId)
    if (index === -1) return false

    conversations.value.splice(index, 1)
    messages.value = messages.value.filter(m => m.conversationId !== conversationId)

    saveConversations()
    saveMessages()
    return true
  }

  // 保存数据
  function saveConversations() {
    localStorage.setItem('conversations', JSON.stringify(conversations.value))
  }

  function saveMessages() {
    localStorage.setItem('privateMessages', JSON.stringify(messages.value))
  }

  return {
    conversations,
    messages,
    myConversations,
    totalUnreadCount,
    getOrCreateConversation,
    sendMessage,
    getMessagesByConversation,
    markConversationAsRead,
    deleteConversation
  }
})
