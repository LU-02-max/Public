/**
 * utils/base-viewmodel.js
 * ViewModel 基类 - 提供通用的状态管理和观察者模式
 */

/**
 * 基础 ViewModel 类
 * 封装通用的订阅/通知逻辑，避免代码重复
 */
export class BaseViewModel {
	constructor() {
		this._listeners = []
	}

	/**
	 * 订阅状态变化
	 * @param {Function} listener - 状态变化回调函数
	 * @returns {Function} 取消订阅的函数
	 */
	listen(listener) {
		this._listeners.push(listener)
		return () => {
			this.unsubscribe(listener)
		}
	}

	/**
	 * 取消订阅
	 * @param {Function} listener - 要取消的监听器
	 */
	unsubscribe(listener) {
		const index = this._listeners.indexOf(listener)
		if (index > -1) {
			this._listeners.splice(index, 1)
		}
	}

	/**
	 * 通知所有监听器
	 * @param {*} state - 要传递的状态
	 */
	notify(state) {
		this._listeners.forEach(listener => {
			try {
				listener(state)
			} catch (e) {
				console.error('[BaseViewModel] 监听器执行失败:', e)
			}
		})
	}

	/**
	 * 清理资源
	 */
	dispose() {
		this._listeners = []
	}
}

/**
 * 带状态的 ViewModel 基类
 * 继承自 BaseViewModel，增加了状态管理能力
 */
export class StatefulViewModel extends BaseViewModel {
	constructor(initialState = {}) {
		super()
		this._state = initialState
	}

	/**
	 * 获取当前状态
	 */
	get state() {
		return this._state
	}

	/**
	 * 设置新状态并通知监听器
	 * @param {Object} newState - 新状态（支持部分更新）
	 */
	setState(newState) {
		this._state = typeof newState === 'function' 
			? newState(this._state) 
			: { ...this._state, ...newState }
		this.notify(this._state)
	}

	/**
	 * 创建状态的副本（用于不可变更新）
	 * @param {Object} overrides - 要覆盖的字段
	 * @returns {Object} 状态副本
		copyWith(overrides = {}) {
		return { ...this._state, ...overrides }
	}
}
