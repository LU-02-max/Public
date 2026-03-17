<template>
	<view class="container">
		<view :style="{ height: statusBarHeight + 'px' }" class="status-bar"></view>

		<view class="header">
			<text class="title">{{ username }}的壮游记录</text>
			<uni-icons type="refresh" size="24" color="#40a9ff" @click="fetchData"></uni-icons>
		</view>

		<scroll-view scroll-y class="list-view" 
			refresher-enabled 
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresh">
			
			<view v-if="loading" class="center-box">
				<uni-load-more status="loading"></uni-load-more>
			</view>
			
			<view v-else-if="groups.length === 0" class="center-box">
				<text class="empty-text">暂无记录，快去和壮游机开启对话吧</text>
			</view>

			<view v-else v-for="item in groups" :key="item.targetId" class="chat-item" @tap="goToDetail(item)">
				<image class="avatar" :src="getAIImage(item.targetId)" mode="aspectFill"></image>
				
				<view class="content">
					<text class="name">{{ getDisplayName(item.targetId) }}</text>
					<text class="last-msg">{{ item.lastMessage }}</text>
				</view>
				
				<view class="badge" v-if="item.count > 0">
					<text class="badge-text">{{ item.count }}</text>
				</view>
				<uni-icons type="right" size="14" color="#ccc"></uni-icons>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue';
	import { onShow, onLoad } from '@dcloudio/uni-app'; 
	import { getDisplayName, getAIImage } from '@/utils/chat-constants.js';
	import http from '@/utils/request.js';
	import userStore from '@/store/user.js';

	// --- 响应式状态定义 ---
	const username = ref('用户');      // 页面顶部显示的用户名
	const groups = ref([]);           // 归档后的聊天列表数据
	const loading = ref(false);       // 是否显示初次加载动画
	const statusBarHeight = ref(44);  // 状态栏高度
	const isRefreshing = ref(false);  // 下拉刷新控件的状态控制

	/**
	 * [生命周期] 页面显示时执行
	 *  逻辑：每次进入页面强制同步全局 Store 里的最新名字
	 * 解决：在个人资料页修改名字后，回到这里能立即刷新
	 */
	onShow(() => {
		console.log(' [ChatList] 页面 onShow，开始检查用户信息...');
		
		// 1. 从中央仓库 userStore 中读取数据
		const currentUser = userStore.user;
		
		// 2. 逻辑：优先取孩子昵称，其次是用户名，最后兜底用“用户”
		const finalName = currentUser.childNickname || currentUser.username || '用户';
		
		// 3. 更新界面显示
		username.value = finalName;
		
		console.log(' [ChatList] 当前内存中的 User 对象:', currentUser);
		console.log('️ [ChatList] 最终选用的渲染昵称:', finalName);

		//  调试提示：如果你看到还是“小可爱(测)”，
		// 请去 store/user.js 检查 DEV_MODE 是否强行重写了 this.user
		if (finalName === '小可爱(测)') {
			console.warn('⚠️ [ChatList] 注意：当前显示的是测试名。请检查 store/user.js 的 init 逻辑');
		}
	});

	/**
	 * [核心函数] 获取问答历史记录
	 *  逻辑：向后端请求该手机号下的所有对话记录，并进行前端归类
	 */
	const fetchData = async () => {
		const phone = userStore.user?.phone;
		
		if (!phone) {
			console.error('❌ [ChatList] 手机号缺失，取消数据拉取');
			return;
		}

		loading.value = true;
		console.log(` [ChatList] >>> 正在请求 API: /parent/${phone}/questions`);
		
		try {
			// 发起网络请求
			const res = await http.get(`/parent/${phone}/questions`);
			console.log(' [ChatList] <<< 原始数据请求成功:', res);

			//  逻辑处理：将扁平的数据按 AI 类型（aiModel）进行“分堆”
			processGroups(res);
			
		} catch (e) {
			console.error('❌ [ChatList] 获取历史记录失败:', e);
			uni.showToast({ title: '加载失败', icon: 'none' });
		} finally {
			loading.value = false;
			isRefreshing.value = false;
			console.log(' [ChatList] 数据刷新流程结束');
		}
	};

	/**
	 * [逻辑函数] 数据分类与归档
	 * @param {Array} data 后端返回的原始数组
	 *  逻辑：按 AI 身份分组，每组只显示最新的一条消息作为预览
	 */
	const processGroups = (data) => {
		if (!data || data.length === 0) {
			groups.value = [];
			return;
		}
		
		console.log('️ [ChatList] 开始按 AI 模型归类对话...');
		const list = Array.isArray(data) ? data : [data];
		const map = {};

		// 1. 将数据按 aiModel 字段放入不同的槽位
		list.forEach(item => {
			const modelKey = item.aiModel || 'default';
			if (!map[modelKey]) map[modelKey] = [];
			map[modelKey].push(item);
		});

		// 2. 将每个槽位里的数据进行整理
		groups.value = Object.keys(map).map(key => {
			const conversations = map[key];
			
			// 对组内消息按时间从新到旧排序
			conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
			
			return {
				targetId: key, 
				// 预览文字逻辑：优先显示 AI 回答，没回答就显示提问文字
				lastMessage: conversations[0].answerText || conversations[0].questionText || '[无内容]',
				count: conversations.length,
				conversations: conversations 
			};
		}).sort((a, b) => {
			// 3.  列表整体排序：把最新聊过天的 AI 排在最上面
			return new Date(b.conversations[0].timestamp) - new Date(a.conversations[0].timestamp);
		});
		
		console.log('✅ [ChatList] 列表整理完毕，共计分组:', groups.value.length);
	};

	/**
	 * [交互函数] 跳转详情页
	 * @param {Object} item 会话组对象
	 *  逻辑：先存入 Storage 避免 URL 传参过长丢失数据
	 */
	const goToDetail = (item) => {
		console.log(` [ChatList] 跳转详情页，AI 类型: ${item.targetId}`);
		
		const dName = getDisplayName(item.targetId);
		const iPath = getAIImage(item.targetId);

		try {
			//  关键：将该组所有聊天记录存入临时缓存，供详情页读取
			uni.setStorageSync('current_chat_conversations', item.conversations);
			
			// 跳转并传递 UI 展示所需的参数
			uni.navigateTo({
				url: `/pages/sub_detail/chat/detail?targetId=${item.targetId}&displayName=${dName}&imagePath=${iPath}`
			});
		} catch (e) {
			console.error('❌ [ChatList] 页面跳转准备失败:', e);
		}
	};

	/**
	 * [交互函数] 处理用户下拉刷新动作
	 */
	const onRefresh = () => {
		console.log(' [ChatList] 用户手动触发下拉刷新');
		isRefreshing.value = true;
		fetchData();
	};

	// --- 获取系统信息 ---
	onLoad(() => {
		// 获取状态栏高度
		uni.getSystemInfo({
			success: (res) => {
				statusBarHeight.value = res.statusBarHeight || 44;
			}
		});
	});

	// 初始加载：页面第一次挂载时拉取一次数据
	onMounted(() => {
		fetchData();
	});
</script>

<style lang="scss" scoped>
	/*  样式层：保持简洁与反馈感 */
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #F0F9FB;
	}

	.status-bar {
		width: 100%;
		background-color: #ffffff;
	}

	.header {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 32rpx 32rpx;
		background-color: #ffffff;
		border-bottom: 1rpx solid #eee;
		position: relative;

		.title {
			font-size: 36rpx;
			font-weight: bold;
			color: #40a9ff;
			text-align: center;
		}

		uni-icons {
			position: absolute;
			right: 32rpx;
		}
	}

	.list-view {
		flex: 1;
		height: 0; // 必须设置高度或 flex 才能滚动
	}

	.chat-item {
		margin: 20rpx 24rpx;
		padding: 30rpx;
		background-color: #fff;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
		transition: all 0.1s active;
		
		&:active {
			background-color: #fafafa;
			transform: scale(0.98); // 轻微按下缩放感
		}
	}

	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 16rpx;
		background-color: #f0f0f0;
	}

	.content {
		flex: 1;
		margin: 0 24rpx;
		overflow: hidden;

		.name {
			font-size: 32rpx;
			color: #333;
			font-weight: 500;
			margin-bottom: 8rpx;
			display: block;
		}

		.last-msg {
			font-size: 26rpx;
			color: #999;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			display: block;
		}
	}

	.badge {
		background-color: #e6f7ff;
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
		margin-right: 10rpx;

		.badge-text {
			color: #1890ff;
			font-size: 22rpx;
			font-weight: bold;
		}
	}

	.center-box {
		padding-top: 200rpx;
		text-align: center;
		color: #999;
		font-size: 28rpx;
	}
</style>