/**
 * utils/app-exit-manager.js
 * 应用退出管理器 - 生命周期兜底和强制解绑
 * 负责监听应用退出、账号切换等场景，确保数据清理和设备解绑
 */

import userStore from '@/store/user.js'
import { removeUser } from '@/utils/storage.js'
import log from '@/utils/logger.js'

/**
 * 退出管理器配置
 */
const EXIT_CONFIG = {
	// 退出超时时间（毫秒）
	UNBIND_TIMEOUT: 5000,

	// 最大重试次数
	MAX_RETRY: 2,

	// 是否启用强制解绑
	FORCE_UNBIND_ENABLED: true,

	// 是否在退出时清理所有缓存
	CLEAR_ALL_ON_EXIT: false // 默认只清理用户数据，保留系统缓存
}

/**
 * 退出原因枚举
 */
export const EXIT_REASON = {
	USER_LOGOUT: 'user_logout',           // 用户主动登出
	APP_DESTROY: 'app_destroy',           // 应用被销毁
	ACCOUNT_SWITCH: 'account_switch',     // 切换账号
	TIMEOUT: 'timeout',                   // 会话超时
	SESSION_EXPIRED: 'session_expired',   // 会话过期
	FORCE_EXIT: 'force_exit',             // 强制退出
	ERROR: 'error'                         // 错误退出
}

/**
 * 应用退出管理器
 */
class AppExitManager {
	constructor() {
		this._isExiting = false
		this._exitInProgress = false
		this._retryCount = 0
		this._exitReason = null
		this._listeners = []

		console.log('🛡️ [ExitManager] 退出管理器已初始化')
	}

	/**
	 * 监听退出事件
	 * @param {Function} listener 退出事件监听器
	 * @returns {Function} 取消监听的函数
	 */
	onExit(listener) {
		this._listeners.push(listener)
		return () => {
			const index = this._listeners.indexOf(listener)
			if (index > -1) {
				this._listeners.splice(index, 1)
			}
		}
	}

	/**
	 * 触发退出事件
	 * @param {String} reason 退出原因
	 * @param {Object} data 附加数据
	 */
	_notifyExit(reason, data = {}) {
		console.log(`📢 [ExitManager] 触发退出事件: ${reason}`, data)

		this._listeners.forEach(listener => {
			try {
				listener(reason, data)
			} catch (e) {
				console.error('[ExitManager] 退出监听器执行失败', e)
			}
		})
	}

	/**
	 * 执行退出流程（带强制解绑兜底）
	 * @param {String} reason 退出原因
	 * @param {Object} options 退出选项
	 */
	async exit(reason, options = {}) {
		// 防止重复退出
		if (this._isExiting || this._exitInProgress) {
			console.warn('⚠️ [ExitManager] 正在执行退出流程，忽略重复调用')
			return
		}

		this._exitInProgress = true
		this._exitReason = reason

		console.log('🚪 [ExitManager] 开始执行退出流程:', {
			reason,
			userPhone: userStore.user?.phone,
			deviceBound: userStore.user?.deviceBound,
			options
		})

		try {
			// 1. 执行强制解绑（带超时和重试）
			if (EXIT_CONFIG.FORCE_UNBIND_ENABLED && userStore.user?.deviceBound) {
				await this._forceUnbindDeviceWithRetry()
			}

			// 2. 清理本地数据
			await this._cleanupLocalData(options.clearAll || EXIT_CONFIG.CLEAR_ALL_ON_EXIT)

			// 3. 触发退出事件
			this._notifyExit(reason, {
				phone: userStore.user?.phone,
				deviceId: userStore.user?.deviceId,
				timestamp: Date.now()
			})

			// 4. 标记退出完成
			this._isExiting = true
			console.log('✅ [ExitManager] 退出流程执行完成')

		} catch (error) {
			console.error('❌ [ExitManager] 退出流程执行失败:', error)

			// 即使失败也继续清理本地数据（兜底）
			await this._cleanupLocalData(false)

			// 触发错误退出事件
			this._notifyExit(EXIT_REASON.ERROR, {
				reason,
				error: error.message,
				timestamp: Date.now()
			})
		} finally {
			this._exitInProgress = false
			this._retryCount = 0
		}
	}

	/**
	 * 强制解绑设备（带重试机制）
	 */
	async _forceUnbindDeviceWithRetry() {
		const phone = userStore.user?.phone
		const deviceId = userStore.user?.deviceId

		if (!phone) {
			console.log('[ExitManager] 未登录用户，跳过解绑')
			return
		}

		console.log(`📱 [ExitManager] 开始强制解绑: ${phone} -> ${deviceId || '未知设备'}`)

		for (let i = 0; i <= EXIT_CONFIG.MAX_RETRY; i++) {
			try {
				const result = await this._unbindWithTimeout(phone)
				console.log(`✅ [ExitManager] 强制解绑成功 (尝试 ${i + 1}/${EXIT_CONFIG.MAX_RETRY + 1})`)
				return // 解绑成功，退出循环
			} catch (error) {
				console.warn(`⚠️ [ExitManager] 强制解绑失败 (尝试 ${i + 1}/${EXIT_CONFIG.MAX_RETRY + 1}):`, error.message)

				if (i < EXIT_CONFIG.MAX_RETRY) {
					// 等待后重试
					await new Promise(resolve => setTimeout(resolve, 1000))
				}
			}
		}

		// 所有重试都失败，记录警告但不阻塞退出流程
		console.warn('⚠️ [ExitManager] 强制解绑所有尝试均失败，继续退出流程')
	}

	/**
	 * 解绑设备（带超时控制）
	 */
	async _unbindWithTimeout(phone) {
		return Promise.race([
			// 调用解绑接口
			import('@/api.js').then(api => api.unbindDevice(phone)),
			// 超时控制
			new Promise((_, reject) => {
				setTimeout(() => reject(new Error('解绑接口超时')), EXIT_CONFIG.UNBIND_TIMEOUT)
			})
		])
	}

	/**
	 * 清理本地数据
	 * @param {Boolean} clearAll 是否清理所有数据
	 */
	async _cleanupLocalData(clearAll = false) {
		console.log(`🧹 [ExitManager] 开始清理本地数据 (clearAll=${clearAll})`)

		try {
			// 1. 清理用户数据
			removeUser()

			// 2. 清理相关缓存
			const keysToRemove = [
				'user_profile',
				'profile_gender',
				'profile_birthday',
				'profile_nickname',
				'profile_phone',
				'profile_device_id',
				'is_logged_in',
				'profile_device_bound',
				'profileCompleted',
				'profileisFirst'
			]

			keysToRemove.forEach(key => {
				try {
					uni.removeStorageSync(key)
				} catch (e) {
					console.warn(`清理缓存失败: ${key}`, e)
				}
			})

			// 3. 如果需要，清理所有数据
			if (clearAll) {
				uni.clearStorageSync()
				console.log('🗑️ [ExitManager] 已清理所有本地存储')
			} else {
				console.log('✅ [ExitManager] 用户数据清理完成')
			}
		} catch (error) {
			console.error('❌ [ExitManager] 清理本地数据失败:', error)
			throw error
		}
	}

	/**
	 * 检查并处理异常退出场景
	 */
	checkAbnormalExit() {
		const lastExitTimestamp = uni.getStorageSync('last_exit_timestamp')
		const currentTimestamp = Date.now()

		if (lastExitTimestamp) {
			const timeDiff = currentTimestamp - lastExitTimestamp
			const abnormalExitThreshold = 60 * 1000 // 60秒内重新启动可能是异常退出

			if (timeDiff < abnormalExitThreshold) {
				console.warn('⚠️ [ExitManager] 检测到可能的异常退出')
				// 可以在这里执行一些恢复操作
			}
		}

		// 记录当前启动时间
		uni.setStorageSync('app_start_timestamp', currentTimestamp)
	}

	/**
	 * 记录正常退出时间
	 */
	recordNormalExit() {
		uni.setStorageSync('last_exit_timestamp', Date.now())
		console.log('📝 [ExitManager] 记录正常退出时间')
	}

	/**
	 * 获取退出状态
	 */
	getExitStatus() {
		return {
			isExiting: this._isExiting,
			exitInProgress: this._exitInProgress,
			exitReason: this._exitReason,
			retryCount: this._retryCount
		}
	}
}

// 创建全局单例
const appExitManager = new AppExitManager()

/**
 * 监听应用生命周期，自动处理退出逻辑
 */
export function initExitMonitoring() {
	console.log('🛡️ [ExitMonitor] 初始化退出监听')

	// 检查异常退出
	appExitManager.checkAbnormalExit()

	// 监听应用生命周期
	const app = getApp()

	if (app) {
		// 应用隐藏（进入后台）
		const originalOnHide = app.onHide
		app.onHide = function() {
			console.log('📱 [ExitMonitor] 应用进入后台')
			// 记录退出时间
			appExitManager.recordNormalExit()
			// 执行原始 onHide
			if (originalOnHide) {
				originalOnHide.call(this)
			}
		}

		// 应用销毁（完全退出）
		const originalOnUnload = app.onUnload
		app.onUnload = function() {
			console.log('🛑 [ExitMonitor] 应用销毁')
			// 执行退出清理
			appExitManager.exit(EXIT_REASON.APP_DESTROY)
			// 执行原始 onUnload
			if (originalOnUnload) {
				originalOnUnload.call(this)
			}
		}
	}

	return appExitManager
}

export default appExitManager
