// service-track.js
/**
 * 追踪 API 服务
 * 用于上报埋点数据
 */

class TrackApiService {
	constructor() {
		this.baseUrl = 'http://39.106.56.81:8083'
	}

	/**
	 * 添加设备绑定关系
	 * @param {Object} params
	 * @param {String} params.phone 手机号
	 * @param {String} params.sn 设备序列号
	 * @param {Date|String} params.bindTime 绑定时间
	 * @param {String} params.status 状态
	 */
	async addDeviceBinding({ phone, sn, bindTime, status = 'active' }) {
		try {
			const response = await new Promise((resolve, reject) => {
				uni.request({
					url: `${this.baseUrl}/api/device-bindings/add`,
					method: 'POST',
					header: { 'Content-Type': 'application/json' },
					data: {
						phone,
						sn,
						bindTime: new Date(bindTime).toISOString(),
						status
					},
					success: resolve,
					fail: reject
				})
			})

			return response.statusCode === 200
		} catch (e) {
			console.error('[TrackApiService] 添加设备绑定失败', e)
			return false
		}
	}

	/**
	 * 添加家长端事件
	 * @param {Object} params
	 * @param {String} params.eventId 事件 ID
	 * @param {String} params.eventName 事件名称
	 * @param {String} params.phone 手机号
	 * @param {Date|String} params.eventTimestamp 事件时间戳
	 * @param {String} params.sn 设备序列号（可选）
	 * @param {String} params.deviceModel 设备型号（可选）
	 * @param {String} params.status 状态
	 * @param {Object} params.properties 扩展属性（可选）
	 */
	async addParentEvent({
		eventId,
		eventName,
		phone,
		eventTimestamp,
		sn,
		deviceModel,
		status = 'success',
		properties
	}) {
		try {
			const body = {
				eventId,
				eventName,
				status,
				phone,
				eventTimestamp: new Date(eventTimestamp).toISOString()
			}

			// 可选字段
			if (sn) body.sn = sn
			if (deviceModel) body.deviceModel = deviceModel
			if (properties) body.properties = JSON.stringify(properties)

			const response = await new Promise((resolve, reject) => {
				uni.request({
					url: `${this.baseUrl}/api/parent-events/add`,
					method: 'POST',
					header: { 'Content-Type': 'application/json' },
					data: body,
					success: resolve,
					fail: reject
				})
			})

			return response.statusCode === 200
		} catch (e) {
			console.error('[TrackApiService] 添加家长端事件失败', e)
			return false
		}
	}

	/**
	 * 添加用户画像
	 * @param {Object} params
	 * @param {String} params.phone 手机号
	 * @param {Number} params.totalParentUsageDuration 家长端总使用时长
	 * @param {Date|String} params.lastParentUsage 最后使用时间
	 * @param {Date|String} params.startParentUsage 开始使用时间
	 * @param {Number} params.childAge 儿童年龄
	 * @param {String} params.childGender 儿童性别
	 * @param {Date|String} params.childBirthdate 儿童生日
	 * @param {String} params.boundSn 绑定设备序列号
	 * @param {Date|String} params.firstPowerOnTime 首次开机时间
	 * @param {Number} params.totalDeviceUsageDuration 设备总使用时长
	 * @param {Date|String} params.lastDeviceUsage 设备最后使用时间
	 * @param {Date|String} params.startDeviceUsage 设备开始使用时间
	 */
	async addUserProfile({
		phone,
		totalParentUsageDuration,
		lastParentUsage,
		startParentUsage,
		childAge,
		childGender,
		childBirthdate,
		boundSn,
		firstPowerOnTime,
		totalDeviceUsageDuration,
		lastDeviceUsage,
		startDeviceUsage
	}) {
		try {
			const body = { phone }

			// 可选字段
			if (totalParentUsageDuration !== undefined) body.totalParentUsageDuration = totalParentUsageDuration
			if (lastParentUsage) body.lastParentUsage = new Date(lastParentUsage).toISOString()
			if (startParentUsage) body.startParentUsage = new Date(startParentUsage).toISOString()
			if (childAge !== undefined) body.childAge = childAge
			if (childGender) body.childGender = childGender
			if (childBirthdate) {
				const date = new Date(childBirthdate)
				body.childBirthdate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
			}
			if (boundSn) body.boundSn = boundSn
			if (firstPowerOnTime) body.firstPowerOnTime = new Date(firstPowerOnTime).toISOString()
			if (totalDeviceUsageDuration !== undefined) body.totalDeviceUsageDuration = totalDeviceUsageDuration
			if (lastDeviceUsage) body.lastDeviceUsage = new Date(lastDeviceUsage).toISOString()
			if (startDeviceUsage) body.startDeviceUsage = new Date(startDeviceUsage).toISOString()

			const response = await new Promise((resolve, reject) => {
				uni.request({
					url: `${this.baseUrl}/api/user-profiles/add`,
					method: 'POST',
					header: { 'Content-Type': 'application/json' },
					data: body,
					success: resolve,
					fail: reject
				})
			})

			return response.statusCode === 200
		} catch (e) {
			console.error('[TrackApiService] 添加用户画像失败', e)
			return false
		}
	}
}

// 创建单例
const trackApiService = new TrackApiService()

export default trackApiService
