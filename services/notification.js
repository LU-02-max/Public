/**
 * 统一通知服务
 * 整合微信订阅消息 + 短信语音兜底（方案 C）
 *
 * 工作流程：
 * 1. 优先发送微信订阅消息
 * 2. 如果是 SOS 警报，同时发送短信语音兜底
 * 3. 记录发送日志
 */

import wxNoticeService from '@/services/wx-notice.js'
import smsService from '@/services/sms.js'
import { uploadWxSubscribeInfo } from '@/api.js'
import { getWxOpenid } from '@/util-wx-login.js'

/**
 * 通知优先级
 */
const NOTIFICATION_PRIORITY = {
	HIGH: 'high',       // 高优先级（SOS 警报）
	NORMAL: 'normal',   // 普通优先级
	LOW: 'low'         // 低优先级
}

/**
 * 通知类型
 */
const NOTIFICATION_TYPE = {
	SOS_ALERT: 'sos_alert',           // SOS 警报
	DEVICE_OFFLINE: 'device_offline',  // 设备离线
	DEVICE_ONLINE: 'device_online',    // 设备上线
	LOCATION_UPDATE: 'location_update', // 位置更新
	SYSTEM_NOTIFY: 'system_notify'      // 系统通知
}

class NotificationService {
	constructor() {
		this.log = []
		this._loadLog()
	}

	/**
	 * 加载通知日志
	 */
	_loadLog() {
		try {
			const stored = uni.getStorageSync('notification_log')
			if (stored) {
				this.log = JSON.parse(stored)
			}
		} catch (e) {
			console.error('[NotificationService] 加载日志失败', e)
		}
	}

	/**
	 * 保存通知日志
	 */
	_saveLog() {
		try {
			// 只保留最近 100 条日志
			const logToSave = this.log.slice(-100)
			uni.setStorageSync('notification_log', JSON.stringify(logToSave))
		} catch (e) {
			console.error('[NotificationService] 保存日志失败', e)
		}
	}

	/**
	 * 添加日志
	 */
	_addLog(type, channel, success, data) {
		this.log.push({
			timestamp: new Date().toISOString(),
			type,
			channel,    // 'wx' 或 'sms'
			success,
			data
		})
		this._saveLog()
	}

	/**
	 * 获取日志
	 */
	getLog() {
		return this.log
	}

	/**
	 * 发送通知（自动选择渠道）
	 * @param {Object} options - 通知选项
	 * @param {string} options.type - 通知类型
	 * @param {string} options.phone - 家长手机号
	 * @param {Object} options.data - 通知数据
	 * @param {string} options.priority - 优先级
	 */
	async sendNotification(options) {
		const { type, phone, data, priority = NOTIFICATION_PRIORITY.NORMAL } = options

		console.log('[NotificationService] 发送通知', { type, phone, priority })

		// 并发发送微信订阅消息和短信
		const promises = []

		// 1. 发送微信订阅消息
		promises.push(this._sendWxMessage(type, phone, data))

		// 2. 如果是 SOS 警报或高优先级，发送短信兜底
		if (type === NOTIFICATION_TYPE.SOS_ALERT || priority === NOTIFICATION_PRIORITY.HIGH) {
			promises.push(this._sendSMS(type, phone, data))
		}

		// 等待所有发送完成
		const results = await Promise.allSettled(promises)

		// 记录结果
		results.forEach((result, index) => {
			const channel = index === 0 ? 'wx' : 'sms'
			this._addLog(type, channel, result.status === 'fulfilled', result.value)
		})

		return results
	}

	/**
	 * 发送微信订阅消息
	 */
	async _sendWxMessage(type, phone, data) {
		try {
			console.log('[NotificationService] 发送微信订阅消息', type, data)

			// 检查是否已订阅对应模板
			const isSubscribed = this._checkWxSubscription(type)

			if (!isSubscribed) {
				console.log('[NotificationService] 未订阅微信消息模板，跳过')
				return { channel: 'wx', success: false, reason: 'not_subscribed' }
			}

			// 这里应该调用后端发送微信订阅消息
			// 前端只上报订阅信息，实际发送由后端完成
			const openid = getWxOpenid()
			if (openid) {
				// 上报订阅信息（确保后端有最新的 openid 和模板列表）
				await uploadWxSubscribeInfo(phone, openid, wxNoticeService.getSubscribedTemplates())
			}

			return { channel: 'wx', success: true }
		} catch (error) {
			console.error('[NotificationService] 微信订阅消息发送失败', error)
			return { channel: 'wx', success: false, error: error.message }
		}
	}

	/**
	 * 检查微信订阅状态
	 */
	_checkWxSubscription(type) {
		// 根据类型检查对应的模板是否已订阅
		const templateMap = {
			[NOTIFICATION_TYPE.SOS_ALERT]: 'YOUR_SOS_ALERT_TEMPLATE_ID',
			[NOTIFICATION_TYPE.DEVICE_OFFLINE]: 'YOUR_DEVICE_OFFLINE_TEMPLATE_ID',
			[NOTIFICATION_TYPE.DEVICE_ONLINE]: 'YOUR_DEVICE_ONLINE_TEMPLATE_ID',
			[NOTIFICATION_TYPE.LOCATION_UPDATE]: 'YOUR_LOCATION_UPDATE_TEMPLATE_ID'
		}

		const tmplId = templateMap[type]
		return tmplId ? wxNoticeService.isSubscribed(tmplId) : false
	}

	/**
	 * 发送短信
	 */
	async _sendSMS(type, phone, data) {
		try {
			console.log('[NotificationService] 发送短信', type, data)

			let result
			switch (type) {
				case NOTIFICATION_TYPE.SOS_ALERT:
					result = await smsService.sendSOSAlert({
						phone,
						...data
					})
					break
				case NOTIFICATION_TYPE.DEVICE_OFFLINE:
					result = await smsService.sendDeviceOffline({
						phone,
						...data
					})
					break
				case NOTIFICATION_TYPE.DEVICE_ONLINE:
					result = await smsService.sendDeviceOnline({
						phone,
						...data
					})
					break
				case NOTIFICATION_TYPE.LOCATION_UPDATE:
					result = await smsService.sendLocationUpdate({
						phone,
						...data
					})
					break
				default:
					result = { success: false, reason: 'unknown_type' }
			}

			return { channel: 'sms', ...result }
		} catch (error) {
			console.error('[NotificationService] 短信发送失败', error)
			return { channel: 'sms', success: false, error: error.message }
		}
	}

	/**
	 * 发送 SOS 警报通知
	 * @param {Object} options
	 * @param {string} options.phone - 家长手机号
	 * @param {string} options.childName - 孩子姓名
	 * @param {string} options.location - 定位信息
	 * @param {string} options.time - 时间
	 */
	async sendSOSAlert(options) {
		const { phone, childName, location, time } = options

		return await this.sendNotification({
			type: NOTIFICATION_TYPE.SOS_ALERT,
			phone,
			data: {
				childName,
				location,
				time
			},
			priority: NOTIFICATION_PRIORITY.HIGH
		})
	}

	/**
	 * 发送设备离线通知
	 */
	async sendDeviceOffline(options) {
		const { phone, childName, deviceName, time } = options

		return await this.sendNotification({
			type: NOTIFICATION_TYPE.DEVICE_OFFLINE,
			phone,
			data: {
				childName,
				deviceName,
				time
			},
			priority: NOTIFICATION_PRIORITY.NORMAL
		})
	}

	/**
	 * 发送设备上线通知
	 */
	async sendDeviceOnline(options) {
		const { phone, childName, deviceName, time } = options

		return await this.sendNotification({
			type: NOTIFICATION_TYPE.DEVICE_ONLINE,
			phone,
			data: {
				childName,
				deviceName,
				time
			},
			priority: NOTIFICATION_PRIORITY.NORMAL
		})
	}

	/**
	 * 发送位置更新通知
	 */
	async sendLocationUpdate(options) {
		const { phone, childName, location, time } = options

		return await this.sendNotification({
			type: NOTIFICATION_TYPE.LOCATION_UPDATE,
			phone,
			data: {
				childName,
				location,
				time
			},
			priority: NOTIFICATION_PRIORITY.NORMAL
		})
	}

	/**
	 * 请求订阅所有通知消息
	 * 建议在用户登录时调用
	 */
	async requestAllSubscriptions(phone) {
		try {
			// 1. 请求微信订阅消息
			const wxResult = await wxNoticeService.subscribeAllRecommended()

			// 2. 如果成功，上报订阅信息
			if (wxResult.success) {
				const openid = getWxOpenid()
				if (openid) {
					await uploadWxSubscribeInfo(phone, openid, wxNoticeService.getSubscribedTemplates())
				}
			}

			// 3. 启用短信服务
			smsService.enable()

			console.log('[NotificationService] 通知订阅完成')
			return {
				success: true,
				wx: wxResult,
				sms: { enabled: smsService.isEnabled() }
			}
		} catch (error) {
			console.error('[NotificationService] 通知订阅失败', error)
			return {
				success: false,
				error: error.message
			}
		}
	}

	/**
	 * 清除通知日志
	 */
	clearLog() {
		this.log = []
		this._saveLog()
	}
}

// 创建单例
const notificationService = new NotificationService()

export default notificationService
export { NOTIFICATION_TYPE, NOTIFICATION_PRIORITY }
