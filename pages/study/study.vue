<template>
	<view class="study-container">
		<!-- 状态栏占位 -->
		<view :style="{ height: statusBarHeight + 'px' }" class="status-bar"></view>
		
		<!-- 1. 顶部大标题 -->
		<view class="page-header">
			<text class="main-title">成为研学基地</text>
		</view>

		<!-- 2. 活动卡片列表 -->
		<view class="card-list">
			
			<!-- 白色活动卡片 -->
			<view class="activity-card white-card" v-for="(item, index) in activities" :key="index">
				
				<!-- 【新增】图片占位位 - 后期可直接替换为 <image> -->
				<view class="image-placeholder">
					<uni-icons type="image" size="40" color="#ddd"></uni-icons>
					<text class="placeholder-text">暂无图片</text>
				</view>

				<!-- 卡片文字内容 -->
				<view class="card-content">
					<view class="text-area">
						<text class="activity-title">{{ item.title }}</text>
						<view class="tag-group">
							<text class="tag" v-for="(tag, tIdx) in item.tags" :key="tIdx">{{ tag }}</text>
						</view>
					</view>
					<!-- 右侧状态 -->
					<view class="status-box">
						<text class="status-text" v-if="item.comingSoon">敬请期待</text>
					</view>
				</view>
			</view>

			<!-- 3. 蓝色“成为研学基地”标语卡片 -->
			<view class="banner-card blue-card" @tap="onBannerTap">
				<view class="banner-info">
					<text class="banner-title">成为研学基地</text>
					<text class="banner-subtitle">分享您的知识与场地</text>
				</view>
				<view class="banner-icon">
					<view class="inner-icon"></view>
				</view>
			</view>
			
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 状态栏高度
const statusBarHeight = ref(44);

// 获取系统信息
onLoad(() => {
	uni.getSystemInfo({
		success: (res) => {
			statusBarHeight.value = res.statusBarHeight || 44;
		}
	});
});

const activities = ref([
	{
		title: '小小宇航员 - 空间站探秘',
		tags: ['8-12岁', '科学探索', '动手实践'],
		comingSoon: true
	}
]);

const onBannerTap = () => {
	uni.showToast({ title: '申请功能开发中', icon: 'none' });
};
</script>

<style lang="scss" scoped>
.study-container {
	min-height: 100vh;
	background-color: #F8F9FB;
	padding-top: 32rpx;
	padding-left: 32rpx;
	padding-right: 32rpx;
	padding-bottom: 32rpx;
}

.status-bar {
	width: 100%;
	background-color: #F8F9FB;
	margin-left: -32rpx;
	margin-right: -32rpx;
	margin-bottom: -32rpx;
}

.page-header {
	margin-bottom: 50rpx;
	text-align: center;
	.main-title {
		font-size: 44rpx;
		font-weight: bold;
		color: #333;
	}
}

.card-list {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

/* 白色活动卡片样式 */
.white-card {
	background-color: #FFFFFF;
	border-radius: 24rpx; // 稍微圆润一点
	overflow: hidden; // 确保图片占位符的圆角生效
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	
	/* 图片占位样式 */
	.image-placeholder {
		width: 100%;
		height: 340rpx; // 预留高度
		background-color: #F2F4F7; // 浅灰色占位
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		
		.placeholder-text {
			font-size: 24rpx;
			color: #ccc;
			margin-top: 10rpx;
		}
	}

	.card-content {
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: flex-end; // 改为底部对齐，更美观
	}
	
	.activity-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 16rpx;
		display: block;
	}
	
	.tag-group {
		display: flex;
		gap: 12rpx;
		.tag {
			font-size: 24rpx;
			color: #6DBEF6;
			background-color: #E8F5FE;
			padding: 6rpx 16rpx;
			border-radius: 8rpx;
		}
	}
	
	.status-text {
		font-size: 26rpx;
		color: #FFB948;
		font-weight: 500;
	}
}

/* 蓝色标语卡片 */
.blue-card {
	background-color: #40A9FF;
	border-radius: 24rpx;
	padding: 40rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 10rpx;
	
	.banner-title {
		font-size: 38rpx;
		font-weight: bold;
		color: #FFFFFF;
		margin-bottom: 10rpx;
		display: block;
	}
	
	.banner-subtitle {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
	}
	
	.banner-icon {
		width: 100rpx;
		height: 100rpx;
		background-color: rgba(255, 255, 255, 0.8);
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		.inner-icon {
			width: 60%;
			height: 60%;
			background-color: #fff;
			border-radius: 8rpx;
		}
	}
}
</style>