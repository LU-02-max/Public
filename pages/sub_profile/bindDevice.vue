<template>
	<view class="bind-device-container">
		<view class="info-section">
			<image class="device-icon" src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/device.png" mode="aspectFit" />
			<text class="info-title">{{ isBound ? '设备已绑定' : '绑定设备' }}</text>
			<text class="info-desc">
				{{ isBound ? '您的账号已绑定设备，如需更换请先解绑' : '请输入设备序列号（SN码）绑定您的宝贝设备' }}
			</text>
		</view>

		<view class="input-section">
			<view class="input-group">
				<text class="input-label">设备序列号</text>
				<view v-if="!isBound" class="input-wrapper">
					<input class="input-field" v-model="deviceSn" placeholder="请输入或扫一扫获取设备SN码"
						placeholder-class="input-placeholder" :disabled="isLoading" />
				<button class="scan-button" @click="handleScanCode" :disabled="isLoading">
					<text class="scan-icon">📷</text>
					<text>扫一扫</text>
				</button>
				</view>
				<view v-else class="bound-sn-display">
					<text class="sn-text">{{ currentDeviceId }}</text>
					<text class="status-tag">在线</text>
				</view>
			</view>
		</view>

		<view class="submit-section">
			<button v-if="!isBound" class="submit-button" :class="{ 'btn-loading': isLoading }" @click="handleBind"
				:disabled="isLoading">
				{{ isLoading ? '正在绑定...' : '确认绑定' }}
			</button>

			<button v-else class="unbind-button" @click="handleUnbind" :disabled="isLoading">
				{{ isLoading ? '正在处理...' : '解除绑定' }}
			</button>
		</view>

		<view class="tips-section">
			<text class="tips-title">温馨提示：</text>
			<view class="tips-content">
				<text class="tips-text">• 设备序列号通常在设备背面标签上</text>
				<text class="tips-text">• 可通过"扫一扫"功能快速识别SN码</text>
				<text class="tips-text">• 一个账号仅支持绑定一个主设备</text>
				<text class="tips-text">• 解绑后将无法接收该设备的实时数据</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		onUnmounted
	} from 'vue';
	import userStore from '@/store/user.js';
	import authViewModel from '@/viewmodels/auth.js';

	// --- 响应式数据 ---
	const deviceSn = ref('');
	const isLoading = ref(false);
	const currentUser = ref({
		phone: userStore.user?.phone || '',
		deviceBound: userStore.user?.deviceBound || false,
		deviceId: userStore.user?.deviceId || '',
		isLoggedIn: userStore.user?.isLoggedIn || false
	});
	let unsubscribe = null;

	// --- 计算属性 ---
	const isBound = computed(() => !!currentUser.value?.deviceBound);

	const currentDeviceId = computed(() => {
		// 即使字段缺失也显示占位符，不显示 undefined
		return currentUser.value?.deviceId || '已成功绑定';
	});

	const userPhone = computed(() => currentUser.value?.phone || '');

	// --- 生命周期与订阅 ---
	onMounted(() => {
		if (typeof userStore.subscribe === 'function') {
			unsubscribe = userStore.subscribe((user) => {
				currentUser.value = user ? {
					...user
				} : {};
			});
		}
	});

	onUnmounted(() => {
		if (unsubscribe) unsubscribe();
	});

	// --- 逻辑方法 ---

	/**
	 * 绑定设备
	 */
	const handleBind = async () => {
		const sn = deviceSn.value.trim();

		// 优先从 userStore 获取最新手机号，而不是从缓存
		const phone = userStore.user?.phone || userPhone.value;

		console.log(' [绑定] 页面数据检查:', {
			deviceSn: sn,
			userPhone: phone,
			currentUser: currentUser.value,
			userStore: userStore.user
		});

		// 移除SN码验证，任何SN号都可以通过
		if (!sn) {
			return uni.showToast({
				title: '请输入SN码',
				icon: 'none'
			});
		}

		if (!phone) {
			console.error(' [绑定] 无法获取手机号，跳转回登录页');
			uni.showToast({
				title: '用户信息异常，请重新登录',
				icon: 'none'
			});
			// 延迟跳转，让用户看到提示
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/login/login'
				});
			}, 1500);
			return;
		}

		isLoading.value = true;
		try {
			const success = await authViewModel.bindDevice(phone, sn);
			if (success) {
				uni.showToast({
					title: '绑定成功',
					icon: 'success'
				});

				// UserStore 会自动检测并跳转到编辑信息页面
				// 这里只需要显示成功提示即可
			} else {
				uni.showToast({
					title: '绑定失败',
					icon: 'none'
				});
			}
		} catch (e) {
			console.error(' [绑定] 绑定异常:', e);
			uni.showToast({
				title: e.message || '绑定失败',
				icon: 'none'
			});
		} finally {
			isLoading.value = false;
		}
	};

	/**
	 * 解除绑定 (Vue3 增强版)
	 */
	const handleUnbind = () => {
		uni.showModal({
			title: '解除绑定',
			content: '确定要解绑当前设备吗？解绑后将自动退出登录。',
			confirmColor: '#FF5E5E',
			success: async (res) => {
				if (res.confirm) {
					isLoading.value = true;
					try {
						// 优先从 userStore 获取最新手机号
						const unbindPhone = userStore.user?.phone || userPhone.value;
						console.log(' [解绑] 使用的手机号:', unbindPhone);

						if (!unbindPhone) {
							throw new Error('无法获取用户手机号');
						}

						await authViewModel.unbindDevice(unbindPhone);

						// 2. 无论接口后续逻辑如何，只要没进 catch 说明请求发出了
						uni.showToast({
							title: '解绑成功',
							icon: 'success'
						});

						// 延迟 1 秒退出，让用户看清 Toast
						setTimeout(async () => {
							await userStore.clearAndExit();
						}, 1000);

					} catch (e) {
						// 3. 容错处理：报错通常是因为 Token 随解绑立即失效了 (401/404)
						// 这种情况对用户来说其实就是"解绑成功并注销"
						console.warn('解绑异常(可能已失效):', e);
						await userStore.clearAndExit();
					} finally {
						isLoading.value = false;
					}
				}
			}
		});
	};

	/**
	 * 扫一扫功能
	 */
	const handleScanCode = () => {
		console.log('📱 [扫码] 启动扫一扫功能...');
		
		// 平台兼容性检查
		// #ifdef MP-WEIXIN
		// 微信小程序环境
		wx.getSetting({
			success: (res) => {
				if (res.authSetting['scope.camera']) {
					// 已授权，直接扫码
					startScanning();
				} else {
					// 未授权，请求权限
					wx.authorize({
						scope: 'scope.camera',
						success: () => {
							startScanning();
						},
						fail: () => {
							uni.showModal({
								title: '提示',
								content: '需要相机权限才能使用扫一扫功能',
								showCancel: false
							});
						}
					});
				}
			},
			fail: () => {
				startScanning(); // 获取设置失败，尝试直接扫码
			}
		});
		// #endif
		
		// #ifndef MP-WEIXIN
		// 非微信小程序环境，直接扫码
		startScanning();
		// #endif
		
		function startScanning() {
			// 检查扫一扫权限
			uni.scanCode({
			success: (res) => {
				console.log('📱 [扫码] 扫码成功:', res);
				
				let scannedResult = '';
				
				// 处理不同来源的扫码结果
				if (res.result) {
					scannedResult = res.result;
				} else if (res.scanType === 'QR_CODE' && res.result) {
					scannedResult = res.result;
				} else if (res.charSet && res.result) {
					scannedResult = res.result;
				}
				
				// 提取SN号（假设扫码结果是包含SN号的文本）
				const extractedSn = extractSNFromResult(scannedResult);
				
				if (extractedSn) {
					deviceSn.value = extractedSn;
					uni.showToast({
						title: 'SN号识别成功',
						icon: 'success',
						duration: 1500
					});
					console.log('✅ [扫码] SN号提取成功:', extractedSn);
				} else {
					uni.showToast({
						title: '未能识别有效SN号',
						icon: 'none',
						duration: 2000
					});
					console.warn('⚠️ [扫码] 未能从扫描结果中提取SN号:', scannedResult);
				}
			},
			fail: (err) => {
				console.error('❌ [扫码] 扫码失败:', err);
				
				let errorMessage = '扫码失败';
				if (err.errMsg) {
					if (err.errMsg.includes('permission')) {
						errorMessage = '请允许相机权限';
					} else if (err.errMsg.includes('cancel')) {
						errorMessage = '用户取消扫码';
					} else if (err.errMsg.includes('not support')) {
						errorMessage = '设备不支持扫码功能';
					}
				}
				
				uni.showToast({
					title: errorMessage,
					icon: 'none',
					duration: 2000
				});
			},
			complete: () => {
				console.log('📱 [扫码] 扫码流程结束');
			}
		});
		}
	};

	/**
	 * 从扫码结果中提取SN号
	 */
	const extractSNFromResult = (result) => {
		if (!result || typeof result !== 'string') {
			return '';
		}
		
		console.log('🔍 [提取] 原始扫码结果:', result);
		
		// 常见SN号格式的正则表达式
		const snPatterns = [
			/S[Nn][:：\s]*([A-Za-z0-9-_]+)/i,           // SN:xxx 或 SN：xxx
			/Serial[:：\s]*([A-Za-z0-9-_]+)/i,          // Serial:xxx
			/设备序列号[:：\s]*([A-Za-z0-9-_]+)/i,      // 设备序列号:xxx
			/设备ID[:：\s]*([A-Za-z0-9-_]+)/i,         // 设备ID:xxx
			/ID[:：\s]*([A-Za-z0-9-_]+)/i,            // ID:xxx
			/^([A-Za-z0-9]{8,})$/,                   // 8位以上的字母数字组合（单独的SN号）
			/([A-Za-z0-9-_]{10,})/,                 // 10位以上的组合（长SN号）
		];
		
		// 尝试匹配各种格式
		for (const pattern of snPatterns) {
			const match = result.match(pattern);
			if (match && match[1]) {
				const extractedSN = match[1].trim();
				console.log('✅ [提取] 成功提取SN号:', extractedSN);
				return extractedSN;
			}
		}
		
		// 如果没有匹配到特定格式，但整个结果看起来像SN号
		if (result.length >= 6 && /^[A-Za-z0-9-_]+$/.test(result.trim())) {
			const cleanedResult = result.trim();
			console.log('✅ [提取] 整个结果作为SN号:', cleanedResult);
			return cleanedResult;
		}
		
		console.warn('⚠️ [提取] 未能提取有效SN号');
		return '';
	};
</script>

<style lang="scss" scoped>
	/* 样式保持不变 */
	.bind-device-container {
		min-height: 100vh;
		background: #F7F9FB;
		padding: 32rpx;
		box-sizing: border-box;
	}

	.info-section {
		text-align: center;
		padding: 60rpx 0 40rpx;

		.device-icon {
			width: 180rpx;
			height: 180rpx;
			border-radius: 40rpx;
			margin-bottom: 24rpx;
			background: #fff;
		}

		.info-title {
			display: block;
			font-size: 44rpx;
			font-weight: 600;
			color: #2D3436;
			margin-bottom: 12rpx;
		}

		.info-desc {
			display: block;
			font-size: 26rpx;
			color: #95A5A6;
			line-height: 1.5;
			padding: 0 60rpx;
		}
	}

	.input-section {
		background: #ffffff;
		border-radius: 32rpx;
		padding: 40rpx;
		margin-top: 20rpx;

		.input-label {
			display: block;
			font-size: 28rpx;
			font-weight: 500;
			color: #636E72;
			margin-bottom: 20rpx;
		}

	.input-wrapper {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.input-field {
		flex: 1;
		height: 100rpx;
		background: #F1F2F6;
		border-radius: 20rpx;
		padding: 0 30rpx;
		font-size: 32rpx;
		box-sizing: border-box;
	}

	.scan-button {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 0 24rpx;
		height: 100rpx;
		background: rgba(109, 190, 246, 0.1);
		border: 2rpx solid #6DBEF6;
		border-radius: 20rpx;
		color: #6DBEF6;
		font-size: 26rpx;
		white-space: nowrap;
		transition: all 0.3s ease;

		.scan-icon {
			font-size: 32rpx;
			line-height: 1;
		}

		&:active {
			background: rgba(109, 190, 246, 0.2);
			transform: scale(0.98);
		}

		&[disabled] {
			opacity: 0.5;
			background: #f5f5f5;
			border-color: #ddd;
			color: #999;
		}
	}

		.bound-sn-display {
			height: 100rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			background: #F1F2F6;
			border-radius: 20rpx;
			padding: 0 30rpx;

			.sn-text {
				color: #2D3436;
				font-weight: 600;
				font-size: 34rpx;
			}

			.status-tag {
				font-size: 22rpx;
				background: #E3F2FD;
				color: #8CD0FC;
				padding: 4rpx 16rpx;
				border-radius: 8rpx;
			}
		}
	}

	.submit-section {
		margin-top: 60rpx;

		.submit-button {
			height: 100rpx;
			line-height: 100rpx;
			background: linear-gradient(135deg, #8CD0FC, #70BCF8);
			color: #fff;
			font-size: 32rpx;
			font-weight: 600;
			border-radius: 50rpx;
			border: none;
		}

		.unbind-button {
			height: 100rpx;
			line-height: 100rpx;
			background: transparent;
			color: #FF5E5E;
			font-size: 32rpx;
			font-weight: 600;
			border-radius: 50rpx;
			border: 2rpx solid #FF5E5E;
		}
	}

	.tips-section {
		margin-top: 80rpx;
		padding: 30rpx;
		background: rgba(140, 208, 252, 0.08);
		border-radius: 20rpx;

		.tips-title {
			display: block;
			font-size: 28rpx;
			font-weight: 600;
			color: #70BCF8;
			margin-bottom: 12rpx;
		}

		.tips-text {
			display: block;
			font-size: 24rpx;
			color: #7F8C8D;
			line-height: 1.8;
		}
	}
</style>