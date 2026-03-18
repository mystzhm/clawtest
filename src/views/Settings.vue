<template>
  <div class="max-w-2xl mx-auto">
    <div class="card">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">个人设置</h1>

      <!-- Tab 切换 -->
      <div class="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
            activeTab === tab.key
              ? 'bg-white dark:bg-gray-800 text-zhihu-blue shadow-sm'
              : 'text-gray-600 dark:text-gray-300'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 个人资料 -->
      <div v-if="activeTab === 'profile'" class="space-y-6">
        <!-- 头像 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">头像</label>
          <div class="flex items-center space-x-4">
            <img :src="form.avatar" class="w-20 h-20 rounded-full" />
            <input
              v-model="form.avatar"
              type="text"
              placeholder="头像 URL"
              class="input-field flex-1"
            />
          </div>
          <p class="text-xs text-gray-400 mt-1">推荐使用头像生成服务：https://api.dicebear.com</p>
        </div>

        <!-- 用户名 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="input-field"
            maxlength="20"
          />
        </div>

        <!-- 简介 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">个人简介</label>
          <textarea
            v-model="form.bio"
            rows="3"
            class="input-field"
            placeholder="介绍一下自己..."
            maxlength="200"
          ></textarea>
        </div>

        <!-- 邮箱 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            class="input-field"
            disabled
          />
          <p class="text-xs text-gray-400 mt-1">邮箱暂不支持修改</p>
        </div>

        <!-- 保存按钮 -->
        <div class="flex justify-end">
          <button
            @click="saveProfile"
            :disabled="!form.username.trim()"
            class="btn-primary"
          >
            保存
          </button>
        </div>
      </div>

      <!-- 账号安全 -->
      <div v-if="activeTab === 'security'" class="space-y-6">
        <!-- 修改密码 -->
        <div class="border-b border-gray-100 dark:border-gray-700 pb-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">修改密码</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">当前密码</label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                class="input-field"
                placeholder="输入当前密码"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">新密码</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                class="input-field"
                placeholder="输入新密码（至少6位）"
                minlength="6"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">确认新密码</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                class="input-field"
                placeholder="再次输入新密码"
              />
            </div>
          </div>
          <div class="flex justify-end mt-4">
            <button
              @click="changePassword"
              :disabled="!canChangePassword"
              class="btn-primary"
            >
              修改密码
            </button>
          </div>
        </div>

        <!-- 账号信息 -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">账号信息</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">用户 ID</span>
              <span class="text-gray-900 dark:text-white">{{ currentUser?.id }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">注册时间</span>
              <span class="text-gray-900 dark:text-white">{{ formatDate(currentUser?.createdAt) }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-600 dark:text-gray-400">关注数</span>
              <span class="text-gray-900 dark:text-white">{{ currentUser?.following || 0 }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-600 dark:text-gray-400">粉丝数</span>
              <span class="text-gray-900 dark:text-white">{{ currentUser?.followers || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 隐私设置 -->
      <div v-if="activeTab === 'privacy'" class="space-y-6">
        <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">个人主页公开</h3>
            <p class="text-sm text-gray-500">允许其他用户查看你的个人主页</p>
          </div>
          <button
            @click="togglePublicProfile"
            :class="[
              'w-12 h-6 rounded-full p-1 transition-colors',
              isPublicProfile ? 'bg-zhihu-blue' : 'bg-gray-300'
            ]"
          >
            <div
              :class="[
                'w-4 h-4 bg-white rounded-full transition-transform',
                isPublicProfile ? 'translate-x-6' : 'translate-x-0'
              ]"
            ></div>
          </button>
        </div>

        <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">显示在线状态</h3>
            <p class="text-sm text-gray-500">在个人主页显示在线状态</p>
          </div>
          <button
            @click="toggleOnlineStatus"
            :class="[
              'w-12 h-6 rounded-full p-1 transition-colors',
              showOnlineStatus ? 'bg-zhihu-blue' : 'bg-gray-300'
            ]"
          >
            <div
              :class="[
                'w-4 h-4 bg-white rounded-full transition-transform',
                showOnlineStatus ? 'translate-x-6' : 'translate-x-0'
              ]"
            ></div>
          </button>
        </div>
      </div>

      <!-- 消息通知 -->
      <div v-if="activeTab === 'notification'" class="space-y-6">
        <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">关注通知</h3>
            <p class="text-sm text-gray-500">当有人关注你时接收通知</p>
          </div>
          <button
            @click="toggleFollowNotification"
            :class="[
              'w-12 h-6 rounded-full p-1 transition-colors',
              followNotification ? 'bg-zhihu-blue' : 'bg-gray-300'
            ]"
          >
            <div
              :class="[
                'w-4 h-4 bg-white rounded-full transition-transform',
                followNotification ? 'translate-x-6' : 'translate-x-0'
              ]"
            ></div>
          </button>
        </div>

        <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">评论通知</h3>
            <p class="text-sm text-gray-500">当有人评论你的回答时接收通知</p>
          </div>
          <button
            @click="toggleCommentNotification"
            :class="[
              'w-12 h-6 rounded-full p-1 transition-colors',
              commentNotification ? 'bg-zhihu-blue' : 'bg-gray-300'
            ]"
          >
            <div
              :class="[
                'w-4 h-4 bg-white rounded-full transition-transform',
                commentNotification ? 'translate-x-6' : 'translate-x-0'
              ]"
            ></div>
          </button>
        </div>

        <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">点赞通知</h3>
            <p class="text-sm text-gray-500">当有人点赞你的内容时接收通知</p>
          </div>
          <button
            @click="toggleLikeNotification"
            :class="[
              'w-12 h-6 rounded-full p-1 transition-colors',
              likeNotification ? 'bg-zhihu-blue' : 'bg-gray-300'
            ]"
          >
            <div
              :class="[
                'w-4 h-4 bg-white rounded-full transition-transform',
                likeNotification ? 'translate-x-6' : 'translate-x-0'
              ]"
            ></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const activeTab = ref('profile')

const tabs = [
  { key: 'profile', label: '个人资料' },
  { key: 'security', label: '账号安全' },
  { key: 'privacy', label: '隐私设置' },
  { key: 'notification', label: '消息通知' }
]

const form = ref({
  username: '',
  bio: '',
  avatar: '',
  email: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 隐私和通知设置
const isPublicProfile = ref(true)
const showOnlineStatus = ref(true)
const followNotification = ref(true)
const commentNotification = ref(true)
const likeNotification = ref(true)

const currentUser = computed(() => userStore.currentUser)

const canChangePassword = computed(() => {
  return passwordForm.value.currentPassword &&
         passwordForm.value.newPassword &&
         passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword.length >= 6 &&
         passwordForm.value.newPassword === passwordForm.value.confirmPassword
})

onMounted(() => {
  if (currentUser.value) {
    form.value = {
      username: currentUser.value.username || '',
      bio: currentUser.value.bio || '',
      avatar: currentUser.value.avatar || '',
      email: currentUser.value.email || ''
    }
  }
})

function saveProfile() {
  if (!form.value.username.trim()) return

  userStore.updateProfile({
    username: form.value.username,
    bio: form.value.bio,
    avatar: form.value.avatar
  })
  alert('个人资料已更新')
}

function changePassword() {
  if (!canChangePassword.value) return

  if (passwordForm.value.currentPassword !== currentUser.value.password) {
    alert('当前密码错误')
    return
  }

  // 更新密码
  currentUser.value.password = passwordForm.value.newPassword

  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const index = users.findIndex(u => u.id === currentUser.value.id)
  if (index !== -1) {
    users[index] = currentUser.value
    localStorage.setItem('users', JSON.stringify(users))
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
  }

  alert('密码已修改')
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

function togglePublicProfile() {
  isPublicProfile.value = !isPublicProfile.value
  localStorage.setItem('isPublicProfile', JSON.stringify(isPublicProfile.value))
}

function toggleOnlineStatus() {
  showOnlineStatus.value = !showOnlineStatus.value
  localStorage.setItem('showOnlineStatus', JSON.stringify(showOnlineStatus.value))
}

function toggleFollowNotification() {
  followNotification.value = !followNotification.value
  localStorage.setItem('followNotification', JSON.stringify(followNotification.value))
}

function toggleCommentNotification() {
  commentNotification.value = !commentNotification.value
  localStorage.setItem('commentNotification', JSON.stringify(commentNotification.value))
}

function toggleLikeNotification() {
  likeNotification.value = !likeNotification.value
  localStorage.setItem('likeNotification', JSON.stringify(likeNotification.value))
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
