<template>
  <div class="comment-item py-3">
    <!-- 一级评论 -->
    <div class="flex space-x-3">
      <router-link :to="`/user/${author?.id}`">
        <img :src="author?.avatar" class="w-8 h-8 rounded-full" />
      </router-link>
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2">
          <router-link :to="`/user/${author?.id}`" class="font-medium text-sm text-gray-900 hover:text-zhihu-blue">
            {{ author?.username }}
          </router-link>
          <span class="text-xs text-gray-400">{{ formatDate(comment.createdAt) }}</span>
        </div>
        <p class="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">{{ comment.content }}</p>

        <!-- 操作按钮 -->
        <div class="flex items-center space-x-4 mt-2">
          <button
            @click="handleLike"
            :class="[
              'flex items-center space-x-1 text-xs transition-colors',
              myRating === 'like' ? 'text-zhihu-blue' : 'text-gray-400 hover:text-zhihu-blue'
            ]"
          >
            <svg class="w-4 h-4" :fill="myRating === 'like' ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span v-if="comment.likes > 0">{{ comment.likes }}</span>
          </button>
          <button
            @click="handleReply"
            class="flex items-center space-x-1 text-xs text-gray-400 hover:text-zhihu-blue transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span>回复</span>
          </button>
          <button
            v-if="isAuthor"
            @click="handleDelete"
            class="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            删除
          </button>
        </div>

        <!-- 嵌套回复 -->
        <div v-if="replies.length > 0" class="mt-3 ml-2 pl-3 border-l-2 border-gray-100 space-y-3">
          <div v-for="reply in replies" :key="reply.id" class="flex space-x-2">
            <router-link :to="`/user/${getReplyAuthor(reply)?.id}`">
              <img :src="getReplyAuthor(reply)?.avatar" class="w-6 h-6 rounded-full" />
            </router-link>
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 flex-wrap">
                <router-link :to="`/user/${getReplyAuthor(reply)?.id}`" class="text-sm font-medium text-gray-900 hover:text-zhihu-blue">
                  {{ getReplyAuthor(reply)?.username }}
                </router-link>
                <span v-if="reply.replyToUserId" class="text-xs text-gray-400">
                  回复
                  <router-link :to="`/user/${reply.replyToUserId}`" class="text-zhihu-blue hover:underline">
                    @{{ getReplyToUser(reply)?.username || '用户' }}
                  </router-link>
                </span>
                <span class="text-xs text-gray-400">{{ formatDate(reply.createdAt) }}</span>
              </div>
              <p class="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap break-words">{{ reply.content }}</p>

              <!-- 回复的操作按钮 -->
              <div class="flex items-center space-x-4 mt-1.5">
                <button
                  @click="handleLikeReply(reply.id)"
                  :class="[
                    'flex items-center space-x-1 text-xs transition-colors',
                    getReplyRating(reply.id) === 'like' ? 'text-zhihu-blue' : 'text-gray-400 hover:text-zhihu-blue'
                  ]"
                >
                  <svg class="w-3.5 h-3.5" :fill="getReplyRating(reply.id) === 'like' ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span v-if="reply.likes > 0">{{ reply.likes }}</span>
                </button>
                <button
                  @click="handleReplyToReply(reply)"
                  class="text-xs text-gray-400 hover:text-zhihu-blue transition-colors"
                >
                  回复
                </button>
                <button
                  v-if="reply.authorId === currentUserId"
                  @click="handleDeleteReply(reply.id)"
                  class="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>

          <!-- 展开更多回复 -->
          <button
            v-if="hasMoreReplies"
            @click="showAllReplies = true"
            class="text-xs text-zhihu-blue hover:underline ml-8"
          >
            查看更多回复
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuestionStore } from '../../stores/question'
import { useUserStore } from '../../stores/user'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  answerId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['reply', 'delete'])

const questionStore = useQuestionStore()
const userStore = useUserStore()

const showAllReplies = ref(false)
const REPLIES_SHOWN = 3

const author = computed(() => {
  return userStore.getUserById(props.comment.authorId)
})

const currentUserId = computed(() => {
  return userStore.currentUser?.id
})

const isAuthor = computed(() => {
  return currentUserId.value === props.comment.authorId
})

const myRating = computed(() => {
  return questionStore.getCommentRating(props.comment.id)
})

const replies = computed(() => {
  const allReplies = questionStore.getRepliesByCommentId(props.comment.id)
  if (showAllReplies.value || allReplies.length <= REPLIES_SHOWN) {
    return allReplies
  }
  return allReplies.slice(0, REPLIES_SHOWN)
})

const hasMoreReplies = computed(() => {
  const allReplies = questionStore.getRepliesByCommentId(props.comment.id)
  return !showAllReplies.value && allReplies.length > REPLIES_SHOWN
})

function getReplyAuthor(reply) {
  return userStore.getUserById(reply.authorId)
}

function getReplyToUser(reply) {
  return userStore.getUserById(reply.replyToUserId)
}

function getReplyRating(replyId) {
  return questionStore.getCommentRating(replyId)
}

function handleLike() {
  questionStore.likeComment(props.comment.id)
}

function handleLikeReply(replyId) {
  questionStore.likeComment(replyId)
}

function handleReply() {
  emit('reply', {
    id: props.comment.id,
    authorId: props.comment.authorId,
    authorUsername: author.value?.username
  })
}

function handleReplyToReply(reply) {
  emit('reply', {
    id: props.comment.id, // 回复挂在一级评论下
    authorId: reply.authorId,
    authorUsername: getReplyAuthor(reply)?.username
  })
}

function handleDelete() {
  emit('delete', props.comment.id)
}

function handleDeleteReply(replyId) {
  questionStore.deleteComment(replyId)
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
</script>
