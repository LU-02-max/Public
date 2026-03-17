// viewmodels/profile.js
// 个人中心页 ViewModel - uniapp 版本

import trackingService from '@/services/tracking.js'
import userStore from '@/store/user.js'
import { BaseViewModel } from '@/utils/base-viewmodel.js'

// 个人中心 ViewModel
class ProfileViewModel extends BaseViewModel {
	constructor() {
		super()
	}
	
	// 编辑资料点击
	async onEditProfileTap() {
		// 记录埋点
		await trackingService.trackEvent('profile_edit_click', {
			click_time: new Date().toISOString(),
			user_id: userStore.phone,
		})
		
		// 执行导航
		uni.navigateTo({
			url: '/pages/profile/edit'
		})
	}
	
	// 我的设备点击
	async onMyDeviceTap() {
		await trackingService.trackEvent('my_device_click', {
			click_time: new Date().toISOString(),
			user_id: userStore.phone,
			device_bound: userStore.deviceBound,
		})
		
		uni.navigateTo({
			url: '/pages/profile/bind'
		})
	}
	
	// 关于我们点击
	async onAboutUsTap() {
		await trackingService.trackEvent('about_us_click', {
			click_time: new Date().toISOString(),
		})
		
		uni.navigateTo({
			url: '/pages/sub_profile/aboutus'
		})
	}
	
	// SOS紧急联系设置点击
	async onSosTap() {
		await trackingService.trackEvent('sos_settings_click', {
			click_time: new Date().toISOString(),
		})
		
		// TODO: 跳转到SOS设置页面
		// uni.navigateTo({ url: '/pages/profile/sos' })
		uni.showToast({
			title: '功能开发中',
			icon: 'none'
		})
	}
	
	// 我的研学报名点击
	async onStudyRegistrationTap() {
		await trackingService.trackEvent('study_registration_click', {
			click_time: new Date().toISOString(),
		})
		
		// TODO: 跳转到研学报名页面
		// uni.navigateTo({ url: '/pages/profile/study' })
		uni.showToast({
			title: '功能开发中',
			icon: 'none'
		})
	}
	
	// 帮助与反馈点击
	async onHelpFeedbackTap() {
		await trackingService.trackEvent('help_feedback_click', {
			click_time: new Date().toISOString(),
		})
		
		// TODO: 跳转到帮助与反馈页面
		// uni.navigateTo({ url: '/pages/profile/help' })
		uni.showToast({
			title: '功能开发中',
			icon: 'none'
		})
	}
	
	// 页面显示事件
	async trackPageView() {
		await trackingService.trackPageView('profile_page')
		
		// 额外记录用户访问个人中心的事件
		await trackingService.trackEvent('profile_page_view', {
			user_id: userStore.phone,
			view_time: new Date().toISOString(),
			is_logged_in: userStore.isLoggedIn,
		})
	}
}

// 导出单例
const profileViewModel = new ProfileViewModel()
export default profileViewModel
