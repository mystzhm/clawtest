<template>
  <div class="max-w-3xl mx-auto">
    <!-- 发布想法按钮 -->
    <div class="card mb-6">
      <div class="flex items-start space-x-4">
        <img :src="currentUser?.avatar" class="w-10 h-10 rounded-full flex-shrink-0" />
        <div class="flex-1">
          <textarea
            v-model="content"
            @click="showPublishModal = true"
            @keydown.ctrl.enter="publish"
            @keydown.meta.enter="publish"
            placeholder="分享你的想法..."
            class="input-field resize-none min-h-[60px]"
            rows="3"
            maxlength="500"
          ></textarea>
          <div class="flex items-center justify-between mt-2">
            <button
              @click="showPublishModal = true"
              class="flex items-center space-x-2 text-gray-500 hover:text-zhihu-blue"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0l-8-8a2 2 0 012.828 0L6 8m8-8v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1-1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3m-6 0a1 1 0 001 1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3" />
              </svg>
              <span class="text-sm">{{ images.length > 0 ? `${images.length} 张图片` : '添加图片' }}</span>
            </button>
            <button
              @click="content.trim() && publish()"
              :disabled="!content.trim()"
              class="btn-primary text-sm"
            >
              发布
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
      <button
        @click="activeTab = 'all'"
        :class="[
          'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
          activeTab === 'all' ? 'bg-white dark:bg-gray-800 text-zhihu-blue shadow-sm' : 'text-gray-600 dark:text-gray-300'
        ]"
      >
        全部
        <span v-if="allThoughtsCount > 0" class="ml-1 text-xs text-gray-400">
          {{ allThoughtsCount }}
        </span>
      </button>
      <button
        @click="activeTab = 'my'"
        :class="[
          'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
          activeTab === 'my' ? 'bg-white dark:bg-gray-800 text-zhihu-blue shadow-sm' : 'text-gray-600 dark:text-gray-300'
        ]"
      >
        我的
        <span v-if="myThoughtsCount > 0" class="ml-1 text-xs text-gray-400">
          {{ myThoughtsCount }}
        </span>
      </button>
    </div>

    <!-- 想法列表 -->
    <div v-if="filteredThoughts.length > 0" class="space-y-6">
      <div
        v-for="thought in filteredThoughts"
        :key="thought.id"
        class="card"
      >
        <!-- 用户信息 -->
        <div class="flex items-start space-x-3 mb-4">
          <router-link :to="`/user/${thought.authorId}`">
            <img :src="getAuthor(thought.authorId)?.avatar" class="w-10 h-10 rounded-full" />
          </router-link>
          <div class="flex-1">
            <router-link :to="`/user/${thought.authorId}`" class="font-medium text-gray-900 dark:text-white hover:text-zhihu-blue">
              {{ getAuthor(thought.authorId)?.username }}
            </router-link>
            <p class="text-xs text-gray-400">{{ formatDate(thought.createdAt) }}</p>
          </div>
        </div>

        <!-- 想法内容 -->
        <div class="mb-4">
          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ thought.content }}</p>

          <!-- 话题标签 -->
          <div v-if="thought.topic" class="mt-2">
            <router-link
              :to="`/topic/${thought.topicId}`"
              class="text-xs text-zhihu-blue hover:underline"
            >
              #{{ thought.topic }}
            </router-link>
          </div>
        </div>

        <!-- 图片 -->
        <div v-if="thought.images && thought.images.length > 0" class="flex flex-wrap gap-2 mb-4">
          <img
            v-for="(image, index) in thought.images"
            :key="index"
            :src="image"
            class="max-w-full rounded-lg max-h-[300px] object-cover cursor-pointer hover:opacity-90"
            @click="previewImage = image; showImageModal = true"
          />
        </div>

        <!-- 互动按钮 -->
        <div class="flex items-center space-x-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            @click="likeThought(thought.id)"
            :class="[
              'flex items-center space-x-1 transition-colors',
              thoughtStore.getThoughtRating(thought.id) === 'like' ? 'text-zhihu-blue' : 'text-gray-500 hover:text-zhihu-blue'
            ]"
          >
            <svg class="w-5 h-5" :fill="thoughtStore.getThoughtRating(thought.id) === 'like' ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>{{ thought.likes }}</span>
          </button>
          <button
            @click="toggleCommentSection(thought.id)"
            class="flex items-center space-x-1 text-gray-500 hover:text-zhihu-blue transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{{ thought.comments?.length || 0 }}</span>
          </button>
          <ShareButton :url="thoughtUrl(thought.id)" />
        </div>

        <!-- 评论区域 -->
        <div v-if="showCommentSectionId === thought.id" class="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
          <div v-if="currentUser" class="flex space-x-3 mb-4">
            <img :src="currentUser?.avatar" class="w-8 h-8 rounded-full" />
            <div class="flex-1">
              <textarea
                v-model="commentText[thought.id]"
                @keydown.ctrl.enter="submitComment(thought.id)"
                @keydown.meta.enter="submitComment(thought.id)"
                rows="2"
                placeholder="写下你的评论..."
                class="input-field resize-none text-sm"
              ></textarea>
              <div class="flex justify-end mt-2">
                <button
                  @click="submitComment(thought.id)"
                  :disabled="!commentText[thought.id]?.trim()"
                  class="btn-primary text-sm px-3 py-1"
                >
                  发送
                </button>
              </div>
            </div>
          </div>

          <!-- 评论列表 -->
          <div v-if="thought.comments && thought.comments.length > 0" class="space-y-3">
            <div
              v-for="comment in thought.comments"
              :key="comment.id"
              class="flex items-start space-x-2"
            >
              <router-link :to="`/user/${comment.authorId}`">
                <img :src="getAuthor(comment.authorId)?.avatar" class="w-8 h-8 rounded-full" />
              </router-link>
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <router-link :to="`/user/${comment.authorId}`" class="text-sm font-medium text-gray-900 dark:text-white hover:text-zhihu-blue">
                    {{ getAuthor(comment.authorId)?.username }}
                  </router-link>
                  <span class="text-xs text-gray-400">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="py-16 text-center">
      <svg class="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <p class="text-gray-400 mb-2">还没有想法</p>
      <p class="text-sm text-gray-300">分享你的第一个想法吧</p>
    </div>

    <!-- 发布想法弹窗 -->
    <div v-if="showPublishModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">发布想法</h2>
        <textarea
          v-model="content"
          rows="4"
          placeholder="分享你的想法..."
          class="input-field resize-none mb-4"
          maxlength="500"
        ></textarea>
        <div class="flex items-center space-x-4 mb-4">
          <button
            @click="showImageUpload = !showImageUpload"
            class="flex items-center space-x-2 text-gray-500 hover:text-zhihu-blue"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0l-8-8a2 2 0 012.828 0L6 8m8-8v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1-1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3" />
            </svg>
            <span>{{ images.length > 0 ? `${images.length} 张` : '添加图片' }}</span>
          </button>
        </div>
        
        <!-- 图片预览 -->
        <div v-if="images.length > 0" class="flex flex-wrap gap-2 mb-4">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="relative"
          >
            <img :src="image" class="w-20 h-20 rounded-lg object-cover" />
            <button
              @click="removeImage(index)"
              class="absolute top-0 right-0 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
            >
              ×
            </button>
          </div>
        </div>

        <!-- 上传按钮 -->
        <div v-if="showImageUpload" class="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-6 text-center mb-4">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            @change="handleImageUpload"
            class="hidden"
          />
          <button @click="$refs.fileInput.click()" class="text-zhihu-blue hover:underline">
            选择图片
          </button>
          <p class="text-xs text-gray-400 mt-1">支持 JPG、PNG 格式，单张不超过 2MB</p>
        </div>

        <div class="flex justify-end space-x-3">
          <button @click="showPublishModal = false" class="btn-outline">取消</button>
          <button
            @click="publish"
            :disabled="!content.trim()"
            class="btn-primary"
          >
            发布
          </button>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <div v-if="showImageModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showImageModal = false">
      <div @click.stop class="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-4xl w-full mx-4">
        <img :src="previewImage" class="max-w-full rounded-lg" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThoughtStore } from '../stores/thought'
import { useUserStore } from '../stores/user'
import ShareButton from '../components/share/ShareButton.vue'

const route = useRoute()
const thoughtStore = useThoughtStore()
const userStore = useUserStore()

const content = ref('')
const images = ref([])
const commentText = ref({})
const showPublishModal = ref(false)
const showImageUpload = ref(false)
const showImageModal = ref(false)
const previewImage = ref('')
const showCommentSectionId = ref(null)
const fileInput = ref(null)

const activeTab = ref('all')

const currentUser = computed(() => userStore.currentUser)

const allThoughtsCount = computed(() => thoughtStore.allThoughts.length)
const myThoughtsCount = computed(() => thoughtStore.myThoughts.length)

const filteredThoughts = computed(() => {
  if (activeTab.value === 'all') {
    return thoughtStore.allThoughts
  } else {
    return thoughtStore.myThoughts
  }
})

watch(activeTab, () => {
  showCommentSectionId.value = null
})

function getAuthor(userId) {
  return userStore.getUserById(userId)
}

function likeThought(thoughtId) {
  thoughtStore.likeThought(thoughtId)
}

function toggleCommentSection(thoughtId) {
  if (showCommentSectionId.value === thoughtId) {
    showCommentSectionId.value = null
  } else {
    showCommentSectionId.value = thoughtId
  }
}

function submitComment(thoughtId) {
  if (!commentText.value[thoughtId]?.trim()) return

  thoughtStore.addComment(thoughtId, commentText.value[thoughtId].trim())
  commentText.value[thoughtId] = ''
}

function handleImageUpload(event) {
  const files = Array.from(event.target.files)

  for (const file of files) {
    if (file.size > 2 * 1024 * 1024) { // 2MB 限制
      alert(`图片 ${file.name} 超过 2MB`)
      continue
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      images.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  showImageUpload.value = false
}

function removeImage(index) {
  images.value.splice(index, 1)
}

function publish() {
  if (!content.value.trim()) return

  thoughtStore.createThought(content.value.trim(), images.value)
  
  // 重置表单
  content.value = ''
  images.value = []
  showPublishModal.value = false
}

function thoughtUrl(thoughtId) {
  return `${window.location.origin}/thought/${thoughtId}`
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
