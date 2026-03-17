// viewmodels/devices.js
// 设备 ViewModel - uniapp 版本

// 设备绑定模型
class BindModel {
	constructor({
		deviceId = '',
		deviceName = '',
		bound = false,
	} = {}) {
		this.deviceId = deviceId
		this.deviceName = deviceName
		this.bound = bound
	}
	
	static fromJson(json) {
		return new BindModel(json)
	}
}

// 设备 ViewModel
class DeviceViewModel {
	constructor() {
		this.state = new BindModel()
		this._listeners = []
	}
	
	// 订阅状态变化
	listen(listener) {
		this._listeners.push(listener)
		listener(this.state)
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
	
	// 加载活动列表（空实现）
	loadActivities() {
		// 模拟加载数据（后面可以替换成接口请求）
		console.log('loadActivities called')
	}
}

// 导出单例
const deviceViewModel = new DeviceViewModel()
export default deviceViewModel
