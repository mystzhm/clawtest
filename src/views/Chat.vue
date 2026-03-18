<template>
  <div class="max-w-4xl mx-auto">
    <div class="card">
      <!-- 头部 -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
        <div class="flex items-center space-x-3">
          <router-link to="/messages" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <router-link :to="`/user/${otherUser?.id}`">
            <img :src="otherUser?.avatar" class="w-10 h-10 rounded-full" />
          </router-link>
          <div>
            <router-link :to="`/user/${otherUser?.id}`" class="font-bold text-gray-900 dark:text-white hover:text-zhihu-blue">
              {{ otherUser?.username }}
            </router-link>
            <p class="text-xs text-gray-400">{{ otherUser?.bio || '这个人很懒' }}</p>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div ref="messagesContainer" class="py-4 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
        <div
          v-for="message in messagesList"
          :key="message.id"
          :class="[
            'flex',
            message.fromUserId === currentUserId ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'max-w-[70%] rounded-lg px-4 py-2',
              message.fromUserId === currentUserId
                ? 'bg-zhihu-blue text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            ]"
          >
            <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
            <p
              :class="[
                'text-xs mt-1',
                message.fromUserId === currentUserId ? 'text-blue-100' : 'text-gray-400'
              ]"
            >
              {{ formatDate(message.createdAt) }}
            </p>
          </div>
        </div>

        <div v-if="messagesList.length === 0" class="py-16 text-center text-gray-400">
          发送第一条消息，开始聊天吧
        </div>
      </div>

      <!-- 输入框 -->
      <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
        <div class="flex space-x-3">
          <textarea
            v-model="newMessage"
            @keydown.ctrl.enter="send"
            @keydown.meta.enter="send"
            rows="2"
            placeholder="输入消息... (Ctrl + Enter 发送)"
            class="input-field flex-1"
          ></textarea>
          <button
            @click="send"
            :disabled="!newMessage.trim()"
            class="btn-primary self-end"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useMessageStore } from '../stores/message'
import { useUserStore } from '../stores/user'

const route = useRoute()
const messageStore = useMessageStore()
const userStore = useUserStore()

const messagesContainer = ref(null)
const newMessage = ref('')

const otherUserId = computed(() => route.params.userId)
const otherUser = computed(() => userStore.getUserById(otherUserId.value))
const currentUserId = computed(() => userStore.currentUser?.id)

const conversation = computed(() => {
  return messageStore.getOrCreateConversation(otherUserId.value)
})

const messagesList = computed(() => {
  if (!conversation.value) return []
  return messageStore.getMessagesByConversation(conversation.value.id)
})

onMounted(() => {
  // 标记已读
  if (conversation.value) {
    messageStore.markConversationAsRead(conversation.value.id)
  }
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
})

function send() {
  if (!newMessage.value.trim()) return

  messageStore.sendMessage(otherUserId.value, newMessage.value)
  newMessage.value = ''

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>
