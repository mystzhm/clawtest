<template>
  <div class="max-w-4xl mx-auto">
    <div class="card">
      <!-- 头部 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">消息中心</h1>
        <div class="flex items-center space-x-3">
          <button
            v-if="unreadCount > 0"
            @click="markAllRead"
            class="text-sm text-zhihu-blue hover:underline"
          >
            全部已读
          </button>
          <button
            @click="clearAllNotifications"
            class="text-sm text-gray-500 hover:text-red-500"
          >
            清空
          </button>
        </div>
      </div>

      <!-- Tab 切换 -->
      <div class="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
            activeTab === tab.key
              ? 'bg-white dark:bg-gray-800 text-zhihu-blue shadow-sm'
              : 'text-gray-600 dark:text-gray-300'
          ]"
        >
          {{ tab.label }}
          <span v-if="getTabCount(tab.key) > 0" class="ml-1 text-gray-400">
            {{ getTabCount(tab.key) }}
          </span>
        </button>
      </div>

      <!-- 通知列表 -->
      <div>
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          :class="[
            'flex items-start space-x-3 py-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0',
            !notification.read ? 'bg-blue-50/30' : ''
          ]"
        >
          <!-- 类型图标 -->
          <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
            {{ notification.icon }}
          </div>

          <!-- 通知内容 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div>
                <p
                  :class="[
                    'text-sm',
                    notification.read ? 'text-gray-600' : 'text-gray-900 dark:text-white font-medium'
                  ]"
                >
                  <template v-if="notification.type === 'follow'">
                    {{ notification.fromUsername }} 关注了你
                  </template>
                  <template v-else-if="notification.type === 'comment'">
                    {{ notification.fromUsername }} 评论了你的回答
                    <span class="text-gray-500">「{{ notification.targetPreview }}...」</span>
                  </template>
                  <template v-else-if="notification.type === 'like'">
                    {{ notification.fromUsername }} 赞了你的{{ notification.targetType === 'answer' ? '回答' : notification.targetType === 'comment' ? '评论' : '内容' }}
                  </template>
                  <template v-else-if="notification.type === 'mention'">
                    {{ notification.fromUsername }} 在{{ notification.targetTitle }}中@了你
                  </template>
                  <template v-else-if="notification.type === 'invite'">
                    {{ notification.fromUsername }} 邀请你回答「{{ notification.targetTitle }}」
                  </template>
                  <template v-else>
                    {{ notification.targetTitle || '系统通知' }}
                  </template>
                </p>
                <!-- 回复内容预览 -->
                <p v-if="notification.replyContent" class="text-xs text-gray-500 mt-1 line-clamp-2">
                  回复：{{ notification.replyContent }}
                </p>
              </div>
              <!-- 未读标记 -->
              <span v-if="!notification.read" class="w-2 h-2 bg-zhihu-blue rounded-full flex-shrink-0 mt-2"></span>
            </div>
            <!-- 操作按钮 -->
            <div class="flex space-x-2">
              <button
                @click.stop="markAsRead(notification.id)"
                class="text-xs text-gray-400 hover:text-zhihu-blue"
              >
                标为已读
              </button>
              <button
                @click.stop="deleteNotification(notification.id)"
                class="text-xs text-gray-400 hover:text-red-500"
              >
                删除
              </button>
            </div>
          </div>
          <!-- 相关内容 -->
          <div class="mt-2 ml-13 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
            <router-link
              v-if="notification.targetType === 'answer'"
              :to="`/question/${notification.targetId}`"
              class="block hover:text-zhihu-blue"
            >
              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                {{ notification.targetTitle }}
              </p>
            </router-link>
            <router-link
              v-if="notification.targetType === 'article'"
              :to="`/article/${notification.targetId}`"
              class="block hover:text-zhihu-blue"
            >
              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                {{ notification.targetTitle }}
              </p>
            </router-link>
          </div>
          <!-- 时间 -->
          <div class="ml-13 mt-2">
            <p class="text-xs text-gray-400">
              {{ formatFullDate(notification.createdAt) }}
            </p>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredNotifications.length === 0" class="py-16 text-center text-gray-400">
          <svg class="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414-2.414a1 1 0 01-.707.293l-2.414-2.414A1 1 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <p class="text-gray-400 mb-2">暂无通知</p>
          <p class="text-sm text-gray-300">收到互动时，会在这里显示</p>
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

const allNotifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') {
    return allNotifications.value
  }
  return notificationStore.notificationsByType[activeTab.value] || []
})

function getTabCount(tabKey) {
  if (tabKey === 'all') {
    return unreadCount.value
  }
  const typeNotifications = notificationStore.notificationsByType[tabKey] || []
  return typeNotifications.filter(n => !n.read).length
}

function handleNotificationClick(notification) {
  notificationStore.markAsRead(notification.id)

  // 跳转到相关页面
  if (notification.targetType === 'question') {
    router.push(`/question/${notification.targetId}`)
  } else if (notification.targetType === 'answer') {
    router.push(`/question/${notification.targetId}`)
  } else if (notification.targetType === 'article') {
    router.push(`/article/${notification.targetId}`)
  } else if (notification.type === 'follow') {
    router.push(`/user/${notification.fromUserId}`)
  }
}

function markAsRead(id) {
  notificationStore.markAsRead(id)
}

function deleteNotification(id) {
  if (confirm('确定要删除这条通知吗？')) {
    notificationStore.deleteNotification(id)
  }
}

function markAllRead() {
  notificationStore.markAllAsRead()
}

function clearAllNotifications() {
  if (confirm('确定要清空所有通知吗？')) {
    notificationStore.clearAllNotifications()
  }
}

function formatFullDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes} 分钟前`
  } else if (hours < 24) {
    return `${hours} 小时前`
  } else if (days < 7) {
    return `${days} 天前`
  } else if (days < 30) {
    const date = new Date(date)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
