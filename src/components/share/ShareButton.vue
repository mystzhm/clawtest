<template>
  <div class="share-dropdown">
    <button @click="toggleDropdown" class="flex items-center space-x-1 text-gray-400 hover:text-gray-600 transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      <span>分享</span>
    </button>

    <!-- 下拉面板 -->
    <div v-if="showDropdown" class="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[200px]">
      <button
        @click="copyLink"
        class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
      >
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span>复制链接</span>
      </button>
      <button
        @click="shareToWeibo"
        class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
      >
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
        <span>分享到微博</span>
      </button>
      <button
        @click="shareToWeChat"
        class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
      >
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>分享到微信</span>
      </button>
      <button
        @click="generateQRCode"
        class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
      >
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        <span>二维码分享</span>
      </button>
    </div>

    <!-- 二维码弹窗 -->
    <div v-if="showQRCode" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showQRCode = false">
      <div class="bg-white rounded-lg p-6 mx-4" @click.stop>
        <h3 class="text-lg font-bold text-gray-900 mb-4 text-center">扫码分享</h3>
        <div ref="qrcodeContainer" class="flex justify-center">
          <img :src="qrcodeUrl" alt="二维码" class="w-64 h-64" />
        </div>
        <p class="text-center text-sm text-gray-500 mt-4">{{ currentUrl }}</p>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <div v-if="showCopySuccess" class="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg z-50">
      链接已复制
    </div>

    <!-- 点击外部关闭 -->
    <div v-if="showDropdown" class="fixed inset-0 z-40" @click="showDropdown = false"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  url: {
    type: String,
    default: ''
  }
})

const route = useRoute()

const showDropdown = ref(false)
const showQRCode = ref(false)
const showCopySuccess = ref(false)
const qrcodeUrl = ref('')

const currentUrl = computed(() => {
  return props.url || `${window.location.origin}${route.fullPath}`
})

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(currentUrl.value)
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000)
    showDropdown.value = false
  } catch (err) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = currentUrl.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000)
    showDropdown.value = false
  }
}

function shareToWeibo() {
  const url = encodeURIComponent(currentUrl.value)
  const title = encodeURIComponent('来自知答社区的内容')
  window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${title}`, '_blank')
}

function shareToWeChat() {
  // 微信分享需要使用微信 JS-SDK 或引导用户截图
  showQRCode.value = true
  showDropdown.value = false
}

async function generateQRCode() {
  // 使用免费的二维码生成 API
  const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl.value)}`
  qrcodeUrl.value = apiUrl
  showQRCode.value = true
  showDropdown.value = false
}
</script>

<style scoped>
.share-dropdown {
  position: relative;
}
</style>
