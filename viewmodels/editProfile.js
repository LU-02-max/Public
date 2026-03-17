/**
 * viewmodels/editProfile.js
 * 资料编辑业务逻辑层 (ViewModel)
 */

import http from '@/utils/request.js'
import userStore from '@/store/user.js'

/**
 * [模型定义] Profile 内部状态类
 */
class Profile {
	constructor({
		childNickname = '',
		childGender = '女',
		childBirthdate = '',
		parentRelationship = '',
	} = {}) {
		// 💡 字段名与后端数据库完全对齐
		this.childNickname = childNickname
		this.childGender = childGender
		this.childBirthdate = childBirthdate
		this.parentRelationship = parentRelationship
	}
	
	/**
	 * [辅助函数] 采用不可变数据模式更新对象
	 */
	copyWith(newData) {
		return Object.assign(new Profile(), this, newData)
	}
}

/**
 * [ViewModel] 编辑资料通知器
 */
class EditProfileNotifier {
	constructor() {
		this.state = new Profile()
		this._listeners = []
		this._isFetching = false // 防止重复请求锁
		
		// 1. 初始化：优先从 Store (本地缓存) 加载数据，保证页面秒开不空白
		this._loadFromUserModel()
		
		// 2. 订阅 Store：一旦 Store 发生变化，ViewModel 自动同步
		userStore.subscribe(() => {
			console.log('📢 [VM_EditProfile] 收到 Store 广播，更新 VM 内部状态');
			this._loadFromUserModel()
		})
	}
	
	/**
	 * [订阅逻辑] 允许 Vue 页面通过 listen 监听数据变化
	 */
	listen(listener) {
		this._listeners.push(listener)
		listener(this.state) 
		return () => {
			this._listeners = this._listeners.filter(l => l !== listener)
		}
	}
	
	/**
	 * [内部通知] 广播状态变化给所有页面
	 */
	_notify() {
		this._listeners.forEach(listener => listener(this.state))
	}
	
	/**
	 * [数据加载] 从 userStore 中拉取当前用户信息
	 */
	_loadFromUserModel() {
		const user = userStore.user
		console.log('🔄 [VM_EditProfile] 正在从 Store 同步数据:', user.childNickname || '空');
		
		this.state = new Profile({
			childNickname: user.childNickname || user.username || '',
			childGender: user.childGender || '女',
			childBirthdate: user.childBirthdate || '',
			parentRelationship: user.parentRelationship || ''
		})
		
		this._notify()
	}

	/**
	 * [核心函数] 主动从后端拉取最新资料
	 * 💡 逻辑：解决“重新编译后不显示小可爱”的关键
	 */
	async fetchProfileFromServer() {
		const phone = userStore.user.phone
		if (!phone || this._isFetching) return
		
		console.log(`🌐 [VM_EditProfile] 正在从后端拉取最新资料, 手机号: ${phone}`);
		this._isFetching = true
		
		try {
			// 假设后端获取个人资料的接口是这个，如果是 GET 请求
			const res = await http.get(`/parent/${phone}/profile`); 
			
			if (res && (res.childNickname || res.username)) {
				console.log('📥 [VM_EditProfile] 成功获取数据库真名:', res.childNickname);
				// 💡 关键：拿到真名后同步给 Store，Store 会自动触发持久化和广播
				userStore.updateProfile(res); 
			}
		} catch (e) {
			console.warn('⚠️ [VM_EditProfile] 自动拉取资料失败（可能接口未写或网络问题）', e);
		} finally {
			this._isFetching = false
		}
	}
	
	/**
	 * [逻辑校验] 检查必填项
	 */
	isValid() {
		const valid = this.state.childNickname.trim().length > 0 &&
					this.state.childBirthdate !== '' &&
					this.state.parentRelationship !== '';
		return valid
	}
	
	/**
	 * [属性更新系列] 响应 UI 输入
	 */
	updateNickname(value) {
		this.state = this.state.copyWith({ childNickname: value })
		this._notify()
	}
	
	updateGender(value) {
		this.state = this.state.copyWith({ childGender: value })
		this._notify()
	}
	
	updateBirthday(value) {
		this.state = this.state.copyWith({ childBirthdate: value })
		this._notify()
	}
	
	updateRelation(value) {
		this.state = this.state.copyWith({ parentRelationship: value })
		this._notify()
	}
	
	/**
	 * [核心函数] 提交资料
	 * 逻辑：调用接口 -> 成功后更新 Store -> Store 自动写入磁盘
	 */
	async submitProfile() {
		console.log('🚀 [VM_EditProfile] 启动资料提交...');
		
		if (!this.isValid()) {
			uni.showToast({ title: '资料填写不完整', icon: 'none' })
			return false
		}
		
		const phone = userStore.user.phone
		const postData = {
			childNickname: this.state.childNickname,
			childGender: this.state.childGender,
			childBirthdate: this.state.childBirthdate,
			parentRelationship: this.state.parentRelationship,
		}
		
		try {
			// 1. 发起 API 请求（注意你的接口地址是否正确）
			await http.post(`/parent/${phone}/initial-setup`, postData);
			
			// 2. 💡 重点：提交成功后同步更新中央 Store
			// 这一步会触发 userStore._saveUser()，将数据存入手机磁盘
			console.log('🧠 [VM_EditProfile] 提交成功，锁死数据到本地缓存');
			await userStore.updateProfile(postData); 
			
			// 更新数据同步时间戳（避免立即触发后端同步）
			const now = Date.now()
			uni.setStorageSync('last_profile_sync', now);
			
			// 同时更新后端版本记录（用于检测其他设备修改）
			uni.setStorageSync('last_known_backend_profile', {
				childNickname: postData.childNickname || '',
				parentRelationship: postData.parentRelationship || '',
				childBirthdate: postData.childBirthdate || '',
				timestamp: now
			});
			
			console.log('⏰ [VM_EditProfile] 数据同步时间戳和后端版本已更新');
			
			uni.showToast({ title: '保存成功', icon: 'success' })
			return true
		} catch (e) {
			console.error('❌ [VM_EditProfile] 提交失败:', e);
			uni.showToast({ title: '保存失败', icon: 'none' })
			return false
		}
	}
	
	/**
	 * [重置] 放弃修改
	 */
	resetToUserModel() {
		console.log('⏪ [VM_EditProfile] 用户取消编辑，回滚数据');
		this._loadFromUserModel()
	}
}

// 导出单例
const editProfileNotifier = new EditProfileNotifier()
export default editProfileNotifier