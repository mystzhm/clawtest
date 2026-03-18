import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  // 通知列表
  const notifications = ref(JSON.parse(localStorage.getItem('notifications') || '[]'))

  // 通知类型
  const NOTIFICATION_TYPES = {
    FOLLOW: 'follow',       // 有人关注了你
    COMMENT: 'comment',     // 有人评论了你的回答
    LIKE: 'like',           // 有人赞了你的回答或评论
    MENTION: 'mention',     // 有人@了你
    SYSTEM: 'system',       // 系统通知
    INVITE: 'invite'        // 有人邀请你回答
  }

  // 获取当前用户 ID
  function getCurrentUserId() {
    return JSON.parse(localStorage.getItem('currentUser'))?.id || 'anonymous'
  }

  // 创建通知
  function createNotification(type, data) {
    const notification = {
      id: Date.now().toString(),
      type,
      userId: data.userId, // 接收通知的用户
      fromUserId: data.fromUserId, // 触发通知的用户
      fromUsername: data.fromUsername,
      fromAvatar: data.fromAvatar,
      // 相关内容
      targetType: data.targetType, // 'question' | 'answer' | 'comment'
      targetId: data.targetId,
      targetTitle: data.targetTitle, // 问题标题或回答摘要
      targetPreview: data.targetPreview, // 内容预览
      // 状态
      read: false,
      createdAt: new Date().toISOString()
    }

    notifications.value.unshift(notification)
    saveNotifications()
    return notification
  }

  // 保存到 localStorage
  function saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(notifications.value))
  }

  // 获取当前用户的通知
  const myNotifications = computed(() => {
    const userId = getCurrentUserId()
    return notifications.value.filter(n => n.userId === userId)
  })

  // 未读通知数量
  const unreadCount = computed(() => {
    return myNotifications.value.filter(n => !n.read).length
  })

  // 按类型分组的通知
  const notificationsByType = computed(() => {
    const groups = {
      follow: [],
      comment: [],
      like: [],
      mention: [],
      system: [],
      invite: []
    }

    myNotifications.value.forEach(n => {
      if (groups[n.type]) {
        groups[n.type].push(n)
      }
    })

    return groups
  })

  // 标记为已读
  function markAsRead(notificationId) {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      saveNotifications()
    }
  }

  // 全部标记为已读
  function markAllAsRead() {
    const userId = getCurrentUserId()
    notifications.value.forEach(n => {
      if (n.userId === userId) {
        n.read = true
      }
    })
    saveNotifications()
  }

  // 删除通知
  function deleteNotification(notificationId) {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      notifications.value.splice(index, 1)
      saveNotifications()
    }
  }

  // 清空所有通知
  function clearAllNotifications() {
    const userId = getCurrentUserId()
    notifications.value = notifications.value.filter(n => n.userId !== userId)
    saveNotifications()
  }

  // 便捷方法：创建关注通知
  function notifyFollow(targetUserId, fromUser) {
    return createNotification(NOTIFICATION_TYPES.FOLLOW, {
      userId: targetUserId,
      fromUserId: fromUser.id,
      fromUsername: fromUser.username,
      fromAvatar: fromUser.avatar,
      targetType: 'user',
      targetId: fromUser.id,
      targetTitle: `${fromUser.username} 关注了你`
    })
  }

  // 便捷方法：创建评论通知
  function notifyComment(targetUserId, fromUser, answer, question) {
    return createNotification(NOTIFICATION_TYPES.COMMENT, {
      userId: targetUserId,
      fromUserId: fromUser.id,
      fromUsername: fromUser.username,
      fromAvatar: fromUser.avatar,
      targetType: 'answer',
      targetId: answer.id,
      targetTitle: question.title,
      targetPreview: answer.content.slice(0, 50)
    })
  }

  // 便捷方法：创建点赞通知
  function notifyLike(targetUserId, fromUser, targetType, target, question) {
    return createNotification(NOTIFICATION_TYPES.LIKE, {
      userId: targetUserId,
      fromUserId: fromUser.id,
      fromUsername: fromUser.username,
      fromAvatar: fromUser.avatar,
      targetType,
      targetId: target.id,
      targetTitle: question?.title || '你的回答',
      targetPreview: target.content?.slice(0, 50)
    })
  }

  // 便捷方法：创建邀请回答通知
  function notifyInvite(targetUserId, fromUser, question) {
    return createNotification(NOTIFICATION_TYPES.INVITE, {
      userId: targetUserId,
      fromUserId: fromUser.id,
      fromUsername: fromUser.username,
      fromAvatar: fromUser.avatar,
      targetType: 'question',
      targetId: question.id,
      targetTitle: question.title
    })
  }

  // 便捷方法：创建@通知
  function notifyMention(targetUserId, fromUser, targetType, target, question) {
    return createNotification(NOTIFICATION_TYPES.MENTION, {
      userId: targetUserId,
      fromUserId: fromUser.id,
      fromUsername: fromUser.username,
      fromAvatar: fromUser.avatar,
      targetType,
      targetId: target.id,
      targetTitle: question?.title,
      targetPreview: target.content?.slice(0, 50)
    })
  }

  // 获取通知图标
  function getNotificationIcon(type) {
    const icons = {
      follow: '👤',
      comment: '💬',
      like: '👍',
      mention: '@',
      system: '🔔',
      invite: '✉️'
    }
    return icons[type] || '🔔'
  }

  // 获取通知文案
  function getNotificationText(notification) {
    const from = notification.fromUsername || '有人'
    const preview = notification.targetPreview ? `「${notification.targetPreview}...」` : ''

    switch (notification.type) {
      case 'follow':
        return `${from} 关注了你`
      case 'comment':
        return `${from} 评论了你在「${notification.targetTitle}」下的回答`
      case 'like':
        return `${from} 赞了你在「${notification.targetTitle}」下的回答`
      case 'mention':
        return `${from} 在「${notification.targetTitle}」中@了你`
      case 'invite':
        return `${from} 邀请你回答「${notification.targetTitle}」`
      case 'system':
        return notification.targetTitle
      default:
        return '新通知'
    }
  }

  return {
    notifications,
    myNotifications,
    unreadCount,
    notificationsByType,
    NOTIFICATION_TYPES,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    notifyFollow,
    notifyComment,
    notifyLike,
    notifyInvite,
    notifyMention,
    getNotificationIcon,
    getNotificationText
  }
})
