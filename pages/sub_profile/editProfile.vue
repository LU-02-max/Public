<!-- pages/sub_profile/editProfile.vue -->
<template>
	<view class="edit-container">
		<view class="status-bar"></view>
		<view class="nav-header">
			<view class="back-btn" @click="goBack">
				<uni-icons type="left" size="24" color="#fff"></uni-icons>
			</view>
			<text class="nav-title">编辑资料</text>
			<view style="width: 80rpx;"></view>
		</view>

		<view class="avatar-section">
			<view class="avatar-wrapper">
				<image class="main-avatar" :src="formData.childGender === '女' ? 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/female.png' : 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/male.png'" mode="aspectFill"></image>
				<view class="camera-icon">
					<uni-icons type="camera-filled" size="18" color="#333"></uni-icons>
				</view>
			</view>
		</view>

		<view class="form-list">
			<view class="form-item">
				<text class="label">孩子昵称</text>
				<input class="input" v-model="formData.childNickname" placeholder="请输入昵称" maxlength="10" />
				<uni-icons type="compose" size="22" color="#333"></uni-icons>
			</view>

			<view class="form-item" @click="openGenderModal">
				<text class="label">性别</text>
				<text class="value">{{ formData.childGender }}</text>
				<uni-icons type="person" size="22" color="#333"></uni-icons>
			</view>

			<picker mode="date" :value="formData.childBirthdate" :end="maxDate" @change="onDateChange">
				<view class="form-item">
					<text class="label">生日</text>
					<text class="value">{{ formData.childBirthdate || '请选择' }} {{ ageText }}</text>
					<uni-icons type="birthday-cake" size="22" color="#333"></uni-icons>
				</view>
			</picker>

			<view class="form-item" @click="openRelationModal">
				<text class="label">您是孩子的</text>
				<text class="value">{{ formData.parentRelationship }}</text>
				<uni-icons type="staff" size="22" color="#333"></uni-icons>
			</view>
		</view>

		<button class="submit-btn" :loading="loading" :disabled="loading" @click="submitForm">
			{{ loading ? '正在保存...' : '完成' }}
		</button>

		<view class="modal-mask" v-if="showGenderModal" @click="showGenderModal = false">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="btn-cancel" @click="showGenderModal = false">取消</text>
					<text class="modal-title">选择性别</text>
					<text class="btn-confirm" @click="confirmGender">确定</text>
				</view>
				<view class="gender-cards">
					<view :class="['gender-card', tempGender === '男' ? 'active-male' : '']" @click="selectTempGender('男')">
						<image class="gender-img" :src="'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/male.png'"></image>
						<text class="gender-name">小王子</text>
					</view>
					<view :class="['gender-card', tempGender === '女' ? 'active-female' : '']" @click="selectTempGender('女')">
						<image class="gender-img" :src="'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/female.png'"></image>
						<text class="gender-name">小公主</text>
					</view>
				</view>
			</view>
		</view>

		<view class="modal-mask" v-if="showRelationModal" @click="showRelationModal = false">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="btn-cancel" @click="showRelationModal = false">取消</text>
					<text class="modal-title">身份确认</text>
					<text class="btn-confirm" @click="confirmRelation">确定</text>
				</view>
				<picker-view class="relation-picker" :value="tempRelationIndex" @change="onRelationScroll">
					<picker-view-column>
						<view class="picker-item" v-for="(item, index) in relationOptions" :key="index">{{ item }}</view>
					</picker-view-column>
				</picker-view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import http from '@/utils/request.js';
import userStore from '@/store/user.js';
import envConfig from '@/config/env.js';

// 图片基础路径
const IMAGE_BASE = envConfig.IMAGE_BASE;

// --- 状态定义 ---
const loading = ref(false);
const showGenderModal = ref(false);
const showRelationModal = ref(false);

const relationOptions = ['爸爸', '妈妈', '爷爷', '奶奶', '姥姥', '姥爷', '其他家人'];
const tempGender = ref('');  // 用于在点击确定前暂存选择
const tempRelationIndex = ref([0]); // PickerView 的索引

// --- 表单响应式对象 ---
const formData = reactive({
	childNickname: '',
	childGender: '',
	childBirthdate: '',
	parentRelationship: ''
});

/**
 * [生命周期] 页面显示时同步全局 Store 数据
 */
onShow(() => {
	console.log(' [EditProfile] 页面进入，拉取全局 Store 数据...');
	const user = userStore.user;

	//  检查登录态拦截
	if (!user.phone && !userStore.isDev) {
		console.warn('❗ 未登录用户拦截，跳转登录页');
		uni.reLaunch({ url: '/pages/login/index' });
		return;
	}

	// 数据回显：将 Store 数据赋值给表单（不预设任何默认值）
	formData.childNickname = user.childNickname || '';
	formData.childGender = user.childGender || '';
	formData.childBirthdate = user.childBirthdate || '';
	formData.parentRelationship = user.parentRelationship || '';

	// 同步用于 Modal 暂存的初始值
	tempGender.value = formData.childGender;
	console.log('✅ [EditProfile] 初始数据加载完毕:', JSON.stringify(formData));
});

/**
 * [计算属性] 根据生日计算年龄展示文本
 */
const ageText = computed(() => {
	if (!formData.childBirthdate) return '';
	const birth = new Date(formData.childBirthdate);
	const now = new Date();
	let age = now.getFullYear() - birth.getFullYear();
	return `(${Math.max(0, age)}岁)`;
});

// 日期选择器最大值（今天）
const maxDate = computed(() => {
	const today = new Date();
	return today.toISOString().split('T')[0];
});

/**
 * [逻辑] 性别选择逻辑
 */
const openGenderModal = () => {
	tempGender.value = formData.childGender; // 开启弹窗时重置暂存值
	showGenderModal.value = true;
};
const selectTempGender = (g) => {
	tempGender.value = g;
	console.log(' 用户点击暂选性别:', g);
};
const confirmGender = () => {
	formData.childGender = tempGender.value;
	showGenderModal.value = false;
	console.log('✅ 性别修改确认:', formData.childGender);
};

/**
 * [逻辑] 日期变更逻辑
 */
const onDateChange = (e) => { 
	formData.childBirthdate = e.detail.value; 
	console.log(' 生日变更确认:', formData.childBirthdate);
};

/**
 * [逻辑] 家庭关系选择逻辑
 */
const openRelationModal = () => {
	// 找到当前选中的关系在选项中的索引
	const idx = relationOptions.indexOf(formData.parentRelationship);
	tempRelationIndex.value = [idx > -1 ? idx : 0];
	showRelationModal.value = true;
};
const onRelationScroll = (e) => { 
	tempRelationIndex.value = e.detail.value; 
	console.log(' 关系滚动停止，当前索引:', tempRelationIndex.value[0]);
};
const confirmRelation = () => { 
	formData.parentRelationship = relationOptions[tempRelationIndex.value[0]]; 
	showRelationModal.value = false; 
	console.log('✅ 关系修改确认:', formData.parentRelationship);
};

/**
 * [校验] 校验表单数据
 */
const validateForm = () => {
	// 必填校验
	if (!formData.childNickname.trim()) {
		uni.showToast({ title: '请输入孩子昵称', icon: 'none' });
		return false;
	}

	if (!formData.childGender) {
		uni.showToast({ title: '请选择孩子性别', icon: 'none' });
		return false;
	}

	if (!formData.childBirthdate) {
		uni.showToast({ title: '请选择孩子生日', icon: 'none' });
		return false;
	}

	if (!formData.parentRelationship) {
		uni.showToast({ title: '请选择您与孩子的关系', icon: 'none' });
		return false;
	}

	// 生日日期范围限制：不能是未来日期，且不能超过18岁
	const birthDate = new Date(formData.childBirthdate);
	const now = new Date();
	const maxAgeDate = new Date();
	maxAgeDate.setFullYear(now.getFullYear() - 18);

	if (birthDate > now) {
		uni.showToast({ title: '生日不能是未来日期', icon: 'none' });
		return false;
	}

	if (birthDate < maxAgeDate) {
		uni.showToast({ title: '孩子年龄不能超过18岁', icon: 'none' });
		return false;
	}

	// 昵称长度限制
	if (formData.childNickname.length > 10) {
		uni.showToast({ title: '昵称不能超过10个字', icon: 'none' });
		return false;
	}

	return true;
};

/**
 * [核心逻辑] 提交表单保存到后端和全局 Store
 */
const submitForm = async () => {
	// 防重复提交
	if (loading.value) return;

	// 表单校验
	if (!validateForm()) return;

	loading.value = true;
	console.log(' [EditProfile] 开始保存，请求数据:', JSON.stringify(formData));

	try {
		const currentPhone = userStore.user.phone;

		// 发起网络请求
		await http.post(`/parent/${currentPhone}/initial-setup`, formData);
		console.log(' 后端接口保存成功');

		// 同步更新全局 Store 状态
		userStore.updateProfile(formData);

		// 更新用户状态为非新用户
		userStore.user.newUser = false;
		await userStore.saveUserData();
		console.log('✅ 用户信息编辑完成，更新为非新用户状态');

		uni.showToast({ title: '资料已更新', icon: 'success' });

		// 判断是否是新用户首次填写（决定是否跳转欢迎动画）
		const isNewUser = userStore.user.newUser === false && !userStore.user.hasSeenWelcome;

		if (isNewUser) {
			// 新用户首次完成，跳转欢迎动画
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/welcome/welcome',
					success: () => console.log('✅ [EditProfile] 跳转进场动画成功'),
					fail: (err) => {
						console.error('❌ [EditProfile] 跳转进场动画失败:', err);
						uni.reLaunch({ url: '/pages/index/index' });
					}
				});
			}, 1000);
		} else {
			// 老用户修改，直接返回上一页
			setTimeout(() => {
				uni.navigateBack({
					fail: () => {
						uni.switchTab({ url: '/pages/index/index' });
					}
				});
			}, 500);
		}

	} catch (e) {
		console.error('❌ [EditProfile] 保存流程异常:', e);
		uni.showToast({ title: '网络繁忙，请稍后再试', icon: 'none' });
	} finally {
		loading.value = false;
	}
};

/**
 * 返回上一页
 */
const goBack = () => {
	uni.navigateBack();
};
</script>

<style lang="scss" scoped>
/* 保持你的原版样式，增加了一些交互增强 */
.edit-container { min-height: 100vh; background-color: #F8F9FB; }
.status-bar { height: var(--status-bar-height); background-color: #6DBEF6; }

.nav-header {
	display: flex; align-items: center; justify-content: space-between;
	height: 88rpx; background: #6DBEF6; color: #fff;
	.back-btn { width: 80rpx; display: flex; justify-content: center; }
	.nav-title { font-size: 34rpx; font-weight: bold; }
}

.avatar-section {
	background: #6DBEF6; padding: 30rpx 0 80rpx; display: flex; justify-content: center;
	.avatar-wrapper {
		position: relative; width: 170rpx; height: 170rpx;
		.main-avatar { 
			width: 100%; height: 100%; border-radius: 50%; 
			background: #fff; border: 4rpx solid rgba(255,255,255,0.8);
		}
		.camera-icon {
			position: absolute; right: 0; bottom: 0;
			background: #FFB948; width: 50rpx; height: 50rpx; border-radius: 50%;
			display: flex; align-items: center; justify-content: center; border: 4rpx solid #6DBEF6;
		}
	}
}

.form-list {
	margin: -40rpx 30rpx 0;
	.form-item {
		background: #fff; padding: 35rpx 40rpx; display: flex; align-items: center;
		border-radius: 20rpx; margin-bottom: 20rpx;
		box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02);
		transition: background 0.2s;
		&:active { background: #f9f9f9; } // 点击效果反馈
		.label { width: 220rpx; font-size: 30rpx; color: #666; }
		.input, .value { flex: 1; font-size: 30rpx; color: #333; font-weight: 500; }
	}
}

/* 通用弹窗蒙层 */
.modal-mask {
	position: fixed; top: 0; left: 0; right: 0; bottom: 0;
	background: rgba(0,0,0,0.5); z-index: 999;
	display: flex; align-items: flex-end;
}
.modal-content {
	width: 100%; background: #fff; border-radius: 30rpx 30rpx 0 0; padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
	.modal-header {
		display: flex; justify-content: space-between; padding: 30rpx 40rpx;
		border-bottom: 1rpx solid #eee;
		.modal-title { font-weight: bold; font-size: 32rpx; color: #333; }
		.btn-cancel { color: #999; font-size: 30rpx; }
		.btn-confirm { color: #6DBEF6; font-weight: bold; font-size: 30rpx; }
	}
}

/* 关系滚动选择器样式 */
.relation-picker {
	width: 100%; height: 400rpx;
	.picker-item {
		display: flex; align-items: center; justify-content: center;
		font-size: 34rpx; color: #333;
	}
}

/* 性别卡片样式 */
.gender-cards {
	display: flex; justify-content: space-around; padding: 60rpx 40rpx;
	.gender-card {
		width: 260rpx; height: 300rpx; border-radius: 20rpx; border: 4rpx solid #f0f0f0;
		display: flex; flex-direction: column; align-items: center; justify-content: center;
		transition: all 0.3s;
		.gender-img { width: 150rpx; height: 150rpx; margin-bottom: 15rpx; }
		.gender-name { font-size: 28rpx; color: #666; }
		&.active-male { border-color: #6DBEF6; background: #f0f9ff; transform: scale(1.05); }
		&.active-female { border-color: #FF8FBD; background: #fff0f6; transform: scale(1.05); }
	}
}

.submit-btn {
	margin: 60rpx 40rpx; background: #6DBEF6; color: #fff; border-radius: 50rpx;
	height: 100rpx; display: flex; align-items: center; justify-content: center; 
	font-weight: bold; border: none;
	&[disabled] { opacity: 0.6; }
}
</style>