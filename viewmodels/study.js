// viewmodels/study.js
// 研学 ViewModel - uniapp 版本

// 研学活动模型
class StudyActivity {
	constructor({
		title = '',
		imagePath = '',
		tags = [],
		comingSoon = false,
		onTap = null,
	} = {}) {
		this.title = title
		this.imagePath = imagePath
		this.tags = tags
		this.comingSoon = comingSoon
		this.onTap = onTap
	}
	
	static fromJson(json) {
		return new StudyActivity(json)
	}
}

// 研学列表 ViewModel
class StudyListViewModel {
	constructor() {
		this.state = []
		this._listeners = []
		this.loadActivities()
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
	
	// 加载活动列表
	loadActivities() {
		// 模拟加载数据（后面可以替换成接口请求）
		this.state = [
			new StudyActivity({
				title: '小小宇航员 - 空间站探秘',
				imagePath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/empty.png',
				tags: ['8-12岁', '科学探索', '动手实践'],
				comingSoon: true,
				onTap: () => {
					console.log('点击了 小小宇航员')
					// TODO: 跳转到详情页
				},
			}),
		]
		this._notify()
	}
	
	// 添加活动
	addActivity(activity) {
		this.state = [...this.state, activity]
		this._notify()
	}
}

// 导出单例
const studyListViewModel = new StudyListViewModel()
export default studyListViewModel
