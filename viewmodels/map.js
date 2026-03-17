// viewmodels/map.js
// 地图 ViewModel - uniapp 版本

import mapService from '@/services/map.js'
import userStore from '@/store/user.js'

// 地图状态
class MapState {
	constructor() {
		this.isLoading = false
		this.currentLocation = null // { latitude, longitude }
		this.currentAddress = ''
		this.errorMessage = null
	}
	
	static initial() {
		return new MapState()
	}
	
	copyWith({ isLoading, currentLocation, currentAddress, errorMessage } = {}) {
		return Object.assign(new MapState(), this, {
			isLoading: isLoading !== undefined ? isLoading : this.isLoading,
			currentLocation: currentLocation !== undefined ? currentLocation : this.currentLocation,
			currentAddress: currentAddress !== undefined ? currentAddress : this.currentAddress,
			errorMessage: errorMessage !== undefined ? errorMessage : this.errorMessage,
		})
	}
}

// 地图 ViewModel
class MapViewModel {
	constructor() {
		this.state = MapState.initial()
		this._listeners = []
		
		// 监听用户状态
		userStore.subscribe(() => {
			// 当用户登录时，刷新定位
			if (userStore.isLoggedIn) {
				this.refreshLocation()
			}
		})
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
	
	// 主刷新逻辑
	async refreshLocation() {
		if (this.state.isLoading) return
		
		this.state = this.state.copyWith({ isLoading: true, errorMessage: null })
		this._notify()
		
		const phone = userStore.phone
		if (!phone || phone.length === 0) {
			this.state = this.state.copyWith({
				isLoading: false,
				currentAddress: '获取定位信息失败：未登录',
				errorMessage: '无法获取当前用户手机号',
			})
			this._notify()
			return
		}
		
		// 1. 获取原始坐标数据
		const data = await mapService.getDeviceLocation(phone)
		
		if (!data || !data.location || data.location.length === 0) {
			this.state = this.state.copyWith({
				isLoading: false,
				currentAddress: '获取定位信息失败，请检查网络',
				errorMessage: 'API 返回空或错误',
			})
			this._notify()
			return
		}
		
		try {
			const locationString = data.location
			const parts = locationString.split(',')
			const rawLng = parts[0].trim()
			const rawLat = parts[1].trim()
			
			const lng = parseFloat(rawLng)
			const lat = parseFloat(rawLat)
			
			if (isNaN(lat) || isNaN(lng)) {
				throw new Error(`坐标格式错误: ${locationString}`)
			}
			
			const newLocation = { latitude: lat, longitude: lng }
			
			// 2. 逆地理编码获取地址
			const address = await mapService.reverseGeocode(lng, lat)
			console.log('详细地理位置：', address)
			
			// 3. 更新 View Model 状态
			this.state = this.state.copyWith({
				currentLocation: newLocation,
				currentAddress: address,
				isLoading: false,
			})
			this._notify()
			
		} catch (e) {
			console.log('数据解析或处理异常:', e)
			this.state = this.state.copyWith({
				isLoading: false,
				currentAddress: '暂时没有数据……',
				errorMessage: e.message || e.toString(),
			})
			this._notify()
		}
	}
	
	// 从 SOS 更新定位
	async updateLocationFromSOS(locationString) {
		// 1. 立即进入加载状态
		this.state = this.state.copyWith({ isLoading: true, errorMessage: null })
		this._notify()
		
		try {
			// 2. 解析坐标字符串 (格式: "经度,纬度" -> "113.32533, 23.10647")
			const parts = locationString.split(',')
			if (parts.length < 2) {
				throw new Error(`SOS 坐标格式错误: ${locationString}`)
			}
			
			const rawLng = parts[0].trim()
			const rawLat = parts[1].trim()
			
			const lng = parseFloat(rawLng)
			const lat = parseFloat(rawLat)
			
			if (isNaN(lat) || isNaN(lng)) {
				throw new Error(`SOS 坐标数值解析失败: ${locationString}`)
			}
			
			const sosLocation = { latitude: lat, longitude: lng }
			
			// 3. 逆地理编码获取地址
			const address = await mapService.reverseGeocode(lng, lat)
			console.log('SOS 推送详细地理位置：', address)
			
			// 4. 更新 View Model 状态
			this.state = this.state.copyWith({
				currentLocation: sosLocation,
				currentAddress: `🚨 SOS 位置：${address}`, // 醒目标识
				isLoading: false,
			})
			this._notify()
			
		} catch (e) {
			console.log('SOS 数据解析或处理异常:', e)
			this.state = this.state.copyWith({
				isLoading: false,
				errorMessage: `SOS 位置解析失败: ${e.message || e.toString()}`,
			})
			this._notify()
		}
	}
	
	// 打开导航
	openNavigation(latitude, longitude, name = '') {
		mapService.openNavigation(latitude, longitude, name)
	}
}

// 导出单例
const mapViewModel = new MapViewModel()
export default mapViewModel
