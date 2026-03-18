<template>
  <div class="comment-section mt-4 border-t border-gray-100 pt-4">
    <!-- 评论入口 -->
    <div class="flex items-center justify-between mb-4">
      <button
        @click="toggleComments"
        class="flex items-center space-x-2 text-gray-500 hover:text-zhihu-blue transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>{{ totalCount }} 条评论</span>
        <svg
          class="w-4 h-4 transition-transform"
          :class="{ 'rotate-180': showComments }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- 排序切换 -->
      <div v-if="showComments && comments.length > 0" class="flex items-center space-x-2 text-sm">
        <button
          @click="sortBy = 'time'"
          :class="sortBy === 'time' ? 'text-zhihu-blue font-medium' : 'text-gray-500 hover:text-gray-700'"
        >
          按时间
        </button>
        <span class="text-gray-300">|</span>
        <button
          @click="sortBy = 'hot'"
          :class="sortBy === 'hot' ? 'text-zhihu-blue font-medium' : 'text-gray-500 hover:text-gray-700'"
        >
          按热度
        </button>
      </div>
    </div>

    <!-- 评论列表 -->
    <div v-if="showComments" class="space-y-4">
      <!-- 写评论 -->
      <div v-if="userStore.isLoggedIn" class="flex space-x-3">
        <img :src="userStore.currentUser?.avatar" class="w-8 h-8 rounded-full" />
        <div class="flex-1">
          <textarea
            v-model="newComment"
            rows="2"
            :placeholder="replyTarget ? `回复 ${replyTarget.username}...` : '写下你的评论...'"
            class="input-field text-sm"
            @keydown.ctrl.enter="submitComment"
          ></textarea>
          <div class="flex items-center justify-between mt-2">
            <span v-if="replyTarget" class="text-sm text-gray-500">
              回复 <span class="text-zhihu-blue">@{{ replyTarget.username }}</span>
              <button @click="cancelReply" class="ml-2 text-gray-400 hover:text-gray-600">×</button>
            </span>
            <span v-else class="text-xs text-gray-400">Ctrl + Enter 发送</span>
            <button
              @click="submitComment"
              :disabled="!newComment.trim()"
              class="btn-primary text-sm px-4 py-1.5"
            >
              发送
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-sm text-gray-500 py-2">
        <router-link to="/login" class="text-zhihu-blue hover:underline">登录</router-link> 后参与评论
      </div>

      <!-- 评论项 -->
      <div v-if="comments.length > 0" class="divide-y divide-gray-100">
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :answer-id="answerId"
          @reply="handleReply"
          @delete="handleDelete"
        />
      </div>

      <div v-else class="text-center text-sm text-gray-400 py-4">
        暂无评论，来抢沙发吧~
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuestionStore } from '../../stores/question'
import { useUserStore } from '../../stores/user'
import CommentItem from './CommentItem.vue'

const props = defineProps({
  answerId: {
    type: String,
    required: true
  }
})

const questionStore = useQuestionStore()
const userStore = useUserStore()

const showComments = ref(false)
const sortBy = ref('time')
const newComment = ref('')
const replyTarget = ref(null) // { commentId, userId, username }

const totalCount = computed(() => {
  return questionStore.getCommentCount(props.answerId)
})

const comments = computed(() => {
  return questionStore.getCommentsByAnswerId(props.answerId, sortBy.value)
})

function toggleComments() {
  showComments.value = !showComments.value
}

function handleReply(comment) {
  replyTarget.value = {
    commentId: comment.id,
    userId: comment.authorId,
    username: comment.authorUsername || '用户'
  }
}

function cancelReply() {
  replyTarget.value = null
}

function submitComment() {
  if (!newComment.value.trim()) return

  questionStore.createComment(
    props.answerId,
    newComment.value,
    replyTarget.value?.commentId || null,
    replyTarget.value?.userId || null
  )

  newComment.value = ''
  replyTarget.value = null
}

function handleDelete(commentId) {
  questionStore.deleteComment(commentId)
}

// 监听排序变化
watch(sortBy, () => {
  // 重新加载评论
})
</script>
