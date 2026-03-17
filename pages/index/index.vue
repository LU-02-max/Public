<template>
	<scroll-view scroll-y class="home-container" :style="{ background: '#F7F7F7' }">

		<view class="header-section">
			<text class="header-title">欢迎回来，{{ childName }}的{{ relation }}！</text>

			<view class="family-card" @click="handleFamilyCardClick">
				<text class="card-title">{{ childName }}的家庭成员</text>
				<text class="card-arrow">›</text>
			</view>
		</view>

		<view v-if="homeState.isSOS" class="sos-card" @click="handleSOSClick">
			<image src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/sos.png" class="sos-image" mode="aspectFill" />
			<view class="sos-content">
				<text class="sos-title">紧急求救信号！</text>
				<text class="sos-desc">您的孩子遇到危险,需要你的帮助！</text>
			</view>
			<text class="sos-arrow">›</text>
		</view>

		<view class="device-card">
			<image src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/device.png" class="device-image" mode="aspectFill" />
			<view class="device-info">
				<view class="device-header">
					<text class="device-title">{{ childName }}的状态</text>
					<view class="battery-indicator">
						<view class="battery-body">
							<view class="battery-fill" :style="{ width: homeState.battery + '%' }"></view>
							<text class="battery-text">{{ homeState.battery }}%</text>
						</view>
						<view class="battery-head"></view>
					</view>
					<text class="scan-icon" @click="handleScan"></text>
				</view>
				<text class="device-status">状态：连接稳定 · 陪伴孩子成长</text>
			</view>
			<button class="device-switch-btn" @click="handleSwitchDevice">切换</button>
		</view>

		<view class="dashboard-card">
			<text class="card-title-text">今日探索看板</text>
			<view class="stats-row">
				<view class="stat-item">
					<image src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/todayMinutes.png" class="stat-icon" mode="aspectFit" />
					<view class="stat-info">
						<text class="stat-value">{{ homeState.todayMinutes }}</text>
						<text class="stat-label">分钟</text>
					</view>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<image src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/todayApps.png" class="stat-icon" mode="aspectFit" />
					<view class="stat-info">
						<text class="stat-value">{{ homeState.todayApps }}</text>
						<text class="stat-label">个应用</text>
					</view>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<image src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/todayQuestions.png" class="stat-icon" mode="aspectFit" />
					<view class="stat-info">
						<text class="stat-value">{{ homeState.todayQuestions }}</text>
						<text class="stat-label">次互动</text>
					</view>
				</view>
			</view>
		</view>

		<view class="talent-card">
			<view class="talent-header">
				<text class="trophy-icon"></text>
				<image src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/xingqiu.png" class="talent-title-image" mode="aspectFit"></image>
				<text class="talent-title">宝贝的天赋展示</text>
			</view>
			<view class="talent-content">
				<text class="talent-text">{{ talent || '每一次与壮游机的对话，都是孩子探索未知世界的一小步。坚持下去，这些小步将汇聚成通往未来的巨大飞跃！' }}</text>
			</view>
		</view>

		<view class="actions-wrapper">
			<view v-for="(action, index) in actions" :key="index" class="action-card" @click="action.onTap">
				<image :src="action.image" class="action-image" mode="aspectFit" />
				<text class="action-label">{{ action.label }}</text>
			</view>
		</view>

		<view class="service-card" @click="handleServiceClick">
			<image src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/service.png" class="service-image" mode="aspectFill" />
			<view class="service-info">
				<text class="service-title">专属客服</text>
				<text class="service-desc">使用问题、设备报修，随时联系我们</text>
			</view>
			<text class="service-arrow">›</text>
		</view>

		<view class="bottom-spacer"></view>
	</scroll-view>
</template>

<script>
	import homeViewModel from '@/viewmodels/home.js'
	import userStore from '@/store/user.js'

	export default {
		data() {
			return {
				//  状态管理：同步获取 ViewModel 的响应式 state
				homeState: homeViewModel.state,
				unlistenHome: null,

				//  页面局部变量：用于 UI 实时显示
				childName: '',
				relation: '',

				// 按钮配置
				actions: [{
						label: '通话SOS',
						image: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/phone.png',
						onTap: () => console.log('☎️ [Index] 点击通话')
					},
					{
						label: '宝贝信息',
						image: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/message.png',
						onTap: () => uni.navigateTo({
							url: '/pages/sub_detail/home/family'
						})
					},
					{
						label: '代收短信',
						image: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/sms.png',
						onTap: () => {}
					},
					{
						label: '声音设置',
						image: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/volume.png',
						onTap: () => {}
					}
				]
			}
		},

		/**
		 * [生命周期] onLoad
		 *  逻辑：页面加载时，订阅 ViewModel。当 ViewModel 发起请求并拿到数据后，
		 * 会回调这里的闭包，从而更新 this.homeState，触发 UI 刷新。
		 */
		onLoad() {
			console.log('️ [Index] 页面 onLoad: 建立 ViewModel 监听');
			this.unlistenHome = homeViewModel.listen((newState) => {
				console.log(' [Index] 监听到 ViewModel 数据更新:', newState);
				this.homeState = newState;
			});
		},

		/**
		 * [生命周期] onUnload
		 *  逻辑：页面卸载时取消订阅，防止内存泄漏。
		 */
		onUnload() {
			if (this.unlistenHome) {
				console.log('️ [Index] 页面销毁: 取消监听');
				this.unlistenHome();
			}
		},

		/**
		 * [生命周期] onShow
		 *  逻辑：
		 * 1. 解决名字同步：每次切回首页都去 userStore 抓一次最新名字。
		 * 2. 优化数据刷新：刷新基础看板数据，并尝试刷新天赋（带频次限制）。
		 * 3. 添加数据新鲜度检查：长时间未同步时触发后端数据更新。
		 */
		async onShow() {
			console.log(' [Index] 页面 onShow: 开始优化后的刷新流程');

			// 1. 同步用户信息
			const user = userStore.user;
			this.childName = user.childNickname || user.username || '宝贝';
			this.relation = user.parentRelationship || '家长';

			console.log(` [Index] 当前用户身份: ${this.childName} 的 ${this.relation}`);

			// 2. 检查数据新鲜度，长时间未同步时触发后端更新
			await this.checkDataFreshness();

			// 3. 刷新基础看板数据（电量、时长等）
			console.log(' [Index] 刷新看板数据');
			homeViewModel.refreshData();

			// 4. 尝试刷新天赋数据（带频次限制，最少间隔 5 分钟）
			console.log(' [Index] 尝试刷新天赋数据');
			homeViewModel.forceRefreshTalent();
		},

		methods: {
			/**
			 * [核心函数] 刷新业务数据
			 *  逻辑：
			 * 1. 调用 refreshData 处理本地模拟数据或简单状态。
			 * 2. 如果有手机号，调用 getTalent 发起真正的后端 AI 数据请求。
			 */
			/**
			 * [核心函数] 刷新业务数据
			 *  逻辑：已优化，避免重复请求天赋数据
			 */
			handleRefresh() {
				const phone = userStore.user.phone;
				console.log(` [Index] 触发 ViewModel 数据拉取，当前手机号: ${phone}`);

				// 刷新基础看板（时长、应用数等）
				homeViewModel.refreshData();

				// 只有在首次加载或强制刷新时才请求天赋分析
				if (phone && !homeViewModel._lastTalentData) {
					homeViewModel.getTalent(phone);
				} else if (!phone) {
					console.warn('⚠️ [Index] 未检测到手机号，跳过 API 请求');
				}
			},

			/**
			 * [交互] 手动刷新天赋数据
			 *  逻辑：用于用户主动要求更新天赋分析时调用
			 */
			handleForceRefreshTalent() {
				console.log(' [Index] 用户手动刷新天赋数据');
				homeViewModel.forceRefreshTalent();
			},

			/**
			 * [数据新鲜度] 检查并同步后端数据
			 */
			async checkDataFreshness() {
				try {
					const user = userStore.user;
					if (!user || !user.isLoggedIn || !user.phone) {
						console.log(' [Index] 用户未登录，跳过后端同步检查');
						return;
					}

					const now = Date.now();
					const lastSyncTime = uni.getStorageSync('last_profile_sync') || 0;
					const SYNC_INTERVAL = 10 * 60 * 1000; // 10分钟同步一次

					// 检查是否需要同步
					if (now - lastSyncTime < SYNC_INTERVAL) {
						console.log('⏰ [Index] 数据新鲜，跳过后端同步');
						return;
					}

					console.log('🔄 [Index] 触发后端数据同步检查');
					
					// 使用store的同步方法
					await userStore.loadUser(true); // true表示触发后端同步
					
					// 同步后更新本地显示
					const updatedUser = userStore.user;
					this.childName = updatedUser.childNickname || updatedUser.username || '宝贝';
					this.relation = updatedUser.parentRelationship || '家长';
					
					console.log(`✅ [Index] 数据同步完成: ${this.childName} 的 ${this.relation}`);
				} catch (error) {
					console.error('❌ [Index] 数据新鲜度检查失败:', error);
					// 静默失败，不影响用户体验
				}
			},

			/**
			 * [交互] 跳转家庭成员
			 */
			handleFamilyCardClick() {
				uni.navigateTo({
					url: '/pages/sub_detail/home/family'
				});
			},

			/**
			 * [交互] 跳转 SOS 详情
			 */
			handleSOSClick() {
				uni.navigateTo({
					url: '/pages/home/sosDetail'
				});
			},

			/**
			 * [交互] 切换/绑定设备
			 */
			handleSwitchDevice() {
				uni.navigateTo({
					url: '/pages/sub_profile/bindDevice'
				});
			},

			/**
			 * [交互] 定位/扫码
			 */
			handleScan() {
				console.log(' [Index] 点击定位');
				uni.showToast({
					title: '定位功能开发中',
					icon: 'none'
				});
			},

			/**
			 * [交互] 专属客服
			 */
			handleServiceClick() {
				console.log(' [Index] 点击客服 - 跳转到帮助页面');
				uni.navigateTo({
					url: '/pages/help/help'
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	/*  样式保持原有的精致布局 ... (省略相同部分以节省篇幅) */
	.home-container {
		min-height: 100vh;
		padding: 32rpx;
		background: #F0F9FB;
	}

	.header-section {
		padding-top: 80rpx;
		padding-bottom: 16rpx;
	}

	.header-title {
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
		line-height: 1.4;
		display: block;
		margin-bottom: 24rpx;
	}

	.family-card {
		background: #fff;
		border-radius: 32rpx;
		padding: 32rpx;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);
		display: flex;
		justify-content: space-between;
		align-items: center;
		min-height: 112rpx;
	}

	.card-title {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
	}

	.card-arrow {
		font-size: 32rpx;
		color: #42A5F5;
	}

	.sos-card {
		background: #FFF4E5;
		border: 3rpx solid rgba(255, 152, 0, 0.5);
		border-radius: 32rpx;
		padding: 32rpx;
		margin-top: 32rpx;
		box-shadow: 0 16rpx 32rpx rgba(255, 152, 0, 0.2);
		display: flex;
		align-items: center;
	}

	.sos-image {
		width: 90rpx;
		height: 90rpx;
		border-radius: 50%;
		margin-right: 24rpx;
	}

	.sos-content {
		flex: 1;
	}

	.sos-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #FF9800;
		display: block;
		margin-bottom: 8rpx;
	}

	.sos-desc {
		font-size: 28rpx;
		color: rgba(255, 152, 0, 0.8);
		line-height: 1.4;
		display: block;
	}

	.sos-arrow {
		font-size: 48rpx;
		color: #FF9800;
	}

	.device-card {
			background: #fff;
			border-radius: 40rpx;
			padding: 40rpx;
			margin-top: 32rpx;
			box-shadow: 0 16rpx 30rpx rgba(66, 165, 245, 0.15);
			border: 3rpx solid rgba(66, 165, 245, 0.2);
			display: flex;
			align-items: center;
		}

		.device-image {
			width: 90rpx;
			height: 90rpx;
			border-radius: 20rpx;
			border: 4rpx solid rgba(66, 165, 245, 0.5);
			margin-right: 20rpx;
			margin-left: -10rpx;
			object-fit: cover;
		}

		.device-info {
			flex: 1;
		}

		.device-header {
			display: flex;
			align-items: center;
			margin-bottom: 8rpx;
			gap: 16rpx;
		}

		.device-title {
			font-size: 36rpx;
			font-weight: 700;
			color: #333;
			flex: 1;
		}

		.battery-indicator {
			display: flex;
			align-items: center;
		}

		.battery-body {
			width: 64rpx;
			height: 22rpx;
			border: 2rpx solid rgba(102, 102, 102, 0.5);
			border-radius: 6rpx;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.battery-fill {
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			background: #4CAF50;
			border-radius: 4rpx;
		}

		.battery-text {
			font-size: 20rpx;
			color: #000;
			position: relative;
			z-index: 1;
		}

		.battery-head {
			width: 2rpx;
			height: 8rpx;
			background: rgba(102, 102, 102, 0.5);
			margin-left: 2rpx;
		}

		.scan-icon {
			font-size: 44rpx;
			color: rgba(102, 102, 102, 0.6);
		}

		.device-status {
			font-size: 28rpx;
			color: #666;
			margin-bottom: 0;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.device-switch-btn {
			padding: 12rpx 20rpx;
			background: #42A5F5;
			color: #fff;
			font-size: 24rpx;
			font-weight: 600;
			border-radius: 36rpx;
			border: none;
			box-shadow: 0 10rpx 20rpx rgba(66, 165, 245, 0.4);
			min-width: 100rpx;
			text-align: center;
			line-height: 1.2;
		}

	.dashboard-card {
		background: #fff;
		border-radius: 32rpx;
		padding: 40rpx;
		margin-top: 32rpx;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.card-title-text {
		font-size: 34rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 32rpx;
	}

	.stats-row {
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	.stat-item {
		display: flex;
		align-items: center;
	}

	.stat-icon {
		width: 76rpx;
		height: 76rpx;
		margin-right: 16rpx;
	}

	.stat-info {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: 44rpx;
		font-weight: bold;
		color: #FF9800;
	}

	.stat-label {
		font-size: 28rpx;
		color: #666;
	}

	.stat-divider {
		width: 2rpx;
		height: 80rpx;
		background: rgba(102, 102, 102, 0.2);
	}

	.talent-card {
		background: linear-gradient(135deg, #D4EBFC, #ffffff);
		border-radius: 40rpx;
		padding: 48rpx;
		margin-top: 32rpx;
		box-shadow: 0 16rpx 30rpx rgba(212, 235, 252, 0.2);
	}

	.talent-header {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 40rpx;
	}

	.trophy-icon {
		font-size: 48rpx;
		margin-right: 16rpx;
	}

	.talent-title-image {
		width: 36rpx;
		height: 36rpx;
		margin-right: 12rpx;
	}

	.talent-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #333;
		letter-spacing: 1rpx;
	}

	.talent-content {
		background: #fff;
		border-radius: 32rpx;
		border: 2rpx solid rgba(212, 235, 252, 0.6);
		padding: 40rpx 32rpx;
	}

	.talent-text {
		font-size: 36rpx;
		line-height: 1.5;
		color: #333;
		text-align: center;
	}

	.actions-wrapper {
		display: flex;
		flex-wrap: wrap;
		margin-top: 32rpx;
	}

	.action-card {
		width: calc(50% - 16rpx);
		background: #fff;
		border-radius: 32rpx;
		padding: 32rpx;
		margin: 0 16rpx 16rpx 0;
		box-shadow: 0 12rpx 24rpx rgba(0, 0, 0, 0.05);
		display: flex;
		align-items: center;
	}

	.action-image {
		width: 64rpx;
		height: 64rpx;
		margin-right: 24rpx;
	}

	.action-label {
		font-size: 32rpx;
		color: #333;
		font-weight: 600;
		flex: 1;
	}

	.service-card {
		background: #fff;
		border-radius: 32rpx;
		padding: 32rpx;
		margin-top: 32rpx;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);
		display: flex;
		align-items: center;
	}

	.service-image {
		width: 90rpx;
		height: 90rpx;
		border-radius: 20rpx;
		margin-right: 32rpx;
	}

	.service-info {
		flex: 1;
	}

	.service-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 8rpx;
	}

	.service-desc {
		font-size: 28rpx;
		color: #666;
		display: block;
	}

	.service-arrow {
		font-size: 48rpx;
		color: #666;
	}

	.bottom-spacer {
		height: 64rpx;
	}
</style>