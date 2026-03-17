// utils/app-lifecycle.js
/**
 * 应用生命周期管理
 * 对应 Flutter 的 AppWithLifecycleTracker
 */

import userStore from '@/store/user.js'

/**
 * 应用生命周期状态
 */
const AppLifecycleState = {
  RESUMED: 'resumed',      // 应用回到前台
  PAUSED: 'paused',        // 应用切换到后台
  INACTIVE: 'inactive',    // 应用失去焦点
  DETACHED: 'detached'     // 应用被销毁
}

class AppLifecycleManager {
  constructor() {
    this.listeners = []
    this.currentState = null
  }

  /**
   * 监听生命周期变化
   * @param {Function} listener - 回调函数，参数为 (previousState, currentState)
   * @returns {Function} 取消监听的函数
   */
  listen(listener) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 通知生命周期变化
   * @param {string} state - 新状态
   */
  _notify(state) {
    const previousState = this.currentState
    this.currentState = state

    console.log(`[AppLifecycle] 状态变化: ${previousState} -> ${state}`)

    this.listeners.forEach(listener => {
      try {
        listener(previousState, state)
      } catch (error) {
        console.error('[AppLifecycle] 监听器执行失败', error)
      }
    })
  }

  /**
   * 应用显示（对应 onShow）
   */
  onShow() {
    this._notify(AppLifecycleState.RESUMED)
  }

  /**
   * 应用隐藏（对应 onHide）
   */
  onHide() {
    this._notify(AppLifecycleState.PAUSED)
  }
}

// 创建全局实例
const appLifecycleManager = new AppLifecycleManager()

/**
 * 在 App.vue 中使用
 */
export function useAppLifecycle() {
  const app = getApp();
  
  // 增加判断，防止 getApp() 为空导致崩溃
  if (!app) {
    console.warn('[AppLifecycle] getApp() 尚未准备就绪');
    return appLifecycleManager;
  }

  // 检查是否已经绑定过，避免重复绑定
  if (!app._lifecycleBound) {
    app.onShow(() => { appLifecycleManager.onShow() });
    app.onHide(() => { appLifecycleManager.onHide() });
    app._lifecycleBound = true;
  }

  return appLifecycleManager;
}

/**
 * 在页面中使用生命周期监听
 *
 * @param {Object} options - 配置选项
 * @param {Function} options.onResumed - 应用回到前台回调
 * @param {Function} options.onPaused - 应用切换到后台回调
 */
export function useAppLifecycleListener(options = {}) {
  const { onResumed, onPaused } = options

  const unlisten = appLifecycleManager.listen((previousState, currentState) => {
    if (currentState === AppLifecycleState.RESUMED && onResumed) {
      onResumed(previousState, currentState)
    }

    if (currentState === AppLifecycleState.PAUSED && onPaused) {
      onPaused(previousState, currentState)
    }
  })

  return unlisten
}

/**
 * 初始化应用生命周期监听器
 * 对应 Flutter 的 router_listenable.dart 中的监听逻辑
 */
export function initAppLifecycleListeners() {
  console.log('[AppLifecycle] 初始化生命周期监听器')

  // 监听用户状态变化
  userStore.subscribe((user) => {
    console.log('[AppLifecycle] 用户状态变化', user)

    // 当用户状态变化时，可能需要刷新路由
    // 这里可以添加相关逻辑
  })
}

export default {
  AppLifecycleState,
  appLifecycleManager,
  useAppLifecycle,
  useAppLifecycleListener,
  initAppLifecycleListeners
}
