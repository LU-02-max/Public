// services/tracking.js
/**
 * 家长端追踪服务
 * 用于记录各种用户行为事件
 */

import trackApiService from '../service-track.js'
import { generateUUID } from '../utils/uuid.js'

class ParentTrackingService {
	constructor() {
		this.currentPhone = ''
		this.boundSn = ''
		this.usageTimer = null
		this.sessionStartTime = null
		this.currentSessionDuration = 0
	}

	/**
	 * 设置当前用户
	 */
	setCurrentUser(phone) {
		this.currentPhone = phone
		console.log('[TrackingService] 设置当前用户', phone)
	}

	/**
	 * 设置绑定的设备
	 */
	setBoundDevice(sn) {
		this.boundSn = sn
		console.log('[TrackingService] 设置绑定设备', sn)
	}

	/**
	 * 记录设备绑定事件
	 */
	async trackDeviceBind(phone, sn) {
		const bindTime = new Date()

		// 调用绑定接口
		const success = await trackApiService.addDeviceBinding({
			phone,
			sn,
			bindTime,
			status: 'active'
		})

		if (success) {
			this.boundSn = sn
			this.currentPhone = phone

			// 记录绑定成功事件
			await this.trackEvent({
				eventName: 'device_bind_success',
				properties: {
					sn: sn,
					bind_time: bindTime.toISOString()
				}
			})

			// 更新用户画像
			await trackApiService.addUserProfile({
				phone,
				boundSn: sn,
				startParentUsage: new Date()
			})

			console.log('[TrackingService] 设备绑定成功')
		} else {
			// 记录绑定失败事件
			await this.trackEvent({
				eventName: 'device_bind_failed',
				status: 'failed',
				properties: {
					sn: sn,
					error: 'api_failed'
				}
			})

			console.error('[TrackingService] 设备绑定失败')
		}

		return success
	}

	/**
	 * 记录通用事件
	 */
	async trackEvent({
		eventName,
		properties = {},
		status = 'success'
	}) {
		// 如果当前用户为空，静默跳过埋点，不阻塞主逻辑
		if (!this.currentPhone) {
			// 静默跳过，不输出警告以免污染控制台
			return
		}

		try {
			return await trackApiService.addParentEvent({
				eventId: generateUUID(),
				eventName,
				phone: this.currentPhone,
				eventTimestamp: new Date(),
				sn: this.boundSn,
				deviceModel: this._getDeviceModel(),
				status,
				properties: Object.keys(properties).length > 0 ? properties : null
			})
		} catch (e) {
			// 埋点失败不应该影响主流程，静默处理
			console.debug('[TrackingService] 埋点记录失败，已静默处理', eventName, e)
		}
	}

	/**
	 * 获取设备型号
	 */
	_getDeviceModel() {
		// #ifdef APP-PLUS
		return plus.device.model
		// #endif

		// #ifdef MP-WEIXIN
		try {
			const systemInfo = uni.getSystemInfoSync()
			return systemInfo.model
		} catch (e) {
			return 'Unknown Device'
		}
		// #endif

		return 'Unknown Device'
	}

	/**
	 * 应用启动事件
	 */
	async trackAppLaunch() {
		await this.trackEvent({
			eventName: 'app_launch',
			properties: {
				launch_time: new Date().toISOString()
			}
		})

		// 开始会话计时
		this.startSession()
	}

	/**
	 * 应用退出事件
	 */
	async trackAppExit() {
		await this.endSession()

		await this.trackEvent({
			eventName: 'app_exit',
			properties: {
				exit_time: new Date().toISOString(),
				last_session_duration: this.currentSessionDuration
			}
		})
	}

	/**
	 * 开始使用会话
	 */
	startSession() {
		this.sessionStartTime = new Date()
		this.currentSessionDuration = 0

		// 每10分钟上报一次心跳
		this.usageTimer = setInterval(() => {
			this.currentSessionDuration += 600
			this._trackUsageHeartbeat()
		}, 600000) // 600秒 = 10分钟

		console.log('[TrackingService] 开始会话')
	}

	/**
	 * 结束使用会话
	 */
	async endSession() {
		if (this.usageTimer) {
			clearInterval(this.usageTimer)
			this.usageTimer = null
		}

		if (this.sessionStartTime) {
			const now = new Date()
			const sessionDuration = Math.floor((now - this.sessionStartTime) / 1000) // 秒

			// 上报会话结束
			await this.trackEvent({
				eventName: 'session_end',
				properties: {
					session_duration: sessionDuration,
					start_time: this.sessionStartTime.toISOString(),
					end_time: now.toISOString()
				}
			})

			// 更新用户画像中的使用时长
			if (this.currentPhone) {
				await trackApiService.addUserProfile({
					phone: this.currentPhone,
					totalParentUsageDuration: sessionDuration,
					lastParentUsage: now
				})
			}

			this.sessionStartTime = null
			this.currentSessionDuration = 0

			console.log('[TrackingService] 结束会话', { sessionDuration })
		}
	}

	/**
	 * 使用心跳
	 */
	async _trackUsageHeartbeat() {
		await this.trackEvent({
			eventName: 'usage_heartbeat',
			properties: {
				current_session_duration: this.currentSessionDuration,
				heartbeat_time: new Date().toISOString()
			}
		})
	}

	/**
	 * 记录页面访问
	 */
	async trackPageView(pageName) {
		await this.trackEvent({
			eventName: 'page_view',
			properties: {
				page_name: pageName,
				view_time: new Date().toISOString()
			}
		})
	}

	/**
	 * 记录内容点击
	 */
	async trackContentClick({
		contentId,
		contentType,
		contentTitle
	}) {
		await this.trackEvent({
			eventName: 'content_click',
			properties: {
				content_id: contentId,
				content_type: contentType,
				content_title: contentTitle,
				click_time: new Date().toISOString()
			}
		})
	}

	/**
	 * 记录分享行为
	 */
	async trackShare({
		shareType,
		contentId,
		platform
	}) {
		await this.trackEvent({
			eventName: 'share_action',
			properties: {
				share_type: shareType,
				content_id: contentId,
				share_platform: platform,
				share_time: new Date().toISOString()
			}
		})
	}

	/**
	 * 记录社交行为（点赞、收藏等）
	 */
	async trackSocialAction({
		actionType, // like, favorite, comment
		targetId,
		targetType
	}) {
		await this.trackEvent({
			eventName: 'social_action',
			properties: {
				action_type: actionType,
				target_id: targetId,
				target_type: targetType,
				action_time: new Date().toISOString()
			}
		})
	}

	/**
	 * 记录用户资料更新
	 */
	async trackProfileUpdate(profileData) {
		await this.trackEvent({
			eventName: 'profile_update',
			properties: {
				...profileData,
				update_time: new Date().toISOString()
			}
		})

		// 同时更新用户画像
		if (this.currentPhone) {
			await trackApiService.addUserProfile({
				phone: this.currentPhone,
				childAge: profileData.child_age,
				childGender: profileData.child_gender,
				childBirthdate: profileData.child_birthdate
			})
		}
	}

	/**
	 * 记录登录事件
	 */
	async trackLogin({
		isSuccess = true,
		error
	}) {
		await this.trackEvent({
			eventName: 'login',
			status: isSuccess ? 'success' : 'failed',
			properties: {
				login_time: new Date().toISOString(),
				is_success: isSuccess,
				error: error
			}
		})
	}

	/**
	 * 记录登出事件
	 */
	async trackLogout() {
		await this.endSession()

		await this.trackEvent({
			eventName: 'logout',
			properties: {
				logout_time: new Date().toISOString()
			}
		})
	}

	/**
	 * 清理资源
	 */
	dispose() {
		if (this.usageTimer) {
			clearInterval(this.usageTimer)
			this.usageTimer = null
		}
	}
}

// 创建单例
const parentTrackingService = new ParentTrackingService()

export default parentTrackingService
