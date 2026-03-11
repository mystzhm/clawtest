<template>
  <div class="max-w-md mx-auto">
    <div class="card">
      <h2 class="text-2xl font-bold text-gray-900 text-center mb-6">注册</h2>

      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            class="input-field"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
          <input
            v-model="email"
            type="email"
            placeholder="请输入邮箱"
            class="input-field"
            required
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            class="input-field"
            required
          />
        </div>

        <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>

        <button type="submit" class="btn-primary w-full">注册</button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        已有账号？
        <router-link to="/login" class="text-zhihu-blue hover:underline">登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

function handleRegister() {
  error.value = ''
  try {
    userStore.register(username.value, email.value, password.value)
    userStore.login(email.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.message
  }
}
</script>
