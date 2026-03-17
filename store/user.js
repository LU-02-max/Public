/**
 * store/user.js
 * 全局用户状态管理（中央大脑）
 */
import {
	saveUser,
	getUser,
	removeUser
} from '@/utils/storage.js'

import {
	TEST_PHONE,
	DEV_MODE,
	DEV_CLEANUP,
	FORCE_CLEAR_ALL,
	ROUTES,
	TIME_CONSTANTS,
	USER_DEFAULTS
} from '@/config/constants.js'

import log from '@/utils/logger.js'

import http from '@/utils/request.js'

class UserStore {
	constructor() {
		this._isSaving = false
		this._listeners = [] // 订阅者队列
		
		// 1. 默认初始化为空白状态
		this.user = this.resetToEmpty()

		// 2. 执行核心初始化逻辑
		this.init()
	}

	/**
	 * [核心] 初始化逻辑
	 * 逻辑：智能加载用户数据，避免强制清除
	 */
	init() {
		log.info('正在启动初始化检查')

		// 1. 尝试从本地磁盘加载上次保存的真实数据
		this.loadUser()

		// 2. 保留紧急清除功能，但仅通过配置文件控制
		if (FORCE_CLEAR_ALL) {
			log.warn('FORCE_CLEAR_ALL=true，执行紧急数据清除')
			this._clearAllData()
			return
		}

		// 3. 智能清理：仅清理明确的测试数据
		if (DEV_CLEANUP && this._isTestData()) {
			log.info('检测到测试数据且 DEV_CLEANUP=true，执行智能清理')
			this._clearTestData()
		}

		// 4. 数据完整性检查和修复
		this._validateAndRepairData()

		// 5. 逻辑判断：报告当前状态
		if (this.user.phone) {
			log.info(`成功恢复用户状态: ${this.user.childNickname || '未设置昵称'} (${this.user.phone})`)
		} else {
			log.info('纯净状态，等待登录')
		}
	}

	/**
	 * [内部] 检测是否为测试数据
	 * 更加严格的测试数据判断，避免误删真实用户数据
	 */
	_isTestData() {
		const user = this.user;
		// 同时满足多个条件才认为是测试数据
		const isTestPhone = user.phone === TEST_PHONE || (user.phone && user.phone.startsWith('199'));
		const isTestNickname = user.childNickname === '小可爱';
		const isTestUsername = user.username === '开发调试模式';

		// 必须同时满足：手机号是测试号 AND (昵称是测试昵称 OR 用户名是测试用户名)
		return isTestPhone && (isTestNickname || isTestUsername);
	}

	/**
	 * [清理] 仅清理测试数据（智能清理）
	 */
	_clearTestData() {
		try {
			log.info('执行测试数据清理')

			// 仅清除明确的测试数据
			if (this._isTestData()) {
				this.user = this.resetToEmpty()
				removeUser()
				log.info('测试数据已清理')
			} else {
				log.info('检测到真实用户数据，保留原状')
			}

			this._notifyListeners()
		} catch (e) {
			log.error('清理测试数据失败', e)
		}
	}

	/**
	 * [紧急] 清除所有数据（包含页面跳转）
	 * 添加确认机制，避免误操作
	 */
	_clearAllData() {
		log.warn('执行紧急清除所有数据')
		const confirmed = uni.getStorageSync('confirm_clear_data');

		// 生产环境需要额外确认
		if (!confirmed && !DEV_MODE) {
			log.warn('生产环境清除数据需要确认，已取消操作');
			return;
		}

		this.user = this.resetToEmpty()

		// 清理所有存储
		try {
			uni.clearStorageSync()
			log.info('所有本地存储数据已清除')
		} catch (e) {
			log.error('清除存储失败', e)
		}

		this._notifyListeners()
	}

	/**
	 * [验证] 数据完整性检查和修复
	 */
	_validateAndRepairData() {
		const user = this.user
		let needsRepair = false

		// 检查关键字段完整性
		if (!user.childGender || !['男', '女'].includes(user.childGender)) {
			user.childGender = USER_DEFAULTS.CHILD_GENDER
			needsRepair = true
		}

		if (!user.parentRelationship) {
			user.parentRelationship = USER_DEFAULTS.PARENT_RELATIONSHIP
			needsRepair = true
		}

		if (needsRepair) {
			log.info('数据完整性修复完成')
			this._saveUser()
		}
	}

	/**
	 * [逻辑] 定义初始空白状态
	 */
	resetToEmpty() {
		return {
			phone: '',
			isLoggedIn: false,
			deviceBound: false,
			deviceId: '',
			newUser: true,
			hasSeenWelcome: false,
			username: '',
			childNickname: '', 
			childGender: '',
			childBirthdate: '',
			parentRelationship: '',
			familyProfile: null,
			probabilities: []
		}
	}

	/**
	 * [函数] 登录认证成功
	 */
	async setAuth(verifyData) {
		log.info('认证信息更新', verifyData)

		// 更新认证状态
		this.user.phone = verifyData.phone || this.user.phone
		this.user.isLoggedIn = true
		this.user.deviceBound = !!verifyData.deviceBound
		this.user.newUser = verifyData.newUser

		// 更新设备ID（如果提供）
		if (verifyData.deviceId) {
			this.user.deviceId = verifyData.deviceId
		}

		await this._saveUser()
		this._notifyListeners()

		// 检查是否需要跳转到编辑信息页面
		this._checkAndNavigateToDeviceBound()
	}

	/**
	 * [内部] 检查设备绑定状态并跳转
	 * 流程：登录 → 绑定设备 → 保存信息 → 进场动画 → 客服微信 → 首页
	 */
	_checkAndNavigateToDeviceBound() {
		console.log('🔍 [DEBUG] ========== _checkAndNavigateToDeviceBound 开始 ==========')
		console.log('🔍 [DEBUG] 1. 当前状态:', {
			deviceBound: this.user.deviceBound,
			newUser: this.user.newUser,
			isLoggedIn: this.user.isLoggedIn
		})

		// 修复：根据设备绑定状态决定跳转
		if (this.user.deviceBound) {
			if (this.user.newUser) {
				// 设备已绑定且是新用户，跳转到编辑资料页面
				console.log('🔍 [DEBUG] 2. 判断: 设备已绑定且是新用户，准备跳转到编辑信息页面')
				log.info('检测到设备已绑定且是新用户，跳转到编辑信息页面')
				setTimeout(() => {
					console.log('🔍 [DEBUG] 3. 开始跳转到编辑信息页面')
					uni.redirectTo({
						url: ROUTES.EDIT_PROFILE,
						success: () => {
							console.log('🔍 [DEBUG] 4. 跳转编辑信息页面成功')
							log.info('成功跳转到编辑信息页面')
						},
						fail: (err) => {
							console.log('🔍 [DEBUG] 5. 跳转编辑信息页面失败:', err)
							log.error('跳转编辑信息页面失败', err)
						}
					})
				}, TIME_CONSTANTS.NAVIGATION_DELAY)
			} else {
				// 设备已绑定且是老用户，跳转到首页
				console.log('🔍 [DEBUG] 2. 判断: 设备已绑定且是老用户，准备跳转到首页')
				log.info('检测到设备已绑定且是老用户，跳转到首页')
				setTimeout(() => {
					console.log('🔍 [DEBUG] 3. 开始跳转到首页')
					uni.switchTab({
						url: '/pages/index/index',
						success: () => {
							console.log('🔍 [DEBUG] 4. 跳转首页成功')
							log.info('成功跳转到首页')
						},
						fail: (err) => {
							console.log('🔍 [DEBUG] 5. 跳转首页失败:', err)
							log.error('跳转首页失败', err)
						}
					})
				}, TIME_CONSTANTS.NAVIGATION_DELAY)
			}
		} else {
			// 设备未绑定，跳转到设备绑定页面
			console.log('🔍 [DEBUG] 2. 判断: 设备未绑定，准备跳转到设备绑定页面')
			log.info('检测到设备未绑定，跳转到设备绑定页面')
			setTimeout(() => {
				console.log('🔍 [DEBUG] 3. 开始跳转到设备绑定页面')
				uni.redirectTo({
					url: '/pages/sub_profile/bindDevice',
					success: () => {
						console.log('🔍 [DEBUG] 4. 跳转设备绑定页面成功')
						log.info('成功跳转到设备绑定页面')
					},
					fail: (err) => {
						console.log('🔍 [DEBUG] 5. 跳转设备绑定页面失败:', err)
						log.error('跳转设备绑定页面失败', err)
					}
				})
			}, TIME_CONSTANTS.NAVIGATION_DELAY)
		}
		console.log('🔍 [DEBUG] ========== _checkAndNavigateToDeviceBound 结束 ==========')
	}

	/**
	 * [函数] 更新用户信息（关键：解决显示"小可爱"的问题）
	 * 只要从后端拉取到真实姓名，就调用此函数
	 */
	async updateProfile(profileData) {
		log.info('收到数据库最新资料', profileData)

		// 逻辑：优先取后端字段 childNickname
		const realNickname = profileData.childNickname || profileData.username

		if (realNickname) {
			this.user.childNickname = realNickname
			this.user.username = realNickname
		}

		if (profileData.parentRelationship) this.user.parentRelationship = profileData.parentRelationship
		if (profileData.childGender) this.user.childGender = profileData.childGender
		if (profileData.childBirthdate) this.user.childBirthdate = profileData.childBirthdate

		// 更新绑定状态（防止重新编译后首页认为未绑定）
		if (profileData.deviceSn) {
			this.user.deviceBound = true
			this.user.deviceId = profileData.deviceSn
		}

		this.user.familyProfile = profileData

		await this._saveUser()
		this._notifyListeners()
	}

	/**
	 * [内部函数] 从本地磁盘恢复数据，可选从后端同步
	 * 添加数据完整性验证
	 * @param {Boolean} syncFromBackend 是否从后端同步最新数据
	 */
	async loadUser(syncFromBackend = false) {
		try {
			const stored = getUser()
			console.log('🔍 [DEBUG] loadUser - 读取到的存储数据:', stored)

			if (stored) {
				const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored

				// 验证数据完整性，避免加载损坏的数据
				if (parsed && typeof parsed === 'object' && 'phone' in parsed) {
					// 逻辑：将磁盘数据覆盖到初始数据上
					this.user = Object.assign({}, this.user, parsed)
					console.log('🔍 [DEBUG] loadUser - 加载后的 user 状态:', this.user)
					log.info('磁盘数据载入成功')

					// 如果需要从后端同步，且用户已登录
					if (syncFromBackend && this.user.isLoggedIn && this.user.phone) {
						await this._syncFromBackendIfNeeded()
					}
				} else {
					log.warn('磁盘数据格式异常，使用默认初始状态')
				}
			} else {
				console.log('🔍 [DEBUG] loadUser - 本地存储为空')
			}
		} catch (e) {
			console.log('🔍 [DEBUG] loadUser - 异常:', e)
			log.error('载入磁盘数据失败', e)
		}
	}

	/**
	 * [内部] 从后端同步数据（如果需要）
	 * 修复：检测远程数据变更，不只是时间间隔
	 */
	async _syncFromBackendIfNeeded() {
		try {
			const now = Date.now()
			const lastSyncTime = uni.getStorageSync('last_profile_sync') || 0
			const SYNC_INTERVAL = 5 * 60 * 1000 // 5分钟同步一次
			const ALWAYS_CHECK_INTERVAL = 30 * 60 * 1000 // 30分钟强制检查一次
			
			// 检查是否需要同步：时间间隔 OR 强制检查间隔
			const timeSinceLastSync = now - lastSyncTime
			const shouldCheckByTime = timeSinceLastSync > SYNC_INTERVAL
			const shouldForceCheck = timeSinceLastSync > ALWAYS_CHECK_INTERVAL
			
			// 如果没有达到检查时间，跳过后端请求（节省网络资源）
			if (!shouldCheckByTime && !shouldForceCheck) {
				console.log('⏰ [Sync] 近期已同步，跳过后端请求')
				return
			}
			
			console.log('🌐 [Sync] 正在从后端同步最新用户资料...')
			
			const phone = this.user.phone

			if (!phone) {
				console.warn('⚠️ [Sync] 无法同步：用户手机号为空')
				return
			}

			const profileData = await http.get(`/parent/${phone}/family-profile`)
			
			if (profileData && (profileData.childNickname || profileData.username)) {
				console.log('📥 [Sync] 获取到后端最新资料:', profileData.childNickname || profileData.username)
				
				// 存储最后已知的后端版本（用于多设备同步检测）
				const lastKnownProfile = uni.getStorageSync('last_known_backend_profile') || {}
				const currentProfileKey = `${profileData.childNickname || ''}-${profileData.parentRelationship || ''}-${profileData.childBirthdate || ''}`
				const lastKnownKey = `${lastKnownProfile.childNickname || ''}-${lastKnownProfile.parentRelationship || ''}-${lastKnownProfile.childBirthdate || ''}`
				
				// 检查数据是否有变化（与本地对比）
				const hasChanges = 
					profileData.childNickname !== this.user.childNickname ||
					profileData.childGender !== this.user.childGender ||
					profileData.childBirthdate !== this.user.childBirthdate ||
					profileData.parentRelationship !== this.user.parentRelationship
				
				// 检查后端数据是否与上次已知的版本不同（检测其他设备修改）
				const backendChanged = currentProfileKey !== lastKnownKey
				
				if (hasChanges || backendChanged) {
					console.log('🔄 [Sync] 检测到数据变化，更新本地存储', {
						hasChanges,
						backendChanged,
						remoteKey: currentProfileKey,
						lastKnownKey: lastKnownKey
					})
					
					// 更新本地存储
					await this.updateProfile(profileData)
					
					// 存储当前后端版本
					uni.setStorageSync('last_known_backend_profile', {
						childNickname: profileData.childNickname || '',
						parentRelationship: profileData.parentRelationship || '',
						childBirthdate: profileData.childBirthdate || '',
						timestamp: now
					})
				} else {
					console.log('✅ [Sync] 数据无变化，保持现状')
				}
				
				// 更新同步时间戳
				uni.setStorageSync('last_profile_sync', now)
				console.log('✅ [Sync] 同步流程完成')
			} else {
				console.warn('⚠️ [Sync] 后端返回数据格式异常:', profileData)
			}
		} catch (error) {
			console.error('❌ [Sync] 后端数据同步失败:', error)
			// 不抛出错误，静默失败，使用本地数据
		}
	}

	/**
	 * [内部函数] 持久化保存
	 * 添加保存防抖和数据验证
	 */
	async _saveUser() {
		try {
			// 防止保存过程中的并发问题
			if (this._isSaving) {
				log.warn('正在保存中，跳过本次保存请求')
				return
			}

			this._isSaving = true

			// 验证数据完整性
			if (!this.user || typeof this.user !== 'object') {
				throw new Error('用户数据格式异常')
			}

			await saveUser(JSON.stringify(this.user))
			log.info('数据已持久化到磁盘')
		} catch (e) {
			log.error('写入磁盘失败', e)
			// 保存失败时尝试清理损坏的数据
			try {
				removeUser()
				log.info('已清理损坏的缓存数据')
			} catch (cleanupError) {
				log.error('清理失败数据时出错', cleanupError)
			}
		} finally {
			this._isSaving = false
		}
	}

	/**
	 * [公共] 手动保存用户数据
	 */
	async saveUserData() {
		await this._saveUser()
	}

	/**
	 * [函数] 彻底退出（带强制解绑兜底）
	 */
	async clearAndExit() {
		log.warn('执行登出清理，开始强制解绑流程')

		try {
			// 1. 尝试解绑设备（强制兜底，忽略网络错误）
			await this._forceUnbindDevice()
		} catch (e) {
			log.warn('强制解绑失败，继续清理流程', e)
		}

		// 2. 清理所有用户数据
		this._clearUserData()

		// 3. 跳转到登录页
		uni.reLaunch({ url: ROUTES.LOGIN })
	}

	/**
	 * [内部] 强制解绑设备（兜底逻辑）
	 * 即使接口失败也继续执行清理，确保用户能退出
	 */
	async _forceUnbindDevice() {
		const phone = this.user.phone
		const deviceId = this.user.deviceId

		if (!phone) {
			log.info('未登录用户，跳过解绑')
			return
		}

		log.info(`开始强制解绑流程: ${phone} -> ${deviceId || '未知设备'}`)

		try {
			// 尝试调用解绑接口（设置超时防止卡住）
			const unbindPromise = import('@/api.js').then(api => api.unbindDevice(phone))
			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(() => reject(new Error('解绑接口超时')), 5000)
			})

			await Promise.race([unbindPromise, timeoutPromise])
			log.info('✅ 强制解绑接口调用成功')
		} catch (e) {
			// 即使接口失败，也记录但继续执行
			log.warn('⚠️ 强制解绑接口调用失败，但这不影响退出流程', e.message)
		}
	}

	/**
	 * [内部] 清理用户数据（修复：确保彻底清除）
	 */
	_clearUserData() {
		log.warn('清理用户数据')

		// 1. 先重置内存数据为初始空白状态
		this.user = this.resetToEmpty()

		// 2. 清理所有存储（强制清除，确保彻底）
		try {
			// 尝试清理所有可能的存储项
			const keys = [
				'user',
				'user_profile',
				'phone',
				'gender',
				'birthday',
				'nickname',
				'deviceId',
				'device_sn',
				'isLoggedIn',
				'deviceBound',
				'profileCompleted',
				'isFirst',
				'confirm_clear_data',
				'last_profile_sync',
				'last_known_backend_profile'
			]
			keys.forEach(key => {
				try {
					uni.removeStorageSync(key)
				} catch (e) {
					// 忽略单个key删除失败
				}
			})

			// 最后再清除整个存储
			uni.clearStorageSync()
			log.info('✅ 所有本地存储数据已彻底清除')
		} catch (e) {
			log.error('清除存储失败', e)
		}

		// 3. 再次确保内存数据已重置（双重保险）
		this.user = this.resetToEmpty()

		// 4. 通知订阅者，确保所有页面感知到状态变化
		this._notifyListeners()
	}

	/**
	 * [函数] 标记首次初始化完成（看完欢迎动画后调用）
	 */
	async completeFirstInitialization() {
		this.user.newUser = false
		this.user.hasSeenWelcome = true
		await this._saveUser()
		this._notifyListeners()
		log.info('首次初始化完成，标记为非新用户')
	}

	/**
	 * [函数] 登出（仅清除状态，不跳转）
	 */
	logout() {
		log.info('执行登出操作')

		// 重置用户状态
		this.user = this.resetToEmpty()

		// 通知订阅者
		this._notifyListeners()
	}

	// 订阅与广播逻辑保持不变...
	subscribe(callback) {
		this._listeners.push(callback)
		return () => {
			this._listeners = this._listeners.filter(l => l !== callback)
		}
	}

	_notifyListeners() {
		this._listeners.forEach(callback => callback(this.user))
	}
}

const userStore = new UserStore()
export default userStore