<template>
  <div class="max-w-3xl mx-auto">
    <div class="card">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">发布想法</h2>

      <div class="flex items-start space-x-4 mb-6">
        <!-- 用户头像 -->
        <img :src="currentUser?.avatar" class="w-12 h-12 rounded-full flex-shrink-0" />
        <div class="flex-1">
          <!-- 输入框 -->
          <textarea
            v-model="content"
            @input="handleInput"
            @keydown.ctrl.enter="publish"
            @keydown.meta.enter="publish"
            rows="3"
            placeholder="分享你的想法..."
            class="input-field resize-none text-base"
            maxlength="500"
          ></textarea>
          
          <!-- 字数统计 -->
          <div class="text-right text-xs text-gray-400 mt-1">
            {{ content.length }}/500
          </div>
        </div>
      </div>

      <!-- 图片上传区域 -->
      <div class="mb-6 border-b border-gray-100 dark:border-gray-700 pb-6">
        <button
          @click="showImageUpload = !showImageUpload"
          class="flex items-center space-x-2 text-gray-500 hover:text-zhihu-blue"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0l-8-8a2 2 0 01-2.828 0l-8 8a2 2 0 012.828 0L4 16z" />
          </svg>
          <span>{{ images.length > 0 ? `${images.length} 张图片` : '添加图片' }}</span>
        </button>

        <!-- 已上传的图片 -->
        <div v-if="images.length > 0" class="flex flex-wrap gap-2 mt-4">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="relative group"
          >
            <img :src="image" class="w-20 h-20 rounded-lg object-cover" />
            <button
              @click="removeImage(index)"
              class="absolute top-0.5 right-0.5 w-6 h-6 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              ×
            </button>
          </div>
        </div>

        <!-- 图片上传面板 -->
        <div v-if="showImageUpload" class="mt-4">
          <div class="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              @change="handleImageUpload"
              class="hidden"
            />
            <button
              @click="$refs.fileInput.click()"
              class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              选择图片
            </button>
            <p class="text-xs text-gray-400 mt-2">
              支持 JPG、PNG、GIF 格式，单张不超过 2MB
            </p>
          </div>
        </div>
      </div>

      <!-- 话题标签 -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          话题（可选）
        </label>
        <div class="relative">
          <input
            v-model="topic"
            type="text"
            class="input-field"
            placeholder="添加话题..."
            @focus="showTopicSuggestions = true"
          />
          <div
            v-if="showTopicSuggestions && topicSuggestions.length > 0"
            class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
          >
            <div
              v-for="suggestion in topicSuggestions"
              :key="suggestion.id"
              @click="topic = suggestion.name; showTopicSuggestions = false"
              class="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm"
            >
              {{ suggestion.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- 隐私设置 -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          可见性
        </label>
        <div class="flex items-center space-x-4">
          <label class="flex items-center">
            <input
              v-model="visibility"
              type="radio"
              value="public"
              class="mr-2"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">公开</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="visibility"
              type="radio"
              value="followers"
              class="mr-2"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">仅粉丝可见</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="visibility"
              type="radio"
              value="private"
              class="mr-2"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">仅自己可见</span>
          </label>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-end space-x-3">
        <router-link to="/thoughts" class="btn-outline">取消</router-link>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThoughtStore } from '../stores/thought'
import { useTopicStore } from '../stores/topic'
import { useUserStore } from '../stores/user'

const router = useRouter()
const thoughtStore = useThoughtStore()
const topicStore = useTopicStore()
const userStore = useUserStore()

const content = ref('')
const topic = ref('')
const images = ref([])
const showImageUpload = ref(false)
const showTopicSuggestions = ref(false)
const visibility = ref('public')
const fileInput = ref(null)

const currentUser = computed(() => userStore.currentUser)

const topicSuggestions = computed(() => {
  if (!topic.value || !topic.value.trim()) {
    return []
  }
  return topicStore.searchTopics(topic.value)
})

onMounted(() => {
  // 从 URL 获取回复参数
  if (router.query.replyTo) {
    content.value = `@${router.query.replyToUser} `
  }
})

function handleInput() {
  if (content.value.trim()) {
    // 提取 @用户名
    const mentions = content.value.match(/@[\w\u4e00-\u9fa5]+/g)
    if (mentions && mentions.length > 0) {
      console.log('提及的用户:', mentions)
    }
  }
}

async function handleImageUpload(event) {
  const files = Array.from(event.target.files)
  
  if (files.length === 0) return

  for (const file of files) {
    if (file.size > 2 * 1024 * 1024) { // 2MB 限制
      alert(`图片 ${file.name} 超过 2MB，请选择更小的图片`)
      continue
    }

    try {
      const base64 = await fileToBase64(file)
      images.value.push(base64)
    } catch (error) {
      console.error('图片上传失败:', error)
      alert(`图片 ${file.name} 上传失败`)
    }
  }

  showImageUpload.value = false
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function removeImage(index) {
  images.value.splice(index, 1)
}

function publish() {
  if (!content.value.trim()) return

  try {
    thoughtStore.createThought(
      content.value.trim(),
      images.value,
      topic.value
    )

    // 清空表单
    content.value = ''
    images.value = []
    topic.value = ''
    visibility.value = 'public'

    alert('想法发布成功！')
    router.push('/thoughts')
  } catch (error) {
    console.error('发布失败:', error)
    alert(error.message)
  }
}
</script>
