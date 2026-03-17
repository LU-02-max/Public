import App from './App'
// import { initRouter } from './utils/router.js'
import { DEV_CLEANUP, FORCE_CLEAR_ALL } from '@/config/dev.js'

// [优化] 智能启动检查，避免激进清理
console.log('🔍 应用启动...')
 
try {
    // 检查是否存在用户数据
    const oldUser = uni.getStorageSync('user_profile')
    if (oldUser) {
        if (FORCE_CLEAR_ALL) {
            console.warn('⚠️ [FORCE_CLEAR_ALL=true] 执行紧急数据清除...')
            uni.clearStorageSync()
            console.log('✅ 所有数据已清除')
        } else if (DEV_CLEANUP) {
            console.log('🧹 [DEV_CLEANUP=true] 发现用户数据，交由 UserStore 智能处理...')
            // UserStore 会智能判断是否为测试数据
        } else {
            console.log('🧹 [DEV_CLEANUP=false] 发现用户数据，完全保留...')
        }
    } else {
        console.log('ℹ️ 未发现用户数据，保持纯净启动')
    }
} catch (e) {
    console.error('❌ 启动检查失败:', e)
}

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif

// 初始化路由（在应用启动时）
// 注意：需要在 App.vue 的 onLaunch 中调用 initRouter
// 或者在这里初始化（取决于需求）