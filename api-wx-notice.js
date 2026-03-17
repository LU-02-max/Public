/**
 * 微信订阅消息相关 API
 * 用于后端发送微信订阅消息
 */

import http from '@/utils/request.js'

/**
 * 上报微信订阅消息设置
 * 对应原安卓的 uploadPushToken 接口
 * @param {String} phone 手机号
 * @param {String} openid 微信 openid
 * @param {Array<String>} tmplIds 已授权的模板 ID 列表
 * @returns {Promise<Boolean>}
 */
export function uploadWxSubscribeInfo(phone, openid, tmplIds = []) {
	return http.put(`/parent/${phone}/wx-subscribe-info`, {
		openid,
		tmplIds,
		platform: 'weixin_miniprogram'
	})
}

/**
 * 发送 SOS 警报订阅消息
 * @param {String} phone 家长手机号
 * @param {Object} data 消息数据
 * @param {String} data.time SOS 时间
 * @param {String} data.location 位置信息
 * @param {String} data.address 详细地址
 * @returns {Promise<Boolean>}
 */
export function sendSOSAlertMessage(phone, data) {
	return http.post(`/parent/${phone}/send-sos-message`, {
		templateId: 'SOS_ALERT_TEMPLATE_ID', // 需要替换为实际的模板 ID
		data: {
			time: data.time,
			location: data.location,
			address: data.address
		}
	})
}

/**
 * 发送设备离线通知
 * @param {String} phone 家长手机号
 * @param {Object} data 消息数据
 * @param {String} data.deviceName 设备名称
 * @param {String} data.offlineTime 离线时间
 * @returns {Promise<Boolean>}
 */
export function sendDeviceOfflineMessage(phone, data) {
	return http.post(`/parent/${phone}/send-device-offline-message`, {
		templateId: 'DEVICE_OFFLINE_TEMPLATE_ID',
		data: {
			deviceName: data.deviceName,
			offlineTime: data.offlineTime
		}
	})
}

/**
 * 发送设备上线通知
 * @param {String} phone 家长手机号
 * @param {Object} data 消息数据
 * @param {String} data.deviceName 设备名称
 * @param {String} data.onlineTime 上线时间
 * @returns {Promise<Boolean>}
 */
export function sendDeviceOnlineMessage(phone, data) {
	return http.post(`/parent/${phone}/send-device-online-message`, {
		templateId: 'DEVICE_ONLINE_TEMPLATE_ID',
		data: {
			deviceName: data.deviceName,
			onlineTime: data.onlineTime
		}
	})
}

/**
 * 发送位置更新通知
 * @param {String} phone 家长手机号
 * @param {Object} data 消息数据
 * @param {String} data.location 位置坐标
 * @param {String} data.address 地址
 * @param {String} data.updateTime 更新时间
 * @returns {Promise<Boolean>}
 */
export function sendLocationUpdateMessage(phone, data) {
	return http.post(`/parent/${phone}/send-location-message`, {
		templateId: 'LOCATION_UPDATE_TEMPLATE_ID',
		data: {
			location: data.location,
			address: data.address,
			updateTime: data.updateTime
		}
	})
}

/**
 * 发送系统通知
 * @param {String} phone 家长手机号
 * @param {Object} data 消息数据
 * @param {String} data.title 标题
 * @param {String} data.content 内容
 * @param {String} data.time 时间
 * @returns {Promise<Boolean>}
 */
export function sendSystemNotifyMessage(phone, data) {
	return http.post(`/parent/${phone}/send-system-message`, {
		templateId: 'SYSTEM_NOTIFY_TEMPLATE_ID',
		data: {
			title: data.title,
			content: data.content,
			time: data.time
		}
	})
}

/**
 * 批量发送订阅消息
 * @param {Array<Object>} messages 消息数组
 * @param {String} messages[].phone 手机号
 * @param {String} messages[].templateId 模板 ID
 * @param {Object} messages[].data 消息数据
 * @returns {Promise<Boolean>}
 */
export function sendBatchSubscribeMessages(messages) {
	return http.post('/parent/send-batch-messages', {
		messages
	})
}
