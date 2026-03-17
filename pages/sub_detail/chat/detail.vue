//pages/sub_detail/chat/detail.vue
<template>
	<view class="detail-container" @tap="selectedMsgId = null">
		<view class="status-bar"></view>

		<view class="nav-header">
			<view class="back-btn" @click="goBack">
				<uni-icons type="left" size="26" color="#333"></uni-icons>
			</view>
			<view class="header-info">
				<image class="nav-avatar" :src="imagePath || 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/default-avatar.png'" mode="aspectFill"></image>
				<text class="nav-title">{{ displayName || '对话详情' }}</text>
			</view>
			<view class="header-right"></view>
		</view>

		<scroll-view scroll-y class="chat-list" :scroll-into-view="lastMsgId" scroll-with-animation>
			<view v-if="messages.length === 0 && !isLoading" class="empty-state">
				<text>暂无聊天记录</text>
			</view>

			<view v-for="(item, index) in messages" :key="index" :id="'msg-' + index" class="message-group">
				<view class="time-stamp" v-if="item.timestamp">{{ formatTime(item.timestamp) }}</view>

				<view class="message-row user-row" v-if="item.questionText || item.imageUrl">
					<view class="bubble-container">
						<view v-if="selectedMsgId === item.conversationId" class="forward-icon"
							@tap.stop="handleForward(item)">
							<uni-icons type="redo" size="20" color="#fff"></uni-icons>
						</view>

						<view class="bubble user-bubble" @tap.stop="onMessageTap(item)">
							<image v-if="item.imageUrl" :src="item.imageUrl" mode="widthFix" class="msg-image-large">
							</image>
							<text v-if="item.questionText && item.questionText.trim()">{{ item.questionText }}</text>
						</view>
					</view>
					<image class="avatar" src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/default-avatar.png"></image>//找不到对应图片，随便甩一张再改
				</view>

				<view class="message-row ai-row" v-if="item.answerText">
					<image class="avatar" :src="imagePath || 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/default-avatar.png'"></image>
					<view class="bubble ai-bubble">
						<text>{{ item.answerText }}</text>
					</view>
				</view>
			</view>

			<view style="height: 100rpx;"></view>
		</scroll-view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		nextTick
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';

	const targetId = ref('');
	const displayName = ref('');
	const imagePath = ref('');
	const messages = ref([]);
	const selectedMsgId = ref(null);
	const lastMsgId = ref('');
	const isLoading = ref(false);

	onLoad((options) => {
		targetId.value = options?.targetId || '';
		displayName.value = options?.displayName || '聊天详情';
		imagePath.value = options?.imagePath || '';
	});

	/**
	 * 恢复并增强后的 goBack 功能
	 */
	const goBack = () => {
		console.log('⬅️ [goBack] 尝试返回列表页');
		const pages = getCurrentPages();

		// 逻辑判断：如果页面栈存在（大于1），则正常返回；
		// 如果栈为空（比如直接刷新详情页），或者返回失败，则强制跳转回 TabBar 路径
		if (pages.length > 1) {
			uni.navigateBack({
				delta: 1,
				fail: () => {
					uni.switchTab({
						url: '/pages/chat/chat'
					});
				}
			});
		} else {
			// 确保路径与你的 pages.json 中 chat 页面路径一致
			uni.switchTab({
				url: '/pages/chat/chat'
			});
		}
	};

	const loadMessages = () => {
		isLoading.value = true;
		try {
			const cachedData = uni.getStorageSync('current_chat_conversations');
			if (cachedData) {
				messages.value = cachedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
				nextTick(() => {
					if (messages.value.length > 0) {
						lastMsgId.value = 'msg-' + (messages.value.length - 1);
					}
				});
			}
		} finally {
			isLoading.value = false;
		}
	};

	const formatTime = (ts) => {
		if (!ts) return '';
		const d = new Date(ts);
		return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
	};

	const onMessageTap = (item) => {
		selectedMsgId.value = selectedMsgId.value === item.conversationId ? null : item.conversationId;
	};

	const handleForward = (item) => {
		uni.showToast({
			title: '转发中...',
			icon: 'none'
		});
	};

	onMounted(() => {
		loadMessages();
	});
</script>

<style lang="scss" scoped>
	.detail-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f4f5f7;
	}

	.status-bar {
		height: var(--status-bar-height);
		background: #fff;
	}

	.nav-header {
display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    background: #fff;
    padding: 0 20rpx;
    /* 确保头部不被下方列表挤压 */
    flex-shrink: 0;

		.header-info {
		    /* 核心逻辑：让标题占据剩余空间 */
		    flex: 1; 
		    display: flex;
		    align-items: center;
		    justify-content: center;
		    /* 防止文字过长把按钮顶出去 */
		    overflow: hidden;

			.nav-avatar {
				width: 44rpx;
				height: 44rpx;
				border-radius: 50%;
				margin-right: 12rpx;
			}

			.nav-title {
				font-size: 30rpx;
				font-weight: 600;
			}
		}

		.back-btn{
    width: 80rpx;
    /* 关键修复：禁止压缩 */
    flex-shrink: 0; 
    /* 增加高度确保点击区域 */
    height: 88rpx; 
    display: flex;
    align-items: center;
    justify-content: flex-start;
}
		.header-right {
			width: 80rpx;
			display: flex;
			align-items: center;
		}
	}

	.chat-list {
		flex: 1;
		height: 0;
		padding: 20rpx;
		box-sizing: border-box;
	}

	.message-row {
		display: flex;
		margin-bottom: 30rpx;

		.avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 12rpx;
			flex-shrink: 0;
		}

		.bubble {
			padding: 20rpx;
			font-size: 28rpx;
			line-height: 1.6;
			word-break: break-all;
		}
	}

	.ai-row {
		.avatar {
			margin-right: 20rpx;
		}

		.ai-bubble {
			background: #fff;
			border-radius: 0 20rpx 20rpx 20rpx;
			max-width: 70%;
		}
	}

	.user-row {
		justify-content: flex-end;

		.avatar {
			margin-left: 20rpx;
		}

		.user-bubble {
			background: #007aff;
			color: #fff;
			border-radius: 20rpx 0 20rpx 20rpx;
			width: 66vw;
			padding: 16rpx;
		}

		.msg-image-large {
			width: 100%;
			border-radius: 12rpx;
			display: block;
		}
	}

	.time-stamp {
		text-align: center;
		font-size: 24rpx;
		color: #999;
		margin: 40rpx 0 20rpx;
	}

	.forward-icon {
		background: rgba(0, 0, 0, 0.4);
		padding: 10rpx;
		border-radius: 50%;
		margin-right: 15rpx;
	}

	.empty-state {
		padding-top: 300rpx;
		text-align: center;
		color: #999;
	}
</style>