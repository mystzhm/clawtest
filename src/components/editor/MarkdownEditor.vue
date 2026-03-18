<template>
  <div class="markdown-editor">
    <!-- 工具栏 -->
    <div class="toolbar border-b border-gray-200 dark:border-gray-700 py-2 px-3 flex items-center space-x-2 flex-wrap">
      <button
        v-for="tool in tools"
        :key="tool.name"
        @click="insertMarkdown(tool.syntax)"
        :title="tool.label"
        class="p-2 text-gray-500 hover:text-zhihu-blue hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
      >
        <span v-if="tool.icon" v-html="tool.icon" class="w-4 h-4 inline-block"></span>
        <span v-else class="text-sm font-bold">{{ tool.label }}</span>
      </button>

      <div class="flex-1"></div>

      <!-- 预览切换 -->
      <button
        @click="showPreview = !showPreview"
        :class="[
          'p-2 rounded transition-colors text-sm',
          showPreview ? 'text-zhihu-blue bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 hover:text-zhihu-blue hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        {{ showPreview ? '编辑' : '预览' }}
      </button>
    </div>

    <!-- 编辑/预览区域 -->
    <div class="editor-container">
      <!-- 编辑器 -->
      <textarea
        v-show="!showPreview"
        ref="textareaRef"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        class="w-full min-h-[200px] p-4 resize-none focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        @keydown.ctrl.enter="$emit('submit')"
        @keydown.meta.enter="$emit('submit')"
      ></textarea>

      <!-- 预览 -->
      <div
        v-show="showPreview"
        class="preview p-4 min-h-[200px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white prose prose-sm max-w-none"
        v-html="renderedMarkdown"
      ></div>
    </div>

    <!-- 底部提示 -->
    <div class="flex items-center justify-between px-3 py-2 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700">
      <span>支持 Markdown 语法</span>
      <span>Ctrl + Enter 发布</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../../stores/editor'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '写下你的内容...'
  },
  draftKey: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const editorStore = useEditorStore()
const textareaRef = ref(null)
const showPreview = ref(false)

// 工具栏按钮
const tools = [
  {
    name: 'bold',
    label: 'B',
    syntax: { prefix: '**', suffix: '**', placeholder: '粗体' }
  },
  {
    name: 'italic',
    label: 'I',
    syntax: { prefix: '*', suffix: '*', placeholder: '斜体' }
  },
  {
    name: 'heading',
    label: 'H',
    syntax: { prefix: '## ', suffix: '', placeholder: '标题' }
  },
  {
    name: 'link',
    label: '链接',
    syntax: { prefix: '[', suffix: '](url)', placeholder: '链接文字' }
  },
  {
    name: 'image',
    label: '图片',
    syntax: { prefix: '![', suffix: '](url)', placeholder: '图片描述' }
  },
  {
    name: 'code',
    label: '代码',
    syntax: { prefix: '```\n', suffix: '\n```', placeholder: '代码' }
  },
  {
    name: 'quote',
    label: '引用',
    syntax: { prefix: '> ', suffix: '', placeholder: '引用内容' }
  },
  {
    name: 'list',
    label: '列表',
    syntax: { prefix: '- ', suffix: '', placeholder: '列表项' }
  },
  {
    name: 'numbered',
    label: '编号',
    syntax: { prefix: '1. ', suffix: '', placeholder: '列表项' }
  }
]

// 插入 Markdown 语法
function insertMarkdown(syntax) {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = props.modelValue
  const selectedText = text.substring(start, end) || syntax.placeholder

  const before = text.substring(0, start)
  const after = text.substring(end)

  const newText = before + syntax.prefix + selectedText + syntax.suffix + after
  emit('update:modelValue', newText)

  // 恢复焦点和选区
  setTimeout(() => {
    textarea.focus()
    const newCursorPos = start + syntax.prefix.length + selectedText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  }, 0)
}

// 简单的 Markdown 渲染
const renderedMarkdown = computed(() => {
  let md = props.modelValue

  // 转义 HTML
  md = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 标题
  md = md.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
  md = md.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
  md = md.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')

  // 粗体和斜体
  md = md.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
  md = md.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
  md = md.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

  // 代码块
  md = md.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-700 p-3 rounded my-2 overflow-x-auto"><code>$1</code></pre>')

  // 行内代码
  md = md.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>')

  // 链接
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-zhihu-blue hover:underline" target="_blank">$1</a>')

  // 图片
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-2" />')

  // 引用
  md = md.replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 my-2 text-gray-600 dark:text-gray-400">$1</blockquote>')

  // 无序列表
  md = md.replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
  md = md.replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc my-2">$&</ul>')

  // 有序列表
  md = md.replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')

  // 换行
  md = md.replace(/\n/g, '<br>')

  return md
})

// 草稿自动保存
let draftTimer = null
function saveDraft() {
  if (props.draftKey && props.modelValue) {
    editorStore.saveDraft(props.draftKey, props.modelValue)
  }
}

// 监听内容变化，自动保存草稿
watch(() => props.modelValue, () => {
  clearTimeout(draftTimer)
  draftTimer = setTimeout(saveDraft, 1000)
})
</script>

<script>
import { watch } from 'vue'
export default {
  name: 'MarkdownEditor'
}
</script>

<style scoped>
.markdown-editor {
  border: 1px solid theme('colors.gray.200');
  border-radius: theme('borderRadius.lg');
  overflow: hidden;
}

.dark .markdown-editor {
  border-color: theme('colors.gray.700');
}

.toolbar button {
  min-width: 32px;
  min-height: 32px;
}

.editor-container {
  min-height: 200px;
}

.preview {
  line-height: 1.6;
}
</style>
