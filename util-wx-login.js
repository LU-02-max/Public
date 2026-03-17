/**
 * 微信登录工具
 * 获取微信用户 openid 和 session_key
 */

/**
 * 微信小程序登录
 * @returns {Promise<Object>} { openid, sessionKey, unionid }
 */
export async function wxLogin() {
	return new Promise((resolve, reject) => {
		// #ifdef MP-WEIXIN
		wx.login({
			success: async (loginRes) => {
				if (loginRes.code) {
					try {
						// 将 code 发送到后端换取 openid 和 session_key
						// 需要后端提供对应的接口
						const res = await uni.request({
							url: 'http://39.106.56.81:8082/api/weixin/login',
							method: 'POST',
							data: {
								code: loginRes.code
							}
						})

						if (res.statusCode === 200 && res.data) {
							// 保存 openid 到本地
							uni.setStorageSync('wx_openid', res.data.openid)
							if (res.data.sessionKey) {
								uni.setStorageSync('wx_session_key', res.data.sessionKey)
							}
							if (res.data.unionid) {
								uni.setStorageSync('wx_unionid', res.data.unionid)
							}

							resolve({
								openid: res.data.openid,
								sessionKey: res.data.sessionKey,
								unionid: res.data.unionid
							})
						} else {
							reject(new Error('获取 openid 失败'))
						}
					} catch (e) {
						console.error('[wxLogin] 请求后端失败', e)
						reject(e)
					}
				} else {
					reject(new Error('wx.login 失败'))
				}
			},
			fail: (err) => {
				console.error('[wxLogin] wx.login 失败', err)
				reject(err)
			}
		})
		// #endif

		// #ifndef MP-WEIXIN
		console.log('[wxLogin] 非微信小程序环境')
		resolve({
			openid: 'mock_openid',
			sessionKey: 'mock_session_key'
		})
		// #endif
	})
}

/**
 * 获取本地存储的 openid
 * @returns {String|null}
 */
export function getWxOpenid() {
	return uni.getStorageSync('wx_openid') || null
}

/**
 * 获取本地存储的 session_key
 * @returns {String|null}
 */
export function getWxSessionKey() {
	return uni.getStorageSync('wx_session_key') || null
}

/**
 * 获取本地存储的 unionid
 * @returns {String|null}
 */
export function getWxUnionid() {
	return uni.getStorageSync('wx_unionid') || null
}

/**
 * 检查是否已登录微信
 * @returns {Boolean}
 */
export function isWxLoggedIn() {
	return !!getWxOpenid()
}

/**
 * 清除微信登录信息
 */
export function clearWxLogin() {
	uni.removeStorageSync('wx_openid')
	uni.removeStorageSync('wx_session_key')
	uni.removeStorageSync('wx_unionid')
}
