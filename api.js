// api.js
import http from '@/utils/request.js'

/**
 * 认证相关 API
 */

// 0. 微信手机号快速登录（新方式 - 使用 code）
export function wechatLogin({
	loginCode,
	phoneCode
}) {
	return http.post('/auth/wechat-login', {
		loginCode,
		phoneCode
	})
}

// 1. 发送验证码
export function sendCode(phone) {
	return http.post('/auth/send-code', {
		phone
	})
}

// 2. 验证验证码登录（Android 后端接口）
// 登录接口不需要携带 token，因为这是获取 token 的接口
export function loginBySms(phone, code) {
	return http.post('/auth/verify', {
		phone,
		code
	})
}

// 3. 检查用户状态（不需要 token）
export function checkUserStatus(phone) {
	return http.get(`/auth/status/${phone}`)
}

/**
 * 设备相关 API
 */

// 4. 绑定设备
export function bindDevice(phone, sn) {
	console.log(' [API] 绑定设备请求:', { phone, sn, url: `/parent/${phone}/bind-device` });
	
	const requestData = { sn: sn };
	console.log(' [API] 请求数据:', JSON.stringify(requestData));
	
	return http.post(`/parent/${phone}/bind-device`, requestData);
}

// 5. 解绑设备
export function unbindDevice(phone) {
	return http.delete(`/parent/${phone}/device`)
}

// 6. 获取设备定位
export function getDeviceLocation(phone) {
	return http.get(`/parent/${phone}/device/location`, {}, {
		timeout: 20000
	})
}

/**
 * 用户相关 API
 */

// 7. 初次信息采集（这个接口一直在报500)
export function initialSetup(phone, data) {
	return http.post(`/parent/${phone}/initial-setup`, data)
}

// 8. 拉取基本信息
export function getFamilyProfile(phone) {
	return http.get(`/parent/${phone}/family-profile`)
}

// 9. 上报微信订阅信息（小程序端）
export function uploadWxSubscribeInfo(phone, openid, tmplIds = []) {
	return http.put(`/parent/${phone}/wx-subscribe-info`, {
		openid,
		tmplIds,
		platform: 'weixin_miniprogram'
	})
}

/**
 * 功能设置 API
 */

// 10. 设置功能概率
export function saveFunctionProbabilities(phone, data) {
	return http.put(`/parent/${phone}/device/function-probabilities`, data)
}

/**
 * 聊天相关 API
 */

// 11. 获取儿童聊天问题 - 正式上线版本
export function getChatQuestions(phone) {
	return http.get(`/parent/${phone}/questions`)
}

/**
 * 分析相关 API
 */

// 12. 获取儿童天赋分析 - 正式上线版本
export function getTalent(phone) {
	console.log('正在请求天赋分析，手机号:', phone);
	return http.get(`/parent/${phone}/talent-analysis`)
}

/**
 * 短信相关 API（后端实现）
 */

// 13. 发送 SOS 警报短信（语音短信）
export function sendSOSAlertSMS(phone, data) {
	return http.post('/sms/send-sos-alert', {
		phone,
		...data,
		voice: true
	})
}

// 14. 发送设备离线短信
export function sendDeviceOfflineSMS(phone, data) {
	return http.post('/sms/send-device-offline', {
		phone,
		...data
	})
}

// 15. 发送设备上线短信
export function sendDeviceOnlineSMS(phone, data) {
	return http.post('/sms/send-device-online', {
		phone,
		...data
	})
}

// 16. 获取短信设置
export function getSMSSettings(phone) {
	return http.get(`/parent/${phone}/sms-settings`)
}

// 17. 更新短信设置
export function updateSMSSettings(phone, settings) {
	return http.put(`/parent/${phone}/sms-settings`, settings)
}