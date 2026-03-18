<template>
  <div class="max-w-4xl mx-auto">
    <div class="card">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">私信</h1>

      <!-- 会话列表 -->
      <div v-if="myConversations.length > 0" class="divide-y divide-gray-100 dark:divide-gray-700">
        <div
          v-for="conversation in myConversations"
          :key="conversation.id"
          @click="openConversation(conversation)"
          class="flex items-center space-x-3 py-4 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        >
          <img
            :src="getOtherUser(conversation.otherUserId)?.avatar"
            class="w-12 h-12 rounded-full"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ getOtherUser(conversation.otherUserId)?.username }}
              </h3>
              <span class="text-xs text-gray-400">{{ formatDate(conversation.lastMessageTime) }}</span>
            </div>
            <p class="text-sm text-gray-500 truncate mt-1">
              {{ conversation.lastMessage }}
            </p>
          </div>
          <div v-if="conversation.unreadCount > 0" class="flex-shrink-0">
            <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {{ conversation.unreadCount }}
            </span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="py-16 text-center">
        <svg class="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="text-gray-400 mb-2">暂无私信</p>
        <p class="text-sm text-gray-300">去用户主页发起私信吧</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageStore } from '../stores/message'
import { useUserStore } from '../stores/user'

const router = useRouter()
const messageStore = useMessageStore()
const userStore = useUserStore()

const myConversations = computed(() => messageStore.myConversations)

function getOtherUser(userId) {
  return userStore.getUserById(userId)
}

function openConversation(conversation) {
  router.push(`/message/${conversation.otherUserId}`)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 1 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>
