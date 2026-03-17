// viewmodels/explore.js
// 探索页 ViewModel - uniapp 版本

import { getDeviceLocation } from '@/api.js'
import mapService from '@/services/map.js'

// 探索点模型
class ExploreModel {
	constructor({
		latitude = 0,
		longitude = 0,
		timestamp = null,
		distance = 0,
	} = {}) {
		this.latitude = latitude
		this.longitude = longitude
		this.timestamp = timestamp || new Date()
		this.distance = distance
	}
	
	static fromJson(json) {
		return new ExploreModel(json)
	}
}

// 探索统计模型
class ExploreStats {
	constructor({
		totalDistance = 0,
		totalPoints = 0,
	} = {}) {
		this.totalDistance = totalDistance
		this.totalPoints = totalPoints
	}
	
	copyWith({ totalDistance, totalPoints } = {}) {
		return Object.assign(new ExploreStats(), this, {
			totalDistance: totalDistance !== undefined ? totalDistance : this.totalDistance,
			totalPoints: totalPoints !== undefined ? totalPoints : this.totalPoints,
		})
	}
}

// 探索页状态
class ExploreState {
	constructor() {
		this.locationGranted = false
		this.activeTab = 'map'
		this.points = []
		this.stats = new ExploreStats()
	}
	
	static initial() {
		return new ExploreState()
	}
	
	copyWith({ locationGranted, activeTab, points, stats } = {}) {
		return Object.assign(new ExploreState(), this, {
			locationGranted: locationGranted !== undefined ? locationGranted : this.locationGranted,
			activeTab: activeTab !== undefined ? activeTab : this.activeTab,
			points: points !== undefined ? points : this.points,
			stats: stats !== undefined ? stats : this.stats,
		})
	}
}

// 探索页 ViewModel
class ExploreViewModel {
	constructor() {
		this.state = ExploreState.initial()
		this._listeners = []
	}
	
	// 订阅状态变化
	listen(listener) {
		this._listeners.push(listener)
		return () => {
			const index = this._listeners.indexOf(listener)
			if (index > -1) {
				this._listeners.splice(index, 1)
			}
		}
	}
	
	// 通知监听器
	_notify() {
		this._listeners.forEach(listener => listener(this.state))
	}
	
	// 请求定位权限
	async requestLocationPermission() {
		// #ifdef APP-PLUS
		// APP 端请求定位权限
		return new Promise((resolve) => {
			plus.android.requestPermissions(
				['android.permission.ACCESS_FINE_LOCATION'],
				(result) => {
					const granted = result.granted.length > 0
					console.log('定位权限已授予:', granted)
					this.state = this.state.copyWith({ locationGranted: granted })
					this._notify()
					resolve(granted)
				},
				(error) => {
					console.log('定位权限被拒绝:', error)
					this.state = this.state.copyWith({ locationGranted: false })
					this._notify()
					resolve(false)
				}
			)
		})
		// #endif
		
		// #ifdef MP-WEIXIN
		// 微信小程序端请求定位权限
		try {
			const authSetting = await uni.getSetting()
			if (!authSetting.authSetting['scope.userLocation']) {
				const res = await uni.authorize({ scope: 'scope.userLocation' })
				console.log('定位权限已授予')
				this.state = this.state.copyWith({ locationGranted: true })
				this._notify()
				return true
			} else {
				console.log('定位权限已授予')
				this.state = this.state.copyWith({ locationGranted: true })
				this._notify()
				return true
			}
		} catch (e) {
			console.log('定位权限被拒绝:', e)
			this.state = this.state.copyWith({ locationGranted: false })
			this._notify()
			return false
		}
		// #endif
		
		// #ifdef H5
		// H5 端暂不支持定位
		this.state = this.state.copyWith({ locationGranted: false })
		this._notify()
		return false
		// #endif
	}
	
	// 检查定位权限（带弹窗）
	async checkLocationPermission() {
		const granted = await this.requestLocationPermission()
		if (!granted) {
			uni.showModal({
				title: '定位权限申请',
				content: '需要开启定位权限才能显示当前位置，是否前往开启？',
				success: (res) => {
					if (res.confirm) {
						// 打开设置页面
						// #ifdef APP-PLUS
						plus.runtime.openURL('android.settings.APPLICATION_DETAILS_SETTINGS')
						// #endif
						// #ifdef MP-WEIXIN
						uni.openSetting()
						// #endif
					}
				}
			})
		}
	}
	
	// 获取并更新设备定位
	async fetchAndUpdateDeviceLocation(phone) {
		try {
			const locationData = await getDeviceLocation(phone)
			
			if (locationData?.location && typeof locationData.location === 'string') {
				const locationString = locationData.location
				const parts = locationString.split(',')
				
				if (parts.length === 2) {
					const rawLng = parts[0].trim()
					const rawLat = parts[1].trim()
					const lng = parseFloat(rawLng)
					const lat = parseFloat(rawLat)
					
					if (!isNaN(lat) && !isNaN(lng)) {
						console.log('lat 和 lng 均不为 null，准备创建定位点:', lat, lng)
						return { latitude: lat, longitude: lng }
					} else {
						console.log('❌ 错误: lat 或 lng 为 null，解析失败！')
					}
				} else {
					console.log('❌ 错误: parts 数组长度不为 2！')
				}
			} else {
				console.log('❌ 错误: locationData 为 null 或 locationData.location 不是 String！')
			}
		} catch (e) {
			console.log('获取设备定位失败:', e)
		}
		
		return null
	}
	
	// 切换 Tab
	switchTab(tab) {
		this.state = this.state.copyWith({ activeTab: tab })
		this._notify()
	}
	
	// 手动添加测试定位点
	addTestPoint(latitude, longitude) {
		const newPoint = new ExploreModel({
			latitude: latitude,
			longitude: longitude,
			timestamp: new Date(),
		})
		this.addPoint(newPoint)
	}
	
	// 添加定位点
	addPoint(point) {
		const updatedPoints = [...this.state.points, point]
		// 简单计算总距离（这里只是示例，实际要用 haversine 公式）
		const totalDistance = this.state.stats.totalDistance + (point.distance || 0)
		
		this.state = this.state.copyWith({
			points: updatedPoints,
			stats: this.state.stats.copyWith({ totalDistance }),
		})
		this._notify()
	}
	
	// 刷新
	refresh() {
		// TODO: 重新拉取数据或重置状态
		this._notify()
	}
}

// 导出单例
const exploreViewModel = new ExploreViewModel()
export default exploreViewModel
