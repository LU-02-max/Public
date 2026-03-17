/**
 * 地图服务
 * 提供设备定位和地址解析功能
 */

import http from '@/utils/request.js'

const AMAP_WEB_API_KEY = '61b9f8f4357c8c3c010ba8dfd08dd532'
const BASE_URL = 'http://39.106.56.81:8082/api'

class MapService {
	/**
	 * 获取设备定位
	 * @param {String} phone 手机号
	 * @returns {Promise<Object|null>}
	 */
	async getDeviceLocation(phone) {
		try {
			const response = await http.get(
				`/parent/${phone}/device/location`,
				{},
				{ timeout: 20000 }
			)

			console.log('[MapService] 获取位置信息成功', response)
			return response
		} catch (e) {
			console.error('[MapService] 获取位置信息失败', e)
			return null
		}
	}

	/**
	 * 逆地理编码
	 * 将经纬度转换为地址
	 * @param {Number} longitude 经度
	 * @param {Number} latitude 纬度
	 * @returns {Promise<String>}
	 */
	async reverseGeocode(longitude, latitude) {
		try {
			const coords = `${longitude},${latitude}`
			const url = `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_WEB_API_KEY}&location=${coords}&output=json&extensions=base`

			const response = await new Promise((resolve, reject) => {
				uni.request({
					url,
					method: 'GET',
					timeout: 10000,
					success: (res) => {
						resolve(res)
					},
					fail: (err) => {
						reject(err)
					}
				})
			})

			if (response.statusCode === 200) {
				const data = response.data
				if (data.status === '1' && data.regeocode) {
					return data.regeocode.formatted_address || '地址解析失败'
				}
				return '地址解析失败'
			}

			return '网络请求失败'
		} catch (e) {
			console.error('[MapService] 逆地理编码异常', e)
			return '逆地理编码请求异常'
		}
	}

	/**
	 * 打开地图导航
	 * @param {Number} longitude 目标经度
	 * @param {Number} latitude 目标纬度
	 * @param {String} name 目标名称
	 */
	openNavigation(longitude, latitude, name = '目标位置') {
		// #ifdef APP-PLUS
		plus.map.openSysMap(
			{ point: { lng: longitude, lat: latitude }, name },
			result => {
				console.log('[MapService] 打开地图导航成功', result)
			},
			error => {
				console.error('[MapService] 打开地图导航失败', error)
				uni.showToast({
					title: '打开地图失败',
					icon: 'none'
				})
			}
		)
		// #endif

		// #ifdef MP-WEIXIN
		wx.openLocation({
			latitude,
			longitude,
			name,
			scale: 18
		})
		// #endif

		// #ifndef APP-PLUS || MP-WEIXIN
		console.log('[MapService] 打开地图导航', { longitude, latitude, name })
		// #endif
	}
}

// 创建单例
const mapService = new MapService()

export default mapService
