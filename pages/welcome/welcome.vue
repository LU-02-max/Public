<!-- pages/welcome/welcome.vue -->
<!-- 欢迎页 - uniapp 版本 -->

<template>
	<view class="welcome-container">
		<!-- 1. 顶部文本区域 -->
		<view class="header-section">
			<text class="header-title">恭喜您，</text>
			<text class="header-subtitle">设备绑定成功！</text>
			<text class="header-desc">宝贝的每次出行，</text>
			<text class="header-desc">都将是一场壮游！</text>
			<text class="arrow-down">↓</text>
		</view>

		<!-- 2. 中间核心动画区域 -->
		<view class="orbit-container">
			<!-- 卫星图标 -->
			<view v-for="(companion, index) in companions" :key="index" class="satellite"
				:class="{ 'satellite-show': satelliteVisible[index] }" :style="getSatelliteStyle(index)">
				<view class="satellite-circle">
					<image :src="companion.imagePath" mode="aspectFit" class="satellite-image" />
				</view>
			</view>

			<!-- 中心图标 -->
			<view class="center-icon" :class="{ 'center-visible': animationStarted }">
				<image src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/yowow.png"
					mode="aspectFit" class="center-image" />
			</view>
		</view>

		<!-- 3. 底部按钮 -->
		<view class="button-section" :class="{ 'button-visible': animationStarted }">
			<button class="start-button" @click="handleStartTour">开启壮游之旅</button>
		</view>
	</view>
</template>

<script>
	import userStore from '@/store/user.js'

	export default {
		data() {
			return {
				animationStarted: false,
				satelliteVisible: [], // 控制每个卫星的可见性
				companions: [{
						name: '科学家',
						imagePath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-02.png'
					},
					{
						name: '学科名师',
						imagePath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-08.png'
					},
					{
						name: '心理学家',
						imagePath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-07.png'
					},
					{
						name: '思维训练师',
						imagePath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-06.png'
					},
					{
						name: '艺术家',
						imagePath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-05.png'
					},
					{
						name: '兴趣玩伴',
						imagePath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-04.png'
					},
					{
						name: '历史名人',
						imagePath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-09.png'
					},
					{
						name: '科技先锋',
						imagePath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-07.png'
					},
					{
						name: '析辨明思',
						imagePath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-03.png'
					},
					{
						name: '英文机锋',
						imagePath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-10.png'
					},
					{
						name: '中文机锋',
						imagePath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-11.png'
					},
					{
						name: '韵觉苏醒',
						imagePath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-12.png'
					},
					{
						name: '触觉',
						imagePath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-13.png'
					}
				],
				screenWidth: 375, // 默认值，将在 onReady 中获取
				satelliteVisible: [], // 控制每个卫星的可见性
			}
		},
		onLoad(options) {
			// 检查是否从绑定页面跳转过来
			const fromBinding = options.fromBinding === 'true'
			console.log(' [欢迎] 页面加载，来源:', fromBinding ? '设备绑定成功' : '正常启动')

			// 初始化卫星可见状态数组
			this.satelliteVisible = new Array(this.companions.length).fill(false)

			// 获取屏幕宽度
			const systemInfo = uni.getSystemInfoSync()
			this.screenWidth = systemInfo.windowWidth

			// 开始动画序列
			this.startAnimation()
		},
		methods: {
			// 开始动画序列
			startAnimation() {
				// 文本入场
				setTimeout(() => {
					this.animationStarted = true
				}, 100)

				// 卫星图标依次出现（每个延迟 300ms）
				this.companions.forEach((_, index) => {
					setTimeout(() => {
						// 使用 Vue 响应式数据控制可见性，而非操作 DOM
						this.$set(this.satelliteVisible, index, true)
					}, 500 + index * 300)
				})

				// 底部按钮出现（8.5秒后）
				setTimeout(() => {
					this.animationStarted = true
				}, 8500)
			},

			// 计算卫星位置（圆形分布）
			getSatelliteStyle(index) {
				const total = this.companions.length
				const angle = (2 * Math.PI / total) * index - (Math.PI / 2)
				const radius = this.screenWidth * 0.38

				const x = Math.cos(angle) * radius
				const y = Math.sin(angle) * radius

				return {
					transform: `translate(${x}px, ${y}px)`
				}
			},

			// 开启壮游之旅
			handleStartTour() {
				console.log('开始壮游之旅！')
				// 标记已看过欢迎动画
				userStore.completeFirstInitialization()
				// 跳转到客服微信页面（可跳过）
				uni.navigateTo({
					url: '/pages/customerService/customerService'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.welcome-container {
		min-height: 100vh;
		background: linear-gradient(to bottom, #F7F9FB, #EBF1F5);
		padding-top: 80rpx;
	}

	/* 1. 顶部文本区域 */
	.header-section {
		text-align: center;
		padding: 0 40rpx;
	}

	.header-title {
		font-size: 40rpx;
		color: #888;
		letter-spacing: 2.4rpx;
		display: block;
		margin-bottom: 20rpx;
	}

	.header-subtitle {
		font-size: 36rpx;
		color: #888;
		display: block;
		margin-bottom: 20rpx;
	}

	.header-desc {
		font-size: 36rpx;
		color: #888;
		display: block;
		margin-bottom: 20rpx;
	}

	.arrow-down {
		font-size: 40rpx;
		color: rgba(0, 0, 0, 0.38);
		display: block;
		margin-top: 50rpx;
	}

	/* 2. 中间核心动画区域 */
	.orbit-container {
		width: 750rpx;
		height: 750rpx;
		margin: 0 auto;
		position: relative;
	}

	/* 卫星图标 */
	.satellite {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 112rpx;
		height: 112rpx;
		margin-left: -56rpx;
		margin-top: -56rpx;
		opacity: 0;
		transform: scale(0);
		transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.satellite.satellite-show {
		opacity: 1;
		transform: scale(1);
	}

	.satellite-circle {
		width: 112rpx;
		height: 112rpx;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6rpx;
	}

	.satellite-image {
		width: 100rpx;
		height: 100rpx;
	}

	/* 中心图标 */
	.center-icon {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 240rpx;
		height: 240rpx;
		margin-left: -120rpx;
		margin-top: -120rpx;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 0 60rpx 10rpx rgba(255, 193, 7, 0.4);
		border: 10rpx solid #FFC107;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transform: scale(0);
		transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
		transition-delay: 0.5s;
	}

	.center-icon.center-visible {
		opacity: 1;
		transform: scale(1);
	}

	.center-image {
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
	}

	/* 3. 底部按钮 */
	.button-section {
		padding: 0 80rpx;
		margin-top: 60rpx;
		opacity: 0;
		transition: opacity 1s ease-in;
		transition-delay: 5.5s;
	}

	.button-section.button-visible {
		opacity: 1;
	}

	.start-button {
		width: 100%;
		height: 112rpx;
		background: #FFC107;
		color: #000;
		font-size: 36rpx;
		font-weight: bold;
		letter-spacing: 2rpx;
		border-radius: 56rpx;
		border: none;
		box-shadow: none;
		outline: none;
	}

	.start-button::after {
		border: none;
	}
</style>