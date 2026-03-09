import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import './utils/reset' // 添加全局重置函数

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
