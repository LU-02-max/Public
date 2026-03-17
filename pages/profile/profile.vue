<template>
	<view class="profile-container">
		<view class="status-bar"></view>

		<view class="avatar-section">
			<image class="avatar-image"
				:src="childGender === '女' ? 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/female.png' : 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/male.png'"
				mode="aspectFill" />
		</view>
		
		<text class="username">{{ childNickname }}</text>

		<scroll-view class="menu-list" scroll-y>
			
			<view class="menu-item" @click="handleEditProfile">
				<image class="menu-icon" src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/device.png" mode="aspectFill" />
				<text class="menu-title">编辑资料</text>
				<uni-icons type="right" size="18" color="#ccc"></uni-icons>
			</view>

			<view class="menu-item" @click="handleMyDevice">
				<image class="menu-icon" src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/device.png" mode="aspectFill" />
				<text class="menu-title">我的设备</text>
				<uni-icons type="right" size="18" color="#ccc"></uni-icons>
			</view>

			<view class="menu-item" @click="handleProbSetting">
				<image class="menu-icon" src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/device.png" mode="aspectFill" />
				<text class="menu-title">多维能力设置</text>
				<uni-icons type="right" size="18" color="#ccc"></uni-icons>
			</view>

			<view class="menu-item" @click="handleSosSettings">
				<image class="menu-icon" src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/sos_p.png" mode="aspectFill" />
				<text class="menu-title">SOS紧急联系设置</text>
				<uni-icons type="right" size="18" color="#ccc"></uni-icons>
			</view>

			<view class="menu-item" @click="handleStudyRegistration">
				<image class="menu-icon" src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/study_p.png" mode="aspectFill" />
				<text class="menu-title">我的研学报名</text>
				<uni-icons type="right" size="18" color="#ccc"></uni-icons>
			</view>

			<view class="menu-item" @click="handleAboutUs">
				<image class="menu-icon" src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/about_p.png" mode="aspectFill" />
				<text class="menu-title">关于我们</text>
				<uni-icons type="right" size="18" color="#ccc"></uni-icons>
			</view>

			<view class="menu-item" @click="handleHelpFeedback">
				<image class="menu-icon" src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/help_p.png" mode="aspectFill" />
				<text class="menu-title">帮助与反馈</text>
				<uni-icons type="right" size="18" color="#ccc"></uni-icons>
			</view>
			
	
		</scroll-view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onShow } from '@dcloudio/uni-app';
	import userStore from '@/store/user.js';

	// 定义本地响应式变量，用于界面渲染
	const childNickname = ref('加载中...');
	const childGender = ref('未填写...');

	/**
	 * [生命周期] onShow
	 * 逻辑：每次用户回到“个人中心”页，都要强制从 userStore 拉取一次最新数据。
	 * 作用：解决在“编辑资料”页改了名字后，回到这里名字不刷新的问题。
	 */
	onShow(() => {
		console.log(' [Profile] 页面显示，正在同步全局状态...');
		const user = userStore.user;
		
		// 优先级：优先取 childNickname，其次取 username，最后默认“未设置”
		childNickname.value = user.childNickname || user.username || '未设置昵称';
		childGender.value = user.childGender || '男';
		
		console.log('✅ [Profile] 状态同步成功:', {
			nickname: childNickname.value,
			gender: childGender.value,
			phone: user.phone
		});
	});

	/**
	 * [跳转] 跳转至编辑资料页
	 */
	const handleEditProfile = () => {
		console.log(' [Profile] 准备进入编辑资料页');
		uni.navigateTo({ url: '/pages/sub_profile/editProfile' });
	};

	/**
	 * [跳转] 跳转至设备绑定页
	 */
	const handleMyDevice = () => {
		console.log(' [Profile] 准备进入设备绑定页');
		uni.navigateTo({ url: '/pages/sub_profile/bindDevice' });
	};

	/**
	 * [跳转] 跳转至概率(雷达图)设置页
	 */
	const handleProbSetting = () => {
		console.log(' [Profile] 准备进入概率设置页');
		uni.navigateTo({ url: '/pages/sub_profile/radarConfig' });
	};

	/**
	 * [跳转] 跳转至关于我们
	 */
	const handleAboutUs = () => {
		console.log(' [Profile] 准备进入关于我们');
		uni.navigateTo({ url: '/pages/sub_profile/about' });
	};

	/**
	 * [核心功能] 退出登录/解绑
	 * 逻辑：弹窗二次确认 -> 调用 Store 的清理方法 -> 强制回到登录页
	 */
	const handleLogout = () => {
		uni.showModal({
			title: '提示',
			content: '确定要解除设备绑定并退出登录吗？',
			confirmColor: '#FF5A5F',
			success: (res) => {
				if (res.confirm) {
					console.warn('⚠️ [Profile] 用户确认退出，执行清理逻辑...');
					userStore.clearAndExit(); // 调用 store/user.js 里的彻底清理函数
				}
			}
		});
	};

	// --- 暂未开发的功能提示 ---
	const handleSosSettings = () => uni.showToast({ title: 'SOS设置功能开发中', icon: 'none' });
	const handleStudyRegistration = () => uni.showToast({ title: '研学报名功能开发中', icon: 'none' });
	const handleHelpFeedback = () => uni.navigateTo({ url: '/pages/help/help' });
</script>

<style lang="scss" scoped>
	.profile-container {
		min-height: 100vh;
		background: #F7F7F7;
		padding: 32rpx;
	}

	.status-bar {
		height: var(--status-bar-height);
	}

	.avatar-section {
		display: flex;
		justify-content: center;
		margin: 40rpx 0 20rpx;
	}

	.avatar-image {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		border: 6rpx solid #8CD0FC;
		background: #fff;
	}

	.username {
		display: block;
		text-align: center;
		font-size: 38rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 40rpx;
	}

	.menu-item {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx 32rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

		&:active {
			background-color: #f9f9f9;
		}
	}

	.menu-icon {
		width: 70rpx;
		height: 70rpx;
		border-radius: 12rpx;
		margin-right: 24rpx;
	}

	.menu-title {
		flex: 1;
		font-size: 30rpx;
		font-weight: 500;
		color: #333;
	}
	
	/* 退出登录专属样式 */
	.logout-item {
		margin-top: 40rpx;
		border: 1rpx solid #ffebeb;
	}
	
	.logout-text {
		color: #FF5A5F;
		text-align: center;
	}
</style>