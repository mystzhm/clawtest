<template>
  <div class="notification-bell relative">
    <!-- 铃铛按钮 -->
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-500 hover:text-zhihu-blue transition-colors rounded-full hover:bg-gray-100"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <!-- 未读红点 -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- 下拉面板 -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showDropdown"
        class="notification-dropdown absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
      >
        <!-- 头部 -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 class="font-bold text-gray-900">通知</h3>
          <div class="flex items-center space-x-3">
            <button
              v-if="unreadCount > 0"
              @click="markAllRead"
              class="text-xs text-zhihu-blue hover:underline"
            >
              全部已读
            </button>
            <router-link
              to="/notifications"
              class="text-xs text-gray-500 hover:text-zhihu-blue"
              @click="showDropdown = false"
            >
              查看全部
            </router-link>
          </div>
        </div>

        <!-- Tab 切换 -->
        <div class="flex border-b border-gray-100">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'flex-1 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'text-zhihu-blue border-b-2 border-zhihu-blue'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            {{ tab.label }}
            <span
              v-if="getTabCount(tab.key) > 0"
              :class="[
                'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                activeTab === tab.key ? 'bg-zhihu-blue text-white' : 'bg-gray-200 text-gray-600'
              ]"
            >
              {{ getTabCount(tab.key) }}
            </span>
          </button>
        </div>

        <!-- 通知列表 -->
        <div class="max-h-96 overflow-y-auto">
          <div v-if="filteredNotifications.length === 0" class="py-8 text-center text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-sm">暂无通知</p>
          </div>

          <div v-else>
            <div
              v-for="notification in filteredNotifications"
              :key="notification.id"
              @click="handleNotificationClick(notification)"
              :class="[
                'flex items-start space-x-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50',
                !notification.read ? 'bg-blue-50/50' : ''
              ]"
            >
              <!-- 用户头像 -->
              <img
                v-if="notification.fromAvatar"
                :src="notification.fromAvatar"
                class="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div
                v-else
                class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"
              >
                {{ notificationStore.getNotificationIcon(notification.type) }}
              </div>

              <!-- 通知内容 -->
              <div class="flex-1 min-w-0">
                <p
                  :class="[
                    'text-sm',
                    notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                  ]"
                >
                  {{ notificationStore.getNotificationText(notification) }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ formatDate(notification.createdAt) }}
                </p>
              </div>

              <!-- 未读标记 -->
              <span v-if="!notification.read" class="w-2 h-2 bg-zhihu-blue rounded-full flex-shrink-0 mt-2"></span>
            </div>
          </div>
        </div>

        <!-- 底部 -->
        <div v-if="notifications.length > 0" class="px-4 py-2 border-t border-gray-100 bg-gray-50">
          <button
            @click="clearAll"
            class="text-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            清空所有通知
          </button>
        </div>
      </div>
    </transition>

    <!-- 点击外部关闭 -->
    <div
      v-if="showDropdown"
      class="fixed inset-0 z-40"
      @click="showDropdown = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../../stores/notification'

const router = useRouter()
const notificationStore = useNotificationStore()

const showDropdown = ref(false)
const activeTab = ref('all')

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'follow', label: '关注' },
  { key: 'comment', label: '评论' },
  { key: 'like', label: '赞' }
]

const notifications = computed(() => notificationStore.myNotifications)
const unreadCount = computed(() => notificationStore.unreadCount)

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') {
    return notifications.value.slice(0, 10)
  }
  return notificationStore.notificationsByType[activeTab.value]?.slice(0, 10) || []
})

function getTabCount(tabKey) {
  if (tabKey === 'all') {
    return notificationStore.unreadCount
  }
  const typeNotifications = notificationStore.notificationsByType[tabKey] || []
  return typeNotifications.filter(n => !n.read).length
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleNotificationClick(notification) {
  // 标记为已读
  notificationStore.markAsRead(notification.id)
  showDropdown.value = false

  // 跳转到相关页面
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
  return date.toLocaleDateString('zh-CN')
}

// ESC 关闭
function handleEsc(e) {
  if (e.key === 'Escape' && showDropdown.value) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEsc)
})
</script>
