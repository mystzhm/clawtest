import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useInviteStore = defineStore('invite', () => {
  // 邀请列表
  const invites = ref(JSON.parse(localStorage.getItem('invites') || '[]'))

  function getCurrentUserId() {
    return JSON.parse(localStorage.getItem('currentUser'))?.id || 'anonymous'
  }

  // 创建邀请
  function createInvite(questionId, fromUserId, toUserId, questionTitle) {
    const invite = {
      id: Date.now().toString(),
      questionId,
      fromUserId,
      toUserId,
      questionTitle,
      status: 'pending', // pending | accepted | declined
      createdAt: new Date().toISOString()
    }

    invites.value.push(invite)
    saveInvites()

    // 创建通知
    createInviteNotification(toUserId, fromUserId, questionId, questionTitle)

    return invite
  }

  // 接受邀请
  function acceptInvite(inviteId) {
    const invite = invites.value.find(i => i.id === inviteId)
    if (invite) {
      invite.status = 'accepted'
      invite.respondedAt = new Date().toISOString()
      saveInvites()
      return true
    }
    return false
  }

  // 拒绝邀请
  function declineInvite(inviteId) {
    const invite = invites.value.find(i => i.id === inviteId)
    if (invite) {
      invite.status = 'declined'
      invite.respondedAt = new Date().toISOString()
      saveInvites()
      return true
    }
    return false
  }

  // 获取用户的邀请列表（收到的邀请）
  const myInvites = computed(() => {
    const userId = getCurrentUserId()
    return invites.value.filter(i => i.toUserId === userId && i.status === 'pending')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })

  // 获取我发出的邀请
  const mySentInvites = computed(() => {
    const userId = getCurrentUserId()
    return invites.value.filter(i => i.fromUserId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })

  // 检查是否已邀请
  function isInvited(questionId, toUserId) {
    return invites.value.some(
      i => i.questionId === questionId &&
           i.toUserId === toUserId &&
           i.status === 'pending'
    )
  }

  // 获取问题的邀请列表
  function getInvitesByQuestionId(questionId) {
    return invites.value.filter(i => i.questionId === questionId)
  }

  // 保存邀请数据
  function saveInvites() {
    localStorage.setItem('invites', JSON.stringify(invites.value))
  }

  // 创建邀请通知
  function createInviteNotification(toUserId, fromUserId, questionId, questionTitle) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const fromUser = users.find(u => u.id === fromUserId)

    notifications.unshift({
      id: Date.now().toString(),
      type: 'invite',
      userId: toUserId,
      fromUserId: fromUserId,
      fromUsername: fromUser?.username || '匿名用户',
      fromAvatar: fromUser?.avatar || '',
      targetType: 'question',
      targetId: questionId,
      targetTitle: questionTitle,
      targetPreview: '',
      read: false,
      createdAt: new Date().toISOString()
    })

    localStorage.setItem('notifications', JSON.stringify(notifications))
  }

  return {
    invites,
    myInvites,
    mySentInvites,
    createInvite,
    acceptInvite,
    declineInvite,
    isInvited,
    getInvitesByQuestionId
  }
})
