<template>
  <div class="max-w-4xl mx-auto">
    <div class="card">
      <!-- 头部 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">通知中心</h1>
        <div class="flex items-center space-x-4">
          <button
            v-if="unreadCount > 0"
            @click="markAllRead"
            class="text-sm text-zhihu-blue hover:underline"
          >
            全部标记已读
          </button>
          <button
            v-if="notifications.length > 0"
            @click="clearAll"
            class="text-sm text-gray-500 hover:text-red-500"
          >
            清空通知
          </button>
        </div>
      </div>

      <!-- Tab 切换 -->
      <div class="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
            activeTab === tab.key
              ? 'bg-white text-zhihu-blue shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ tab.label }}
          <span
            v-if="getTabCount(tab.key) > 0"
            :class="[
              'ml-1 px-1.5 py-0.5 text-xs rounded-full',
              activeTab === tab.key ? 'bg-zhihu-blue text-white' : 'bg-gray-300 text-gray-700'
            ]"
          >
            {{ getTabCount(tab.key) }}
          </span>
        </button>
      </div>

      <!-- 通知列表 -->
      <div v-if="filteredNotifications.length === 0" class="py-16 text-center">
        <svg class="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-gray-400 mb-2">暂无通知</p>
        <p class="text-sm text-gray-300">当有人关注你、评论你的回答时，你会在这里收到通知</p>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          :class="[
            'flex items-start space-x-4 py-4 cursor-pointer transition-colors hover:bg-gray-50 -mx-6 px-6',
            !notification.read ? 'bg-blue-50/30' : ''
          ]"
        >
          <!-- 用户头像 -->
          <img
            v-if="notification.fromAvatar"
            :src="notification.fromAvatar"
            class="w-12 h-12 rounded-full flex-shrink-0"
          />
          <div
            v-else
            class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xl"
          >
            {{ notificationStore.getNotificationIcon(notification.type) }}
          </div>

          <!-- 通知内容 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div>
                <p
                  :class="[
                    'text-base',
                    notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                  ]"
                >
                  {{ notificationStore.getNotificationText(notification) }}
                </p>
                <!-- 内容预览 -->
                <p v-if="notification.targetPreview" class="text-sm text-gray-400 mt-1 line-clamp-2">
                  {{ notification.targetPreview }}...
                </p>
              </div>
              <!-- 未读标记 -->
              <span v-if="!notification.read" class="w-2.5 h-2.5 bg-zhihu-blue rounded-full flex-shrink-0 mt-2"></span>
            </div>
            <div class="flex items-center space-x-4 mt-2">
              <span class="text-xs text-gray-400">{{ formatDate(notification.createdAt) }}</span>
              <button
                @click.stop="deleteNotification(notification.id)"
                class="text-xs text-gray-400 hover:text-red-500"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notification'

const router = useRouter()
const notificationStore = useNotificationStore()

const activeTab = ref('all')

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'follow', label: '关注' },
  { key: 'comment', label: '评论' },
  { key: 'like', label: '赞' },
  { key: 'mention', label: '@我' },
  { key: 'invite', label: '邀请' }
]

const notifications = computed(() => notificationStore.myNotifications)
const unreadCount = computed(() => notificationStore.unreadCount)

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') {
    return notifications.value
  }
  return notificationStore.notificationsByType[activeTab.value] || []
})

function getTabCount(tabKey) {
  if (tabKey === 'all') {
    return notificationStore.unreadCount
  }
  const typeNotifications = notificationStore.notificationsByType[tabKey] || []
  return typeNotifications.filter(n => !n.read).length
}

function handleNotificationClick(notification) {
  notificationStore.markAsRead(notification.id)

  if (notification.targetType === 'question') {
    router.push(`/question/${notification.targetId}`)
  } else if (notification.targetType === 'answer') {
    router.push(`/question/${notification.targetId}`)
  } else if (notification.type === 'follow') {
    router.push(`/user/${notification.fromUserId}`)
  }
}

function markAllRead() {
  notificationStore.markAllAsRead()
}

function clearAll() {
  if (confirm('确定要清空所有通知吗？')) {
    notificationStore.clearAllNotifications()
  }
}

function deleteNotification(id) {
  notificationStore.deleteNotification(id)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${days} 天前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
