<!-- pages/help/help.vue -->
<!-- 帮助与支持页面 - Flutter转UniApp版本 -->

<template>
	<view class="help-container">
		<!-- 1. 客服引导卡片 -->
		<view class="customer-service-card">
			<text class="service-title">专属客服服务</text>
			<text class="service-desc">扫码添加客服微信，为您提供 1对1 咨询</text>
			
			<!-- 二维码图片 -->
			<view class="qr-code-container">
				<image 
					src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/QRcode.png"
					class="qr-code-image"
					mode="aspectFit"
					@error="handleImageError"
				/>
				<view v-if="imageError" class="qr-code-error">
					<uni-icons type="qr" size="60" color="#999"></uni-icons>
				</view>
			</view>
			
			<text class="service-tags">使用问题 · 设备报修 · 课程咨询</text>
		</view>

		<!-- 2. 常见问题部分 -->
		<view class="faq-section">
			<text class="section-title">基础使用帮助</text>
			
			<view 
				v-for="(faq, index) in faqs" 
				:key="index" 
				class="faq-item"
			>
				<view class="faq-question" @click="toggleFAQ(index)">
					<uni-icons type="help" size="20" color="#64B5F6"></uni-icons>
					<text class="question-text">{{ faq.q }}</text>
					<uni-icons 
						:type="faq.expanded ? 'up' : 'down'" 
						size="16" 
						color="#666"
					></uni-icons>
				</view>
				
				<view v-if="faq.expanded" class="faq-answer">
					<text class="answer-text">{{ faq.a }}</text>
				</view>
			</view>
		</view>

		<!-- 3. 底部版本信息 -->
		<view class="version-info">
			<text class="version-text">版本号: 1.0.0</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			imageError: false,
			faqs: [
				{
					q: "如何调整孩子的认知权重？",
					a: "在『探索半径』页面点击右上角设置，通过拖动雷达图的小圆点即可自定义分配。",
					expanded: false
				},
				{
					q: "数据同步失败怎么办？",
					a: "请检查您的网络连接，或尝试在个人中心退出并重新登录。",
					expanded: false
				},
				{
					q: "如何查看孩子的周度成长报表？",
					a: "我们会在每周一上午 10:00 通过消息通知为您推送上周的深度认知分析。",
					expanded: false
				},
				{
					q: "设备无法连接 App？",
					a: "请确保手机蓝牙已开启，并靠近设备。若仍无效，请长按设备复位键 5 秒。",
					expanded: false
				}
			]
		}
	},

	/**
	 * 页面加载
	 */
	onLoad() {
		console.log('📱 [Help] 页面加载完成')
	},

	/**
	 * 页面显示
	 */
	onShow() {
		console.log('📱 [Help] 页面显示')
	},

	methods: {
		//  处理图片加载错误
		handleImageError() {
			console.warn('📱 [Help] 二维码图片加载失败')
			this.imageError = true
		},

		//  切换FAQ展开/收起状态
		toggleFAQ(index) {
			console.log(`📱 [Help] 切换FAQ ${index}:`, this.faqs[index].expanded ? '收起' : '展开')
			
			// 关闭其他展开的FAQ（可选，保持只有一个展开）
			// this.faqs.forEach((faq, i) => {
			// 	faq.expanded = i === index ? !faq.expanded : false
			// })
			
			// 或者切换当前FAQ（允许多个同时展开）
			this.faqs[index].expanded = !this.faqs[index].expanded
		}
	}
}
</script>

<style lang="scss" scoped>
.help-container {
	padding: 32rpx 40rpx;
	background: #F8F9FA;
	min-height: 100vh;
}

// 客服卡片样式
.customer-service-card {
	width: 100%;
	background: white;
	border-radius: 48rpx;
	padding: 48rpx;
	margin-bottom: 40rpx;
	box-shadow: 0 20rpx 40rpx rgba(59, 130, 246, 0.06);
	display: flex;
	flex-direction: column;
	align-items: center;
}

.service-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #1A1A1A;
	margin-bottom: 16rpx;
}

.service-desc {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 48rpx;
	text-align: center;
}

.qr-code-container {
	position: relative;
	width: 360rpx;
	height: 360rpx;
	margin-bottom: 48rpx;
	border-radius: 32rpx;
	overflow: hidden;
}

.qr-code-image {
	width: 100%;
	height: 100%;
	border-radius: 32rpx;
}

.qr-code-error {
	width: 100%;
	height: 100%;
	background: #f5f5f5;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 32rpx;
}

.service-tags {
	font-size: 26rpx;
	color: #2196F3;
	font-weight: 500;
	text-align: center;
}

// FAQ部分样式
.faq-section {
	width: 100%;
	margin-bottom: 60rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 24rpx;
	padding-left: 16rpx;
}

.faq-item {
	background: white;
	border-radius: 32rpx;
	margin-bottom: 24rpx;
	overflow: hidden;
}

.faq-question {
	display: flex;
	align-items: center;
	padding: 32rpx;
	cursor: pointer;
	transition: background-color 0.2s ease;
	
	&:active {
		background-color: #f8f9fa;
	}
}

.question-text {
	flex: 1;
	font-size: 28rpx;
	color: #333;
	margin-left: 16rpx;
	margin-right: 16rpx;
}

.faq-answer {
	padding: 0 32rpx 32rpx 72rpx; // 左边更多padding给图标留空间
	border-top: 1rpx solid #f0f0f0;
}

.answer-text {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
}

// 版本信息样式
.version-info {
	width: 100%;
	text-align: center;
	margin-bottom: 40rpx;
}

.version-text {
	font-size: 24rpx;
	color: #999;
}

// 响应式适配
@media (max-width: 750rpx) {
	.help-container {
		padding: 24rpx 32rpx;
	}
	
	.customer-service-card {
		padding: 32rpx;
		border-radius: 32rpx;
	}
	
	.qr-code-container {
		width: 300rpx;
		height: 300rpx;
	}
}
</style>