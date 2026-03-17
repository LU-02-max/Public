// viewmodels/feature.js
// 功能设置 ViewModel - uniapp 版本

import {
	setFunctionProbabilities
} from '@/api.js'

// 功能模型
class FeatureModel {
	constructor({
		functionName = '',
		displayName = '',
		probability = 1,
	} = {}) {
		this.functionName = functionName
		this.displayName = displayName
		this.probability = probability
	}

	static fromJson(json) {
		return new FeatureModel(json)
	}
}

// 功能设置 ViewModel
class FeatureViewModel {
	constructor() {
		// 定义本地固定的功能配置映射
		this._internalConfig = {
			'math-context': '理科直觉',
			'fac-context': '析辨明思',
			'mcec-context': '多维立体沟通',
			'cse-context': '新社交达人',
			'eac-context-2': '纵向创新破题',
			'eac-context-1': '横向创新执行',
			'emp-context': '万物有情',
			'kc-context-2': '指物而谈的汉语机锋',
			'kc-context-1': '即景起兴的英语辞令',
			'yg-context-2': '中文书面语感',
			'yg-context-1': '英文书面语感',
			'mus-context': '视界即音阶',
		}

		this._features = []
		this._listeners = []

		this._initDefault()
	}

	// 订阅状态变化
	listen(listener) {
		this._listeners.push(listener)
		listener(this._features)
		return () => {
			const index = this._listeners.indexOf(listener)
			if (index > -1) {
				this._listeners.splice(index, 1)
			}
		}
	}

	// 通知监听器
	_notify() {
		this._listeners.forEach(listener => listener(this._features))
	}

	// 初始化默认值
	_initDefault() {
		this._features = Object.entries(this._internalConfig).map(([key, value]) =>
			new FeatureModel({
				functionName: key,
				displayName: value,
				probability: 1,
			})
		)
		this._notify()
	}

	// 获取功能列表
	get features() {
		return this._features
	}

	// 计算总权重
	get totalWeight() {
		return this._features.reduce((sum, item) => sum + item.probability, 0)
	}

	// 更新概率（权重）
	updateProbability(index, newValue) {
		if (newValue < 0) return
		this._features[index].probability = newValue
		this._notify()
	}

	// 计算百分比显示
	getPercentDisplay(probability) {
		if (this.totalWeight === 0) return '0%'
		return `${Math.round((probability / this.totalWeight) * 100)}%`
	}

	// 重置
	resetAll() {
		for (const f of this._features) {
			f.probability = 1
		}
		this._notify()
	}

	// 保存功能设置
	async onSave(phone) {
		try {
			// 构建概率映射
			const probabilities = {}
			for (const feature of this._features) {
				probabilities[feature.functionName] = feature.probability
			}

			// 调用 API 保存
			const ok = await setFunctionProbabilities(phone, probabilities)

			if (ok) {
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				})
			} else {
				uni.showToast({
					title: '保存失败',
					icon: 'none'
				})
			}

			return ok
		} catch (e) {
			console.log('保存功能设置失败:', e)
			uni.showToast({
				title: '保存失败',
				icon: 'none'
			})
			return false
		}
	}
}

// 导出单例
const featureViewModel = new FeatureViewModel()
export default featureViewModel