<template>
	<view class="login-page">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<text class="nav-title">登录</text>
		</view>

		<!-- 主体内容 -->
		<view class="login-content">
			<!-- 欢迎文案 -->
			<view class="welcome-section">
				<text class="welcome-title">欢迎回来！</text>
				<text class="welcome-subtitle">开启属于宝贝的壮游之旅吧！</text>
			</view>

			<!-- 表单区域 -->
			<view class="form-container">
				<!-- 手机号输入 -->
				<view class="form-item">
					<view class="input-box">
						<text class="input-icon"></text>
						<input
							type="number"
							placeholder="请输入手机号"
							v-model="phoneNumber"
							maxlength="11"
							class="input-field"
							placeholder-class="input-placeholder"
							@input="onPhoneInput"
						/>
					</view>
				</view>

				<!-- 验证码输入 -->
				<view class="form-item">
					<view class="input-box code-box">
						<text class="input-icon"></text>
						<input
							ref="verifyCodeInput"
							type="number"
							placeholder="请输入验证码"
							v-model="verifyCode"
							maxlength="6"
							class="input-field"
							placeholder-class="input-placeholder"
						/>
						<button
							class="code-btn"
							:disabled="isCountingDown || authState.isLoading || isSendingCode"
							@click.stop="handleSendCode"
						>
							{{ isSendingCode ? '发送中...' : (isCountingDown ? `${countdown}s` : '获取验证码') }}
						</button>
					</view>
				</view>
			</view>

			<!-- 协议区域 -->
			<view class="agreement-area">
				<view class="agreement-check" @click="toggleAgreement">
					<view class="check-box" :class="{ 'checked': agreementAccepted }">
						<text v-if="agreementAccepted" class="check-icon">✓</text>
					</view>
					<text class="agreement-text">
						我已阅读并同意
						<text class="agreement-link" @click.stop="showAgreement('privacy')">《隐私政策》</text>、
						<text class="agreement-link" @click.stop="showAgreement('service')">《服务条款》</text>、
						<text class="agreement-link" @click.stop="showAgreement('member')">《会员服务协议》</text>及
						<text class="agreement-link" @click.stop="showAgreement('child')">《儿童隐私协议》</text>
					</text>
				</view>
			</view>

			<!-- 登录按钮 -->
			<button
				class="login-btn"
				:class="{ 'btn-loading': authState.isLoading || isLoggingIn }"
				:disabled="authState.isLoading || isLoggingIn"
				@click.stop="handleLogin"
			>
				<text v-if="!authState.isLoading && !isLoggingIn">登录</text>
				<text v-else>登录中...</text>
			</button>

			<!-- 底部客服链接 -->
			<view class="footer-link">
				<text class="link-icon">ⓘ</text>
				<text class="link-text" @click="contactCustomerService">遇到问题？联系客服</text>
			</view>
		</view>

		<!-- 客服弹窗 (全新样式) -->
		<view v-if="showCustomerServiceModal" class="cs-mask" @click="closeCustomerServiceModal">
			<view class="cs-modal" @click.stop>
				<!-- 右上角跳过 -->
				<text class="cs-skip" @click="closeCustomerServiceModal">跳过</text>
				
				<!-- 内容区域 -->
				<view class="cs-content">
					<text class="cs-title">添加专属客服微信</text>
					<text class="cs-subtitle">获取 1 对 1 育儿建议与设备指导</text>
					
					
					<!-- 二维码区域 -->
					<view class="qr-wrapper">
						<image
							class="qr-image"
							src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/QRcode.png"
							mode="aspectFit"
							show-menu-by-longpress
							@longpress="saveQRCode"
						/>
					</view>
					
					<!-- 底部操作提示 (蓝色胶囊背景) -->
					<view class="action-tip">
						<text class="icon"></text>
						<text class="tip-text">长按图片自动保存到相册</text>
					</view>
					<text class="desc-text">保存后请前往微信「扫一扫」选择相册添加</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import authViewModel from '@/viewmodels/auth.js'
	import userStore from '@/store/user.js'
	import { ASSETS_PATHS } from '@/config/api.js'
	import envConfig from '@/config/env.js'

	export default {
		data() {
			return {
				// 表单数据
				phoneNumber: '',
				verifyCode: '',

				// 状态管理
				authState: authViewModel.state,
				agreementAccepted: false,

				// 验证码倒计时
				isCountingDown: false,
				countdown: 0,
				countdownTimer: null,

				// 防重复点击状态
				isSendingCode: false,
				isLoggingIn: false,

				// 监听器
				unlistenAuth: null,

				// 配置
				ASSETS_PATHS: ASSETS_PATHS,
				IMAGE_BASE: envConfig.IMAGE_BASE,

				// 系统信息
				statusBarHeight: 0,
				capsuleHeight: 0,
				capsuleTop: 0,

				// 客服弹窗
				showCustomerServiceModal: false
			}
		},

		onLoad() {
			console.log(' [DEBUG] ========== Login onLoad 开始 ==========')
			console.log(' [DEBUG] 1. 本地存储检查:', {
				hasUser: !!uni.getStorageSync('user_profile'),
				userData: uni.getStorageSync('user_profile'),
				hasToken: !!uni.getStorageSync('token'),
				tokenData: uni.getStorageSync('token')
			})
			console.log(' [DEBUG] 2. userStore 当前状态:', {
				phone: userStore.user?.phone,
				isLoggedIn: userStore.user?.isLoggedIn,
				deviceBound: userStore.user?.deviceBound,
				newUser: userStore.user?.newUser
			})
			console.log(' [DEBUG] 3. authViewModel 当前状态:', {
				isLoggedIn: authViewModel.state.isLoggedIn,
				token: authViewModel.state.token,
				isLoading: authViewModel.state.isLoading
			})

			// 修复: 检测状态不一致，智能恢复
			const hasStoredUser = !!uni.getStorageSync('user_profile')
			const isMemoryLoggedIn = userStore.user?.isLoggedIn
			const memoryPhone = userStore.user?.phone

			if (isMemoryLoggedIn && !hasStoredUser) {
				console.log(' [DEBUG] ⚠️ 检测到状态不一致: 内存已登录但本地存储为空')
				console.log(' [DEBUG]    - 内存登录状态:', isMemoryLoggedIn)
				console.log(' [DEBUG]    - 内存手机号:', memoryPhone)
				console.log(' [DEBUG]    - 本地存储有数据:', hasStoredUser)

				// 正确做法：将内存状态保存到本地存储，而不是清除
				console.log(' [DEBUG] 💾 正在同步内存状态到本地存储...')
				// 使用 then() 而不是 await，因为 onLoad 不是异步方法
				userStore.saveUserData()
					.then(() => {
						console.log(' [DEBUG] ✅ 内存状态已同步到本地存储')
						
						// 同步 authViewModel 状态
						authViewModel.state = authViewModel.state.copyWith({
							isLoggedIn: true,
							token: uni.getStorageSync('token') || null,
							error: null
						})
						console.log(' [DEBUG] ✅ AuthViewModel 状态已同步')
					})
					.catch((error) => {
						console.error(' [DEBUG] ❌ 同步状态失败:', error)
					})
			}

			console.log('[Login] 页面加载')
			this.getSystemInfo()
			this.checkLoginStatus()
			this.subscribeAuthState()

			console.log(' [DEBUG] ========== Login onLoad 结束 ==========')
		},

		onUnload() {
			console.log('[Login] 页面卸载，清理资源')
			this.cleanup()
		},

		methods: {
			/**
			 * 获取系统信息
			 */
			getSystemInfo() {
				try {
					const systemInfo = uni.getSystemInfoSync()
					this.statusBarHeight = systemInfo.statusBarHeight || 0

					// #ifdef MP-WEIXIN
					const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
					this.capsuleHeight = menuButtonInfo.height
					this.capsuleTop = menuButtonInfo.top
					// #endif

					console.log('[Login] 系统信息:', {
						statusBarHeight: this.statusBarHeight,
						capsuleHeight: this.capsuleHeight,
						capsuleTop: this.capsuleTop
					})
				} catch (error) {
					console.error('[Login] 获取系统信息失败:', error)
				}
			},

			/**
			 * 检查登录状态
			 * 修复：根据设备绑定状态决定跳转
			 * - 已登录且已绑定设备 → 跳转首页
			 * - 已登录但未绑定设备 → 跳转设备绑定页
			 * - 未登录 → 停留在登录页
			 */
			checkLoginStatus() {
				const isLoggedIn = userStore.user?.isLoggedIn
				const phone = userStore.user?.phone
				const deviceBound = userStore.user?.deviceBound

				if (isLoggedIn && phone) {
					if (deviceBound) {
						// 已绑定设备 → 跳转到首页
						console.log('[Login] 用户已登录且已绑定设备，跳转到首页')
						uni.switchTab({
							url: '/pages/index/index',
							success: () => console.log('[Login] 跳转首页成功')
						})
					} else {
						// 未绑定设备 → 跳转到设备绑定页
						console.log('[Login] 用户已登录但未绑定设备，跳转到设备绑定页')
						uni.redirectTo({
							url: '/pages/sub_profile/bindDevice',
							success: () => console.log('[Login] 跳转成功')
						})
					}
					return
				}
			},

			/**
			 * 订阅登录状态
			 */
			subscribeAuthState() {
				this.unlistenAuth = authViewModel.listen((state) => {
					this.authState = state
					// 登录页只负责登录，不负责跳转
					// 跳转逻辑由 userStore._checkAndNavigateToDeviceBound() 统一处理
					console.log('[Login] 认证状态更新:', state)
				})
			},

			/**
			 * 发送验证码
			 */
			async handleSendCode() {
				console.log(' [DEBUG] ========== handleSendCode 开始 ==========')
				console.log(' [DEBUG] 1. 当前状态:', {
					isSendingCode: this.isSendingCode,
					isCountingDown: this.isCountingDown,
					phoneNumber: this.phoneNumber
				})

				// 防重复点击：正在发送或倒计时中，直接返回
				if (this.isSendingCode || this.isCountingDown) {
					console.log(' [DEBUG] 2. 防重复触发，直接返回')
					return
				}

				if (!this.validatePhone()) {
					console.log(' [DEBUG] 3. 手机号校验失败')
					return
				}

				this.isSendingCode = true
				console.log(' [DEBUG] 4. 设置发送状态为 true')

				try {
					const success = await authViewModel.sendCode(this.phoneNumber)
					console.log(' [DEBUG] 5. sendCode 返回结果:', success)

					if (success) {
						uni.showToast({ title: '验证码已发送', icon: 'success' })
						this.startCountdown()
						// 自动聚焦到验证码输入框
						this.$nextTick(() => {
							if (this.$refs.verifyCodeInput) {
								this.$refs.verifyCodeInput.focus()
							}
						})
					}
				} finally {
					this.isSendingCode = false
					console.log(' [DEBUG] 6. 设置发送状态为 false')
					console.log(' [DEBUG] ========== handleSendCode 结束 ==========')
				}
			},

			/**
			 * 开始倒计时
			 */
			startCountdown() {
				this.isCountingDown = true
				this.countdown = 60
				this.countdownTimer = setInterval(() => {
					this.countdown--
					if (this.countdown <= 0) this.stopCountdown()
				}, 1000)
			},

			/**
			 * 停止倒计时
			 */
			stopCountdown() {
				if (this.countdownTimer) {
					clearInterval(this.countdownTimer)
					this.countdownTimer = null
				}
				this.isCountingDown = false
				this.countdown = 0
			},

			/**
			 * 处理手机号输入，移除非数字字符
			 */
			onPhoneInput(e) {
				// 移除所有非数字字符
				let value = e.detail.value.replace(/\D/g, '')
				// 限制最多11位
				if (value.length > 11) {
					value = value.slice(0, 11)
				}
				this.phoneNumber = value
			},

			/**
			 * 校验手机号
			 */
			validatePhone() {
				if (!this.phoneNumber) {
					uni.showToast({ title: '请输入手机号', icon: 'none' })
					return false
				}
				if (!/^1\d{10}$/.test(this.phoneNumber)) {
					uni.showToast({ title: '手机号格式不正确', icon: 'none' })
					return false
				}
				return true
			},

			/**
			 * 处理登录
			 */
			async handleLogin() {
				console.log(' [DEBUG] ========== handleLogin 开始 ==========')
				console.log(' [DEBUG] 1. 输入参数:', {
					phoneNumber: this.phoneNumber,
					verifyCode: this.verifyCode,
					isLoggingIn: this.isLoggingIn
				})
				console.log(' [DEBUG] 2. 本地存储:', {
					hasUser: !!uni.getStorageSync('user_profile'),
					userData: uni.getStorageSync('user_profile'),
					hasToken: !!uni.getStorageSync('token'),
					tokenData: uni.getStorageSync('token')
				})

				// 防重复点击：正在登录中，直接返回
				if (this.isLoggingIn) {
					console.log(' [DEBUG] 3. 防重复登录触发，直接返回')
					return
				}

				if (!this.validatePhone()) {
					console.log(' [DEBUG] 4. 手机号校验失败')
					return
				}
				if (!this.verifyCode || this.verifyCode.length !== 6) {
					console.log(' [DEBUG] 5. 验证码校验失败')
					uni.showToast({ title: '请输入6位验证码', icon: 'none' })
					return
				}
				if (!this.agreementAccepted) {
					console.log(' [DEBUG] 6. 协议未勾选')
					uni.showToast({ title: '请阅读并同意相关协议', icon: 'none' })
					return
				}

				this.isLoggingIn = true
				console.log(' [DEBUG] 7. 设置登录状态为 true')

				try {
					const result = await authViewModel.loginBySms(this.phoneNumber, this.verifyCode)
					console.log(' [DEBUG] 8. loginBySms 返回结果:', result)
				} finally {
					this.isLoggingIn = false
					console.log(' [DEBUG] 9. 设置登录状态为 false')
					console.log(' [DEBUG] ========== handleLogin 结束 ==========')
				}
			},

			/**
			 * 切换协议状态
			 */
			toggleAgreement() {
				this.agreementAccepted = !this.agreementAccepted
			},

			/**
			 * 显示协议详情
			 */
			showAgreement(type) {
				const titles = {
					privacy: '隐私政策',
					service: '服务条款',
					member: '会员服务协议',
					child: '儿童隐私协议'
				}
				const urlMap = {
					privacy: ASSETS_PATHS.PRIVACY_POLICY,
					service: ASSETS_PATHS.SERVICE_AGREEMENT,
					member: ASSETS_PATHS.MEMBER_AGREEMENT,
					child: ASSETS_PATHS.CHILD_PRIVACY
				}
				const title = titles[type]
				const url = urlMap[type]

				// 跳转到协议详情页面
				uni.navigateTo({
					url: `/pages/sub_profile/agreement?title=${title}&url=${url}`
				})
			},

			/**
			 * 联系客服
			 */
			contactCustomerService() {
				this.showCustomerServiceModal = true
			},

			/**
			 * 关闭客服弹窗
			 */
			closeCustomerServiceModal() {
				this.showCustomerServiceModal = false
			},

			/**
			 * 保存图片提示
			 */
			saveQRCode() {
				// #ifndef MP-WEIXIN
				uni.showToast({
					title: '已触发保存',
					icon: 'none'
				})
				// #endif
			},

			/**
			 * 清理资源
			 */
			cleanup() {
				if (this.unlistenAuth) {
					this.unlistenAuth()
					this.unlistenAuth = null
				}
				this.stopCountdown()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.login-page {
		min-height: 100vh;
		background: #f0f8ff;
		display: flex;
		flex-direction: column;
	}

	/* 顶部导航栏 - 高度已调大 */
	.nav-bar {
		background: #6DBEF6;
		width: 100%;
		position: relative;
		box-sizing: border-box;
		
		// #ifdef MP-WEIXIN
		padding-top: var(--status-bar-height, 0px);
		// 高度增加：状态栏 + 120rpx
		height: calc(var(--status-bar-height, 0px) + 120rpx);
		// #endif

		// #ifndef MP-WEIXIN
		height: 120rpx;
		padding: 0;
		// #endif
	}

	.nav-title {
		font-size: 36rpx;
		color: #fff;
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;

		// #ifdef MP-WEIXIN
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		// 垂直中心点：状态栏 + 60rpx (120的一半)
		top: calc(var(--status-bar-height, 0px) + 60rpx);
		// #endif

		// #ifndef MP-WEIXIN
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		// #endif
	}

	/* 主体内容 */
	.login-content {
		flex: 1;
		/* 左右间距缩小 */
		padding: 0 10rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		max-width: 600rpx;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
	}
	
	/* 欢迎文案 */
	.welcome-section {
		text-align: center;
		margin-bottom: 80rpx;
	}

	.welcome-title {
		display: block;
		font-size: 36rpx;
		color: #000;
		font-weight: bold;
		margin-bottom: 16rpx;
	}

	.welcome-subtitle {
		display: block;
		font-size: 32rpx;
		color: #000;
		font-weight: bold;
		line-height: 1.5;
	}

	/* 表单区域 */
	.form-container {
		margin-bottom: 32rpx;
	}

	.form-item {
		margin-bottom: 24rpx;
	}

	.input-box {
		display: flex;
		align-items: center;
		background: #fff;
		border-radius: 24rpx;
		/* 内边距缩小：从 24rpx 改为 16rpx */
		padding: 0 16rpx;
		height: 88rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	}

	.code-box {
		justify-content: space-between;
	}

	.input-icon {
		font-size: 32rpx;
		margin-right: 16rpx;
		color: #6DBEF6;
	}

	.input-field {
		flex: 1;
		height: 100%;
		font-size: 30rpx;
		color: #333;
		border: none;
		background: transparent;
		outline: none;
	}

	.input-placeholder {
		color: #999;
	}

	.code-btn {
		padding: 0 20rpx;
		height: 56rpx;
		line-height: 56rpx;
		background: transparent;
		color: #1E90FF;
		font-size: 28rpx;
		border-radius: 8rpx;
		border: none;
		white-space: nowrap;
		transition: all 0.2s;

		&:not([disabled]):active {
			color: #0066cc;
		}

		&[disabled] {
			color: #ccc;
		}

		&::after {
			border: none;
		}
	}

	/* 协议区域 */
	.agreement-area {
		margin-bottom: 24rpx;
	}

	.agreement-check {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.check-box {
		width: 32rpx;
		height: 32rpx;
		border: 2rpx solid #ccc;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.2s;

		&.checked {
			background: #6DBEF6;
			border-color: #6DBEF6;
		}
	}

	.check-icon {
		color: #fff;
		font-size: 20rpx;
		font-weight: bold;
	}

	.agreement-text {
		flex: 1;
		font-size: 24rpx;
		color: #666;
		line-height: 1.5;
	}

	.agreement-link {
		color: #1E90FF;
		text-decoration: none;
		margin: 0 2rpx;
	}

	/* 登录按钮 */
	.login-btn {
		width: 100%;
		max-width: 400rpx;
		height: 88rpx;
		background: #6DBEF6;
		color: #fff;
		font-size: 32rpx;
		border-radius: 44rpx;
		border: none;
		margin: 40rpx auto;
		box-shadow: 0 4rpx 16rpx rgba(135, 206, 235, 0.4);
		transition: all 0.2s;
		display: block;
		line-height: 88rpx;

		&:not([disabled]):active {
			background: #6ca6cd;
			transform: translateY(2rpx);
		}

		&[disabled] {
			background: #ccc;
			box-shadow: none;
		}

		&.btn-loading {
			opacity: 0.8;
		}

		&::after {
			border: none;
		}
	}

	/* 底部客服链接 */
	.footer-link {
		text-align: center;
		margin-top: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
	}

	.link-icon {
		font-size: 24rpx;
		color: #999;
	}

	.link-text {
		font-size: 24rpx;
		color: #999;
		text-decoration: underline;
	}

	/* ================= 客服弹窗全新样式 ================= */
	.cs-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		z-index: 999;
		animation: cs-fade-in 0.3s ease;
	}

	.cs-modal {
		width: 100%;
		background: #ffffff;
		border-radius: 32rpx 32rpx 0 0;
		padding: 40rpx 30rpx 50rpx;
		padding-bottom: calc(50rpx + env(safe-area-inset-bottom));
		position: relative;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.15);
		animation: cs-slide-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	@keyframes cs-fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes cs-slide-up {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	.cs-skip {
		position: absolute;
		top: 24rpx;
		right: 24rpx;
		font-size: 28rpx;
		color: #999999;
		padding: 10rpx;
		z-index: 10;
	}

	.cs-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.cs-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 12rpx;
		text-align: center;
	}

	.cs-subtitle {
		font-size: 26rpx;
		color: #999999;
		margin-bottom: 40rpx;
		text-align: center;
		line-height: 1.4;
	}

	.qr-wrapper {
		width: 420rpx;
		height: 420rpx;
		background: #fff;
		padding: 20rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		border: 1rpx solid #f0f0f0;
		margin-bottom: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.qr-image {
		width: 100%;
		height: 100%;
		display: block;
	}

	.action-tip {
		background-color: #E6F7FF;
		padding: 12rpx 24rpx;
		border-radius: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		margin-bottom: 16rpx;
	}

	.action-tip .icon {
		font-size: 24rpx;
	}

	.tip-text {
		font-size: 26rpx;
		color: #1890FF;
		font-weight: 500;
	}

	.desc-text {
		font-size: 24rpx;
		color: #CCCCCC;
		text-align: center;
		line-height: 1.5;
		max-width: 80%;
	}
</style>