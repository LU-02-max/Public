/**
 * 短信服务（SMS）
 * 用于 SOS 警报等重要通知的短信语音兜底
 *
 * 短信服务商选择：
 * 1. 阿里云短信
 * 2. 腾讯云短信
 * 3. 华为云短信
 * 4. 其他服务商
 *
 * 注意：短信发送需要在后端实现，前端只负责调用 API
 */

import http from '@/utils/request.js'

/**
 * 短信类型
 */
const SMS_TYPE = {
	SOS_ALERT: 'sos_alert',           // SOS 警报（语音）
	DEVICE_OFFLINE: 'device_offline',  // 设备离线
	DEVICE_ONLINE: 'device_online',    // 设备上线
	LOCATION_UPDATE: 'location_update', // 位置更新
	SYSTEM_NOTIFY: 'system_notify'      // 系统通知
}

/**
 * 短信模板变量
 */
const SMS_TEMPLATE = {
	// SOS 警报（语音短信）
	SOS_ALERT: {
		templateCode: 'SMS_SOS_ALERT',
		variables: ['childName', 'time', 'location']
	},

	// 设备离线
	DEVICE_OFFLINE: {
		templateCode: 'SMS_DEVICE_OFFLINE',
		variables: ['childName', 'deviceName', 'time']
	},

	// 设备上线
	DEVICE_ONLINE: {
		templateCode: 'SMS_DEVICE_ONLINE',
		variables: ['childName', 'deviceName', 'time']
	},

	// 位置更新
	LOCATION_UPDATE: {
		templateCode: 'SMS_LOCATION_UPDATE',
		variables: ['childName', 'location', 'time']
	}
}

class SMSService {
	constructor() {
		this.enabled = false
		this._loadSettings()
	}

	/**
	 * 从本地加载设置
	 */
	_loadSettings() {
		try {
			const settings = uni.getStorageSync('sms_settings')
			if (settings) {
				this.enabled = settings.enabled || false
				console.log('[SMSService] 短信服务已启用:', this.enabled)
			}
		} catch (e) {
			console.error('[SMSService] 加载设置失败', e)
		}
	}

	/**
	 * 保存设置
	 */
	_saveSettings() {
		try {
			uni.setStorageSync('sms_settings', {
				enabled: this.enabled
			})
		} catch (e) {
			console.error('[SMSService] 保存设置失败', e)
		}
	}

	/**
	 * 启用短信服务
	 */
	enable() {
		this.enabled = true
		this._saveSettings()
		console.log('[SMSService] 短信服务已启用')
	}

	/**
	 * 禁用短信服务
	 */
	disable() {
		this.enabled = false
		this._saveSettings()
		console.log('[SMSService] 短信服务已禁用')
	}

	/**
	 * 检查短信服务是否启用
	 */
	isEnabled() {
		return this.enabled
	}

	/**
	 * 发送 SOS 警报短信（语音短信）
	 * @param {Object} data - 短信数据
	 * @param {string} data.phone - 家长手机号
	 * @param {string} data.childName - 孩子姓名
	 * @param {string} data.location - 定位信息
	 * @param {string} data.time - 时间
	 */
	async sendSOSAlert(data) {
		if (!this.enabled) {
			console.log('[SMSService] 短信服务未启用，跳过发送')
			return { success: false, reason: 'service_disabled' }
		}

		const { phone, childName, location, time } = data

		try {
			console.log('[SMSService] 发送 SOS 警报短信', { phone, childName, location, time })

			// 调用后端 API 发送短信
			const result = await http.post('/sms/send-sos-alert', {
				phone,
				childName,
				location,
				time,
				voice: true // 语音短信
			})

			console.log('[SMSService] SOS 警报短信发送成功', result)
			return { success: true, data: result }
		} catch (error) {
			console.error('[SMSService] SOS 警报短信发送失败', error)
			return { success: false, error: error.message }
		}
	}

	/**
	 * 发送设备离线短信
	 * @param {Object} data - 短信数据
	 */
	async sendDeviceOffline(data) {
		if (!this.enabled) {
			console.log('[SMSService] 短信服务未启用，跳过发送')
			return { success: false, reason: 'service_disabled' }
		}

		const { phone, childName, deviceName, time } = data

		try {
			console.log('[SMSService] 发送设备离线短信', { phone, childName, deviceName, time })

			const result = await http.post('/sms/send-device-offline', {
				phone,
				childName,
				deviceName,
				time
			})

			console.log('[SMSService] 设备离线短信发送成功', result)
			return { success: true, data: result }
		} catch (error) {
			console.error('[SMSService] 设备离线短信发送失败', error)
			return { success: false, error: error.message }
		}
	}

	/**
	 * 发送设备上线短信
	 * @param {Object} data - 短信数据
	 */
	async sendDeviceOnline(data) {
		if (!this.enabled) {
			console.log('[SMSService] 短信服务未启用，跳过发送')
			return { success: false, reason: 'service_disabled' }
		}

		const { phone, childName, deviceName, time } = data

		try {
			console.log('[SMSService] 发送设备上线短信', { phone, childName, deviceName, time })

			const result = await http.post('/sms/send-device-online', {
				phone,
				childName,
				deviceName,
				time
			})

			console.log('[SMSService] 设备上线短信发送成功', result)
			return { success: true, data: result }
		} catch (error) {
			console.error('[SMSService] 设备上线短信发送失败', error)
			return { success: false, error: error.message }
		}
	}

	/**
	 * 发送位置更新短信
	 * @param {Object} data - 短信数据
	 */
	async sendLocationUpdate(data) {
		if (!this.enabled) {
			console.log('[SMSService] 短信服务未启用，跳过发送')
			return { success: false, reason: 'service_disabled' }
		}

		const { phone, childName, location, time } = data

		try {
			console.log('[SMSService] 发送位置更新短信', { phone, childName, location, time })

			const result = await http.post('/sms/send-location-update', {
				phone,
				childName,
				location,
				time
			})

			console.log('[SMSService] 位置更新短信发送成功', result)
			return { success: true, data: result }
		} catch (error) {
			console.error('[SMSService] 位置更新短信发送失败', error)
			return { success: false, error: error.message }
		}
	}
}

// 创建单例
const smsService = new SMSService()

export default smsService
export { SMS_TYPE, SMS_TEMPLATE }
