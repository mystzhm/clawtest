<template>
  <div class="max-w-3xl mx-auto">
    <div class="card">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
        {{ isEdit ? '编辑文章' : '写文章' }}
      </h2>

      <form @submit.prevent="submitArticle">
        <!-- 选择专栏 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择专栏</label>
          <select v-model="form.columnId" class="input-field" required>
            <option value="">请选择专栏</option>
            <option v-for="column in myColumns" :key="column.id" :value="column.id">
              {{ column.name }}
            </option>
          </select>
          <p v-if="myColumns.length === 0" class="text-xs text-red-500 mt-1">
            请先创建专栏
            <router-link to="/columns" class="text-zhihu-blue">去创建</router-link>
          </p>
        </div>

        <!-- 标题 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">文章标题</label>
          <input
            v-model="form.title"
            type="text"
            class="input-field"
            placeholder="输入文章标题"
            maxlength="100"
            required
          />
        </div>

        <!-- 封面 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">封面图片（可选）</label>
          <input
            v-model="form.cover"
            type="text"
            class="input-field"
            placeholder="图片 URL"
          />
        </div>

        <!-- 内容 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">文章内容</label>
          <MarkdownEditor
            v-model="form.content"
            placeholder="写下你的文章内容..."
            :draft-key="`article-${form.columnId || 'new'}`"
            @submit="submitArticle"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end space-x-3">
          <router-link to="/columns" class="btn-outline">取消</router-link>
          <button
            type="submit"
            :disabled="!form.title.trim() || !form.content.trim() || !form.columnId"
            class="btn-primary"
          >
            发布
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useColumnStore } from '../stores/column'
import MarkdownEditor from '../components/editor/MarkdownEditor.vue'

const route = useRoute()
const router = useRouter()
const columnStore = useColumnStore()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  columnId: '',
  title: '',
  cover: '',
  content: ''
})

const myColumns = computed(() => columnStore.myColumns)

onMounted(() => {
  // 如果从专栏页面跳转过来，自动选中专栏
  if (route.query.columnId) {
    form.value.columnId = route.query.columnId
  }

  // 如果是编辑模式，加载文章内容
  if (isEdit.value) {
    const article = columnStore.getArticleById(route.params.id)
    if (article) {
      form.value = {
        columnId: article.columnId,
        title: article.title,
        cover: article.cover || '',
        content: article.content
      }
    }
  }
})

function submitArticle() {
  if (!form.value.title.trim() || !form.value.content.trim() || !form.value.columnId) {
    return
  }

  if (isEdit.value) {
    columnStore.updateArticle(route.params.id, form.value)
    router.push(`/article/${route.params.id}`)
  } else {
    const article = columnStore.createArticle(
      form.value.columnId,
      form.value.title,
      form.value.content,
      form.value.cover
    )
    router.push(`/article/${article.id}`)
  }
}
</script>
