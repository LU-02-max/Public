// viewmodels/auth.js
import {
	sendCode as sendCodeApi,
	loginBySms,
	bindDevice,
	unbindDevice as apiUnbindDevice,
	checkUserStatus
} from '@/api.js'
import trackingService from '@/services/tracking.js'
import userStore from '@/store/user.js'


// 认证状态 (移除 token 字段)
class AuthState {
	constructor({
		isLoading = false,
		isLoggedIn = false,
		error = null,
		initialized = false
	} = {}) {
		this.isLoading = isLoading
		this.isLoggedIn = isLoggedIn
		this.error = error
		this.initialized = initialized
	}
	static initial() {
		return new AuthState()
	}
	copyWith({
		isLoading,
		isLoggedIn,
		error,
		initialized
	} = {}) {
		return Object.assign(new AuthState(), this, {
			isLoading: isLoading !== undefined ? isLoading : this.isLoading,
			isLoggedIn: isLoggedIn !== undefined ? isLoggedIn : this.isLoggedIn,
			error: error !== undefined ? error : this.error,
			initialized: initialized !== undefined ? initialized : this.initialized,
		})
	}
}

class AuthViewModel {
	constructor() {
		this.state = AuthState.initial()
		this._listeners = []
	}

	listen(listener) {
		this._listeners.push(listener)
		return () => {
			const index = this._listeners.indexOf(listener)
			if (index > -1) this._listeners.splice(index, 1)
		}
	}

	_notify() {
		this._listeners.forEach(listener => listener(this.state))
	}

	// 1. 发送验证码
	async sendCode(phone) {
		console.log('🔍 [DEBUG] ========== sendCode 开始 ==========')
		console.log('🔍 [DEBUG] 1. 当前状态:', {
			isLoading: this.state.isLoading,
			error: this.state.error
		})
		console.log('🔍 [DEBUG] 2. 请求手机号:', phone)
		console.log('🔍 [DEBUG] 3. 本地存储检查:', {
			hasUser: !!uni.getStorageSync('user_profile'),
			hasToken: !!uni.getStorageSync('token')
		})

		this.state = this.state.copyWith({
			isLoading: true,
			error: null
		})
		this._notify()
		console.log('🔍 [DEBUG] 4. 状态已更新为 loading')

		try {
			console.log(' [Auth] 准备发送验证码:', phone)

			const response = await sendCodeApi(phone)
			console.log('🔍 [DEBUG] 5. API 原始响应:', response)
			console.log(' [Auth] 发送验证码响应:', response)

			// 修复：对于发送验证码，只要没有错误就算成功（即使响应为空）
			// 因为验证码已经成功发送到手机了
			if (response === true || response === "true" || response === "" || response === null || response === undefined) {
				console.log('🔍 [DEBUG] 6. 响应判断: 成功')
				this.state = this.state.copyWith({
					isLoading: false,
					error: null
				})
				this._notify()
				console.log('🔍 [DEBUG] 7. 状态已更新为成功')

				await trackingService.trackEvent('send_code_success', {
					user_id: phone,
					send_time: new Date().toISOString()
				})

				console.log('✅ [Auth] 验证码发送成功')
				console.log('🔍 [DEBUG] ========== sendCode 结束 ==========')
				return true
			} else {
				console.log('🔍 [DEBUG] 6. 响应判断: 失败', response)
				throw new Error(response?.message || '发送验证码失败')
			}
		} catch (error) {
			console.error('❌ [Auth] 发送验证码失败:', error)
			console.log('🔍 [DEBUG] 8. 捕获异常:', {
				message: error.message,
				stack: error.stack
			})

			this.state = this.state.copyWith({
				isLoading: false,
				error: error.message || '发送验证码失败，请重试'
			})
			this._notify()
			console.log('🔍 [DEBUG] 9. 状态已更新为错误')

			await trackingService.trackEvent('send_code_failed', {
				user_id: phone,
				error: error.message,
				send_time: new Date().toISOString()
			})
			console.log('🔍 [DEBUG] ========== sendCode 失败结束 ==========')
			return false
		}
	}

	// 2. 登录逻辑
	async loginBySms(phone, code) {
		console.log('🔍 [DEBUG] ========== loginBySms 开始 ==========')
		console.log('🔍 [DEBUG] 1. 输入参数:', { phone, code, codeLength: code.length })
		console.log('🔍 [DEBUG] 2. 当前状态:', {
			isLoading: this.state.isLoading,
			isLoggedIn: this.state.isLoggedIn,
			token: this.state.token
		})
		console.log('🔍 [DEBUG] 3. userStore 当前状态:', {
			phone: userStore.user?.phone,
			isLoggedIn: userStore.user?.isLoggedIn,
			deviceBound: userStore.user?.deviceBound,
			newUser: userStore.user?.newUser
		})
		console.log('🔍 [DEBUG] 4. 本地存储检查:', {
			hasUser: !!uni.getStorageSync('user_profile'),
			userData: uni.getStorageSync('user_profile'),
			hasToken: !!uni.getStorageSync('token'),
			tokenData: uni.getStorageSync('token')
		})

		this.state = this.state.copyWith({
			isLoading: true,
			error: null
		})
		this._notify()
		console.log('🔍 [DEBUG] 5. 状态已更新为 loading')

		try {
			console.log(' [Auth] 准备验证登录:', { phone, codeLength: code.length })

			const response = await loginBySms(phone, code)
			console.log('🔍 [DEBUG] 6. API 原始响应:', response)
			console.log('🔍 [DEBUG] 7. 响应类型:', typeof response)
			console.log('🔍 [DEBUG] 8. 响应.phone:', response?.phone, '请求.phone:', phone)
			console.log(' [Auth] 登录响应:', response)

			// 修复：根据实际API返回格式判断登录成功
			if (response && (response.phone === phone)) {
				console.log('🔍 [DEBUG] 9. 登录成功判断: 是')
				// 1. 更新用户认证状态（不需要 token，后端使用手机号作为唯一标识）
				await userStore.setAuth({
					phone: phone,
					deviceBound: response.deviceBound !== undefined ? response.deviceBound : false,
					newUser: response.newUser !== undefined ? response.newUser : true
				})
				console.log('🔍 [DEBUG] 10. userStore 已更新')
				console.log('🔍 [DEBUG] 11. userStore 当前状态:', {
					phone: userStore.user?.phone,
					isLoggedIn: userStore.user?.isLoggedIn,
					deviceBound: userStore.user?.deviceBound,
					newUser: userStore.user?.newUser
				})

				// 2. 更新 AuthViewModel 状态
				this.state = this.state.copyWith({
					isLoading: false,
					isLoggedIn: true,
					error: null
				})
				this._notify()
				console.log('🔍 [DEBUG] 12. AuthViewModel 状态已更新')

				// 3. 登录成功，跳转逻辑由 userStore.setAuth() 中的 _checkAndNavigateToDeviceBound() 处理
				// 注意：这里不再调用 navigateAfterLogin()，避免重复跳转

				// 4. 埋点
				await trackingService.trackEvent('login_success', {
					user_id: phone,
					login_time: new Date().toISOString(),
					login_method: 'sms'
				})

				console.log('✅ [Auth] 短信验证登录成功')
				console.log('🔍 [DEBUG] ========== loginBySms 成功结束 ==========')
				return true
			} else {
				console.log('🔍 [DEBUG] 9. 登录成功判断: 否')
				console.log('🔍 [DEBUG] 10. response:', response)
				console.log('🔍 [DEBUG] 11. response.phone:', response?.phone, '请求.phone:', phone)
				throw new Error(response?.message || '登录失败')
			}
		} catch (error) {
			console.error('❌ [Auth] 登录失败:', error)
			console.log('🔍 [DEBUG] 13. 捕获异常:', {
				message: error.message,
				stack: error.stack
			})

			this.state = this.state.copyWith({
				isLoading: false,
				isLoggedIn: false,
				error: error.message || '登录失败，请重试'
			})
			this._notify()
			console.log('🔍 [DEBUG] 14. 状态已更新为错误')

			await trackingService.trackEvent('login_failed', {
				user_id: phone,
				error: error.message,
				login_time: new Date().toISOString()
			})
			console.log('🔍 [DEBUG] ========== loginBySms 失败结束 ==========')
			return false
		}
	}

	// 3. 绑定设备
	async bindDevice(phone, sn) {
		this.state = this.state.copyWith({
			isLoading: true,
			error: null
		})
		this._notify()

		console.log(' [Auth] 准备绑定设备:', { phone, sn })

		try {
			// 调用真正的绑定设备 API
			const result = await bindDevice(phone, sn)
			console.log('✅ [Auth] 绑定设备API响应:', result)

			// 更新设备绑定状态
			await userStore.setAuth({
				phone: userStore.user.phone || phone,
				deviceBound: true,
				newUser: true, // 保持新用户状态，触发跳转到编辑信息页面
				deviceId: sn
			})

			this.state = this.state.copyWith({
				isLoading: false,
				error: null
			})
			this._notify()

			console.log('✅ [Auth] 设备绑定成功')
			return true
		} catch (e) {
			console.error('❌ [Auth] 绑定设备失败:', e)
			this.state = this.state.copyWith({
				isLoading: false,
				error: e.message || '设备绑定失败'
			})
			this._notify()
			return false
		}
	}

	// 4. 解绑设备 (合并修正版 - 带超时和重试)
	async unbindDevice(phone) {
		const MAX_RETRY = 2
		const UNBIND_TIMEOUT = 5000

		for (let i = 0; i <= MAX_RETRY; i++) {
			try {
				console.log(`[Auth] 解绑设备尝试 ${i + 1}/${MAX_RETRY + 1}: ${phone}`)

				// 使用超时控制
				const unbindPromise = apiUnbindDevice(phone)
				const timeoutPromise = new Promise((_, reject) => {
					setTimeout(() => reject(new Error('解绑接口超时')), UNBIND_TIMEOUT)
				})

				const res = await Promise.race([unbindPromise, timeoutPromise])

				if (res) {
					console.log('✅ [Auth] 解绑设备成功')
					return true
				}

				if (i < MAX_RETRY) {
					// 等待后重试
					await new Promise(resolve => setTimeout(resolve, 1000))
				}
			} catch (e) {
				console.warn(`⚠️ [Auth] 解绑设备失败 (尝试 ${i + 1}/${MAX_RETRY + 1}):`, e.message)

				if (i < MAX_RETRY) {
					// 等待后重试
					await new Promise(resolve => setTimeout(resolve, 1000))
				} else {
					// 最后一次尝试失败，抛出错误
					console.error('❌ [Auth] 解绑设备所有尝试均失败')
					throw e
				}
			}
		}

		return false
	}

	// 5. App启动检查
	async checkInitialState() {
		const phone = userStore.phone
		if (!userStore.isLoggedIn || !phone) return

		this.state = this.state.copyWith({
			isLoading: true,
			error: null
		})
		this._notify()

		try {
			const statusData = await checkUserStatus(phone)
			if (statusData) {
				const isDeviceBound = statusData.deviceBound || false
				const isNewUser = statusData.newUser || false

				userStore.updateUser({
					isLoggedIn: true,
					phone: phone,
					deviceBound: isDeviceBound,
					profileCompleted: !isNewUser
				})
			}
		} catch (e) {
			console.log('状态检查异常:', e)
		} finally {
			this.state = this.state.copyWith({
				isLoading: false,
				initialized: true
			})
			this._notify()
		}
	}

	logout() {
		trackingService.trackLogout()
		userStore.logout()
		this.state = AuthState.initial().copyWith({
			isLoggedIn: false
		})
		this._notify()
	}

	setInitialized() {
		this.state = this.state.copyWith({
			isLoading: false,
			initialized: true
		})
		this._notify()
	}
}

const authViewModel = new AuthViewModel()
export default authViewModel