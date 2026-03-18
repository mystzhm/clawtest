<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-zhihu-blue rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">知</span>
        </div>
        <span class="text-xl font-bold text-gray-900 dark:text-white">知答</span>
      </router-link>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center space-x-6">
        <router-link to="/" class="text-gray-600 dark:text-gray-300 hover:text-zhihu-blue">首页</router-link>
        <router-link to="/hot" class="text-gray-600 dark:text-gray-300 hover:text-zhihu-blue">热榜</router-link>
        <router-link to="/columns" class="text-gray-600 dark:text-gray-300 hover:text-zhihu-blue">专栏</router-link>
        <router-link to="/?tab=following" class="text-gray-600 dark:text-gray-300 hover:text-zhihu-blue">关注</router-link>
      </nav>

      <!-- Search -->
      <div class="flex-1 max-w-md mx-4 hidden sm:block">
        <div class="relative">
          <input
            v-model="searchKeyword"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索问题..."
            class="w-full bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 pr-10 focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-zhihu-blue text-gray-900 dark:text-white"
          />
          <button @click="handleSearch" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-zhihu-blue">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Desktop User Actions -->
      <div class="hidden md:flex items-center space-x-3">
        <router-link v-if="userStore.isLoggedIn" to="/ask" class="btn-primary text-sm">
          提问题
        </router-link>
        <ThemeToggle />
        <NotificationBell v-if="userStore.isLoggedIn" />
        <router-link v-if="userStore.isLoggedIn" to="/favorites" class="text-gray-500 hover:text-zhihu-blue" title="收藏夹">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </router-link>
        <template v-if="userStore.isLoggedIn">
          <router-link :to="`/user/${userStore.currentUser.id}`" class="flex items-center space-x-2">
            <img :src="userStore.currentUser.avatar" class="w-8 h-8 rounded-full" />
            <span class="text-sm">{{ userStore.currentUser.username }}</span>
          </router-link>
          <button @click="userStore.logout()" class="text-gray-500 hover:text-red-500 text-sm">退出</button>
        </template>
        <template v-else>
          <router-link to="/login" class="text-zhihu-blue hover:text-zhihu-blue-hover">登录</router-link>
          <router-link to="/register" class="btn-primary text-sm">注册</router-link>
        </template>
      </div>

      <!-- Mobile Menu Button -->
      <button
        @click="showMobileMenu = !showMobileMenu"
        class="md:hidden p-2 text-gray-500 hover:text-zhihu-blue"
      >
        <svg v-if="!showMobileMenu" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu Dropdown -->
    <div v-if="showMobileMenu" class="md:hidden border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div class="px-4 py-3 space-y-3">
        <!-- Mobile Search -->
        <div class="relative">
          <input
            v-model="searchKeyword"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索问题..."
            class="w-full bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-zhihu-blue text-gray-900 dark:text-white"
          />
          <button @click="handleSearch" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <!-- Mobile Nav Links -->
        <router-link to="/" @click="showMobileMenu = false" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-zhihu-blue">
          首页
        </router-link>
        <router-link to="/hot" @click="showMobileMenu = false" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-zhihu-blue">
          热榜
        </router-link>

        <!-- Mobile User Actions -->
        <div class="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <ThemeToggle />
            <NotificationBell v-if="userStore.isLoggedIn" />
          </div>
          <div class="flex items-center space-x-3">
            <template v-if="userStore.isLoggedIn">
              <router-link to="/ask" @click="showMobileMenu = false" class="btn-primary text-sm">
                提问题
              </router-link>
              <router-link :to="`/user/${userStore.currentUser.id}`" @click="showMobileMenu = false">
                <img :src="userStore.currentUser.avatar" class="w-8 h-8 rounded-full" />
              </router-link>
            </template>
            <template v-else>
              <router-link to="/login" @click="showMobileMenu = false" class="text-zhihu-blue">登录</router-link>
              <router-link to="/register" @click="showMobileMenu = false" class="btn-primary text-sm">注册</router-link>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile Bottom Navigation -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 z-50">
    <div class="flex justify-around py-2">
      <router-link to="/" class="flex flex-col items-center py-1 text-gray-500 hover:text-zhihu-blue">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-xs mt-1">首页</span>
      </router-link>
      <router-link to="/hot" class="flex flex-col items-center py-1 text-gray-500 hover:text-zhihu-blue">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
        <span class="text-xs mt-1">热榜</span>
      </router-link>
      <router-link v-if="userStore.isLoggedIn" to="/ask" class="flex flex-col items-center py-1 text-gray-500 hover:text-zhihu-blue">
        <div class="w-10 h-10 bg-zhihu-blue rounded-full flex items-center justify-center -mt-4">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span class="text-xs mt-1">提问</span>
      </router-link>
      <router-link to="/favorites" class="flex flex-col items-center py-1 text-gray-500 hover:text-zhihu-blue">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <span class="text-xs mt-1">收藏</span>
      </router-link>
      <router-link v-if="userStore.isLoggedIn" :to="`/user/${userStore.currentUser.id}`" class="flex flex-col items-center py-1 text-gray-500 hover:text-zhihu-blue">
        <img :src="userStore.currentUser.avatar" class="w-6 h-6 rounded-full" />
        <span class="text-xs mt-1">我的</span>
      </router-link>
      <router-link v-else to="/login" class="flex flex-col items-center py-1 text-gray-500 hover:text-zhihu-blue">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-xs mt-1">登录</span>
      </router-link>
    </div>
  </nav>

  <!-- 占位元素，防止底部导航遮挡内容 -->
  <div class="md:hidden h-16"></div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import NotificationBell from '../notification/NotificationBell.vue'
import ThemeToggle from '../theme/ThemeToggle.vue'

const router = useRouter()
const userStore = useUserStore()
const searchKeyword = ref('')
const showMobileMenu = ref(false)

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { q: searchKeyword.value.trim() } })
    showMobileMenu.value = false
  }
}
</script>
