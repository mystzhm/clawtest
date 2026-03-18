<template>
  <div class="max-w-md mx-auto">
    <div class="card">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">登录</h2>

      <form @submit.prevent="handleLogin">
        <!-- 邮箱 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">邮箱</label>
          <input
            v-model="email"
            type="email"
            placeholder="请输入邮箱"
            class="input-field"
            required
          />
        </div>

        <!-- 密码 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            class="input-field"
            required
          />
        </div>

        <!-- 验证码 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">验证码</label>
          <div class="flex space-x-3">
            <input
              v-model="captcha"
              type="text"
              placeholder="请输入验证码"
              class="input-field flex-1"
              required
              maxlength="4"
            />
            <button
              type="button"
              @click="generateCaptcha"
              class="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono font-bold tracking-wider text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {{ captchaText }}
            </button>
          </div>
        </div>

        <!-- 记住我 -->
        <div class="mb-6 flex items-center justify-between">
          <label class="flex items-center">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="rounded border-gray-300 text-zhihu-blue focus:ring-zhihu-blue"
            />
            <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">记住我（7天内免登录）</span>
          </label>
          <router-link to="/forgot-password" class="text-sm text-zhihu-blue hover:underline">
            忘记密码？
          </router-link>
        </div>

        <!-- 错误提示 -->
        <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>

        <!-- 登录按钮 -->
        <button
          type="submit"
          :disabled="loading"
          class="btn-primary w-full"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <!-- 注册链接 -->
      <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        还没有账号？
        <router-link to="/register" class="text-zhihu-blue hover:underline">注册</router-link>
      </p>

      <!-- 测试账号提示 -->
      <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p class="text-xs text-blue-600 dark:text-blue-400 mb-2">测试账号：</p>
        <p class="text-xs text-blue-500 dark:text-blue-500">
          邮箱：test@example.com<br />
          密码：123456
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const captcha = ref('')
const rememberMe = ref(false)
const error = ref('')
const loading = ref(false)

// 验证码
const captchaText = ref('')

// 生成验证码
function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaText.value = result
}

// 验证验证码
function validateCaptcha() {
  return captcha.value.toUpperCase() === captchaText.value.toUpperCase()
}

// 登录
async function handleLogin() {
  error.value = ''

  // 验证验证码
  if (!validateCaptcha()) {
    error.value = '验证码错误'
    generateCaptcha()
    captcha.value = ''
    return
  }

  loading.value = true

  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    userStore.login(email.value, password.value, rememberMe.value)
    router.push('/')
  } catch (e) {
    error.value = e.message
    generateCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 生成验证码
  generateCaptcha()

  // 检查记住登录
  if (userStore.checkRememberMe && userStore.checkRememberMe()) {
    router.push('/')
  }
})
</script>
