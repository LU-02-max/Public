/**
 * 微信小程序订阅消息服务
 * 用于处理微信订阅消息的授权和发送
 */

// 微信订阅消息模板 ID（需要在微信公众平台配置）
const SUBSCRIBE_TEMPLATES = {
	// SOS 警报消息
	SOS_ALERT: 'YOUR_SOS_ALERT_TEMPLATE_ID',
	// 设备离线提醒
	DEVICE_OFFLINE: 'YOUR_DEVICE_OFFLINE_TEMPLATE_ID',
	// 设备上线提醒
	DEVICE_ONLINE: 'YOUR_DEVICE_ONLINE_TEMPLATE_ID',
	// 位置更新通知
	LOCATION_UPDATE: 'YOUR_LOCATION_UPDATE_TEMPLATE_ID',
	// 系统通知
	SYSTEM_NOTIFY: 'YOUR_SYSTEM_NOTIFY_TEMPLATE_ID'
}

class WxNoticeService {
	constructor() {
		this.subscribedTemplates = new Set()
		this._loadSubscribedTemplates()
	}

	/**
	 * 从本地加载已订阅的模板
	 */
	_loadSubscribedTemplates() {
		try {
			const stored = uni.getStorageSync('subscribed_templates')
			if (stored) {
				this.subscribedTemplates = new Set(JSON.parse(stored))
			}
		} catch (e) {
			console.error('[WxNoticeService] 加载订阅记录失败', e)
		}
	}

	/**
	 * 保存已订阅的模板
	 */
	_saveSubscribedTemplates() {
		try {
			uni.setStorageSync('subscribed_templates', JSON.stringify([...this.subscribedTemplates]))
		} catch (e) {
			console.error('[WxNoticeService] 保存订阅记录失败', e)
		}
	}

	/**
	 * 请求订阅消息授权
	 * @param {Array<String>} tmplIds 模板 ID 数组
	 * @returns {Promise<Object>} 授权结果
	 */
	async requestSubscribeMessage(tmplIds) {
		return new Promise((resolve, reject) => {
			// #ifdef MP-WEIXIN
			wx.requestSubscribeMessage({
				tmplIds,
				success: (res) => {
					console.log('[WxNoticeService] 订阅消息授权结果', res)

					// 保存已授权的模板
					for (const tmplId of tmplIds) {
						if (res[tmplId] === 'accept') {
							this.subscribedTemplates.add(tmplId)
						}
					}
					this._saveSubscribedTemplates()

					resolve({
						success: true,
						data: res
					})
				},
				fail: (err) => {
					console.error('[WxNoticeService] 订阅消息授权失败', err)

					// 用户拒绝授权是正常情况，不算错误
					if (err.errCode === 20004) {
						// 用户关闭主开关
						resolve({
							success: false,
							code: 20004,
							message: '用户关闭了订阅消息主开关'
						})
					} else {
						reject(err)
					}
				}
			})
			// #endif

			// #ifndef MP-WEIXIN
			console.log('[WxNoticeService] 非微信小程序环境，跳过订阅消息')
			resolve({
				success: true,
				data: {}
			})
			// #endif
		})
	}

	/**
	 * 检查模板是否已订阅
	 * @param {String} tmplId 模板 ID
	 * @returns {Boolean}
	 */
	isSubscribed(tmplId) {
		return this.subscribedTemplates.has(tmplId)
	}

	/**
	 * 获取所有已订阅的模板
	 * @returns {Array<String>}
	 */
	getSubscribedTemplates() {
		return [...this.subscribedTemplates]
	}

	/**
	 * 请求订阅所有推荐消息
	 * 建议在用户登录时调用
	 */
	async subscribeAllRecommended() {
		return this.requestSubscribeMessage([
			SUBSCRIBE_TEMPLATES.SOS_ALERT,
			SUBSCRIBE_TEMPLATES.DEVICE_OFFLINE,
			SUBSCRIBE_TEMPLATES.DEVICE_ONLINE,
			SUBSCRIBE_TEMPLATES.LOCATION_UPDATE
		])
	}
}

// 创建单例
const wxNoticeService = new WxNoticeService()

export default wxNoticeService
