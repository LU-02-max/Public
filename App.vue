<script>
	import { initRouter } from '@/utils/router.js'
	import { useAppLifecycle } from '@/utils/app-lifecycle.js'
	import userStore from '@/store/user.js'
	import { getFamilyProfile } from '@/api.js'

	export default {
		data() {
			return {
				appLifecycleUnlisten: null,
				backgroundTimestamp: null
			}
		},
		onLaunch: function() {
			console.log('🚀 App Launch - 话痨同桌')

			// 1. 路由初始化
			initRouter()

			// 2. 微信小程序版本更新检查
			this.checkUpdate()

			// 3. 延迟绑定生命周期管理器
			setTimeout(() => {
				this.setupAppLifecycle()
				this.setupExitMonitoring()
			}, 100)
		},
		onShow: function() {
			console.log('📱 App Show')

			// 检查是否从后台恢复，执行状态验证
			if (this.backgroundTimestamp) {
				const backgroundDuration = Date.now() - this.backgroundTimestamp
				console.log(`⏰ 应用从后台恢复，离线时长: ${Math.floor(backgroundDuration / 1000)}秒`)
				this.handleAppResume(backgroundDuration)
			}
		},
		onHide: function() {
			console.log('📱 App Hide - 应用进入后台')
			this.backgroundTimestamp = Date.now()
			this.handleAppHide()
		},
		methods: {
			/**
			 * 绑定生命周期到全局管理器
			 */
			setupAppLifecycle() {
				const manager = useAppLifecycle()
				this.appLifecycleUnlisten = manager.listen((previousState, currentState) => {
					console.log(`🔄 应用生命周期变化: ${previousState} -> ${currentState}`)

					if (currentState === 'resumed') {
						this.handleAppResume()
					} else if (currentState === 'paused') {
						this.handleAppHide()
					}
				})
			},

			/**
			 * 设置退出监听（生命周期兜底）
			 * 监听应用退出、切换账号、长时间后台等情况
			 */
			setupExitMonitoring() {
				console.log('🛡️ [ExitMonitor] 设置退出监听器')

				// 订阅用户状态变化，检测登出操作
				userStore.subscribe((user) => {
					// 如果用户从已登录变为未登录，触发退出清理
					if (!user.isLoggedIn && !user.phone) {
						console.log('👋 [ExitMonitor] 检测到用户登出，执行清理')
						this.handleUserLogout()
					}
				})
			},

		/**
		 * 应用恢复时的处理（onShow）
		 * 区分后台关闭和主动退出：
		 * - 后台关闭恢复：保留登录态，继续使用
		 * - 主动退出：已在 clearAndExit() 中清理，跳转登录页
		 * @param {Number} backgroundDuration 后台停留时长（毫秒）
		 */
		async handleAppResume(backgroundDuration = 0) {
			console.log('✨ [Resume] 应用恢复前台')
			console.log('📊 [Resume] 当前存储状态:', {
				hasUser: !!uni.getStorageSync('user_profile'),
				hasToken: !!uni.getStorageSync('token'),
				lastKnownBackendProfile: uni.getStorageSync('last_known_backend_profile')
			})

			// 1. 强制重新加载用户数据，确保内存状态与磁盘存储一致
			try {
				userStore.loadUser()
				console.log('🔄 [Resume] 用户数据重新加载完成')
			} catch (error) {
				console.error('❌ [Resume] 重新加载用户数据失败:', error)
			}

			const user = userStore.user

			// 检查是否是主动退出后重新进入
			// 主动退出后 user.isLoggedIn 应该为 false
			if (!user || !user.isLoggedIn) {
				console.log('⚠️ [Resume] 用户未登录或已主动退出，保持在登录页')
				// 不跳转，让路由系统自然处理
				return
			}

			// 用户已登录，从后台恢复，保持登录态
			console.log('✅ [Resume] 用户已登录，恢复登录态')

			// 2. 检查是否需要从后端同步数据（解决多设备数据同步问题）
			const shouldSync = await this._shouldSyncFromBackend(backgroundDuration)
			
			if (shouldSync) {
				console.log('⏰ [Resume] 触发后端数据同步检查')
				
				try {
					// 异步从后端拉取最新用户资料
					await this.syncProfileFromBackend(user.phone)
					console.log('✅ [Resume] 后端数据同步完成')
					
					// 更新同步时间戳
					uni.setStorageSync('last_profile_sync', Date.now())
				} catch (error) {
					console.warn('⚠️ [Resume] 后端数据同步失败，使用本地缓存:', error)
				}
			} else {
				console.log('📱 [Resume] 近期已同步，使用本地缓存')
			}
		},

		/**
		 * 应用进入后台时的处理（onHide）
		 * 注意：后台关闭 ≠ 主动退出
		 * - 后台关闭：保留登录态，下次启动自动恢复
		 * - 主动退出：清空数据、解绑设备
		 */
		handleAppHide() {
			console.log('😴 [Hide] 应用进入后台')

			// 保存当前时间戳，用于判断后台停留时长
			this.backgroundTimestamp = Date.now()

			// 保留登录态，不执行任何清理操作
			// 这样用户从后台恢复时可以直接使用，无需重新登录
		},

			/**
			 * 用户登出时的处理
			 */
			handleUserLogout() {
				console.log('👋 [Logout] 用户登出，清理资源')

				// 1. 清理缓存数据
				try {
					// 清理一些特定缓存，保留必要的系统缓存
					const keysToRemove = ['user_profile', 'token', 'last_profile_sync', 'last_known_backend_profile']
					keysToRemove.forEach(key => {
						try {
							uni.removeStorageSync(key)
						} catch (e) {
							console.warn(`清理缓存失败: ${key}`, e)
						}
					})
				} catch (e) {
					console.error('清理缓存失败', e)
				}

				// 2. 取消生命周期监听（防止内存泄漏）
				if (this.appLifecycleUnlisten) {
					this.appLifecycleUnlisten()
					this.appLifecycleUnlisten = null
				}
			},

			/**
			 * 从后端同步用户资料
			 * @param {String} phone 用户手机号
			 */
			async syncProfileFromBackend(phone) {
				if (!phone) {
					console.warn('⚠️ [Sync] 无法同步：用户手机号为空')
					return
				}

				console.log('🌐 [Sync] 正在从后端同步用户资料...')

				try {
					const profileData = await getFamilyProfile(phone)

					if (profileData && (profileData.childNickname || profileData.username)) {
						console.log('📥 [Sync] 获取到后端最新资料:', profileData.childNickname || profileData.username)

						// 更新用户存储
						await userStore.updateProfile(profileData)
						console.log('✅ [Sync] 用户资料同步成功')
					} else {
						console.warn('⚠️ [Sync] 后端返回数据格式异常:', profileData)
					}
				} catch (error) {
					console.error('❌ [Sync] 后端数据同步失败:', error)
					throw error // 重新抛出错误，让调用方处理
				}
			},

			/**
			 * 判断是否需要从后端同步数据
			 * 策略：解决多设备数据同步问题
			 * @param {Number} backgroundDuration 后台停留时长
			 * @returns {Boolean} 是否需要同步
			 */
			async _shouldSyncFromBackend(backgroundDuration) {
				const now = Date.now()
				const lastSyncTime = uni.getStorageSync('last_profile_sync') || 0
				const timeSinceLastSync = now - lastSyncTime
				
				// 同步策略参数
				const LONG_BACKGROUND_THRESHOLD = 30 * 60 * 1000 // 30分钟：长时间后台
				const NORMAL_SYNC_THRESHOLD = 5 * 60 * 1000 // 5分钟：常规同步间隔
				const QUICK_CHECK_THRESHOLD = 2 * 60 * 1000 // 2分钟：快速检查间隔
				
				// 强制同步条件：长时间后台
				if (backgroundDuration > LONG_BACKGROUND_THRESHOLD) {
					console.log('⏰ [Resume] 长时间后台恢复，强制同步')
					return true
				}
				
				// 常规同步条件：超过正常同步间隔
				if (timeSinceLastSync > NORMAL_SYNC_THRESHOLD) {
					console.log('⏰ [Resume] 超过正常同步间隔，触发同步')
					return true
				}
				
				// 快速检查条件：超过快速检查间隔，进行轻量检查
				if (timeSinceLastSync > QUICK_CHECK_THRESHOLD) {
					// 检查是否有后端版本记录
					const lastKnownBackendProfile = uni.getStorageSync('last_known_backend_profile')
					if (!lastKnownBackendProfile || typeof lastKnownBackendProfile !== 'object') {
						console.log('📊 [Resume] 无后端版本记录，创建初始记录')
						return false // 首次使用，不需要同步
					}
					
					// 这里可以添加更智能的逻辑，比如对比本地数据和已知后端版本
					// 暂时保持轻量检查
					console.log('⚡ [Resume] 快速检查间隔，不强制同步')
					return false
				}
				
				// 其他情况不需要同步
				console.log('📱 [Resume] 近期已同步，跳过同步检查')
				return false
			},

			/**
			 * 微信小程序版本更新检查
			 */
			checkUpdate() {
				// #ifdef MP-WEIXIN
				if (uni.canIUse('getUpdateManager')) {
					const updateManager = uni.getUpdateManager()

					updateManager.onCheckForUpdate(function(res) {
						if (res.hasUpdate) {
							console.log('📦 发现新版本')
						}
					})

					updateManager.onUpdateReady(function() {
						uni.showModal({
							title: '更新提示',
							content: '新版本已经准备好，是否重启应用？',
							success: function(res) {
								if (res.confirm) {
									updateManager.applyUpdate()
								}
							}
						})
					})

					updateManager.onUpdateFailed(function() {
						console.error('新版本下载失败')
						uni.showToast({
							title: '更新失败',
							icon: 'none'
						})
					})
				}
				// #endif
			}
		}
	}
</script>

<style lang="scss">
	/* 全局公共样式 */
	page {
		background-color: #F7F7F7;
		font-size: 28rpx;
		color: #333333;
		line-height: 1.6;
		/* 建议统一设置高度 */
		height: 100%;
		width: 100%;
	}

	/* 布局辅助类 */
	view, text, image, scroll-view {
		box-sizing: border-box;
	}

	.flex { display: flex; }
	.flex-column { display: flex; flex-direction: column; }
	.flex-center { display: flex; align-items: center; justify-content: center; }
	.flex-between { display: flex; align-items: center; justify-content: space-between; }
	.flex-1 { flex: 1; }

	/* 文字处理 */
	.text-center { text-align: center; }
	.ellipsis {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* 这里的 background 记得在实际运行时检查图片路径 */
</style>