/**
 * utils/request.js
 * 统一网络请求框架
 * 具备：自动解析响应、统一错误提示、开发/生产模式切换、请求日志追踪
 */

import envConfig from '@/config/env.js'

const BASE_URL = envConfig.BASE_URL
const DEV_MODE = envConfig.DEV_MODE
const ENABLE_LOG = envConfig.ENABLE_LOG

/**
 * 核心请求函数 (Private)
 * 封装 uni.request 为 Promise 风格
 */
function _request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    timeout = 30000
  } = options

  // 1. 组装请求头
  const header = {
    'Content-Type': 'application/json',
    ...options.header
  }

  // 🔍 [控制台日志] 发起请求前的详细追踪
  if (ENABLE_LOG) {
    console.log(`%c>>>> [发送请求] ${method} -> ${BASE_URL}${url}`, 'color: #1890ff; font-weight: bold;');
    console.log('>>>> [请求头]:', header);
    if (Object.keys(data).length) console.log('>>>> [参数/Payload]:', JSON.stringify(data));
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header,
      timeout,

      success: (res) => {
        // 🔍 [控制台日志] 收到响应
        if (ENABLE_LOG) {
          console.log(`%c<<<< [收到响应] ${res.statusCode} <- ${url}`, 'color: #52c41a; font-weight: bold;');
          console.log('<<<< [响应体]:', res.data);
        }

        let responseData = res.data

        // 3. 数据自动清洗逻辑
        // 💡 兼容后端返回的字符串形式布尔值
        if (responseData === "true") responseData = true
        if (responseData === "false") responseData = false

        // 💡 兼容后端包裹结构，如 { success: true, data: ... } 提取 data 字段
        if (responseData && typeof responseData === 'object' && 'success' in responseData && 'data' in responseData) {
          responseData = responseData.data
        }

        // 4. 状态码分流处理
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 状态 2xx：成功请求
          resolve(responseData)
        }
        else {
          // 状态 4xx/5xx：后端业务错误
          console.error(`❌ [后端错误 ${res.statusCode}]:`, responseData);
          console.error('完整响应:', res);

          // 针对不同错误码显示具体信息
          let errorMsg = `服务器错误 (${res.statusCode})`;
          if (res.statusCode === 400) {
            errorMsg = typeof responseData === 'string' && responseData ? responseData : '请求参数错误，请检查输入';
          } else if (res.statusCode === 403) {
            errorMsg = '权限不足';
          } else if (res.statusCode === 404) {
            errorMsg = '资源不存在';
          } else if (res.statusCode >= 500) {
            errorMsg = '服务器内部错误';
          }

          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 3000
          });
          reject(new Error(errorMsg))
        }
      },

      fail: (err) => {
        // 5. 物理网络错误处理（断网或超时）
        if (ENABLE_LOG) {
          console.error(`%c❌ [网络崩溃] ${url}`, 'color: #ff4d4f; font-weight: bold;', err);
        }
        
        let errorMsg = '网络连接异常，请检查手机联网'
        if (err.errMsg && err.errMsg.includes('url not in domain list')) {
          errorMsg = '域名未配置，请在开发工具中忽略域名校验'
        } else if (err.errMsg && err.errMsg.includes('fail')) {
          errorMsg = '网络请求失败，请检查网络配置'
        }
        
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        })
        reject(err)
      }
    })
  })
}

/**
 * 外部调用的便捷方法封装
 */
const http = {
  /**
   * GET 请求：自动处理 URL 参数拼接
   */
  get(url, params = {}, options = {}) {
    let queryString = ''
    if (params && Object.keys(params).length > 0) {
      const query = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      queryString = `?${query}`
    }
    return _request({
      url: url + queryString,
      method: 'GET',
      ...options
    })
  },

  /**
   * POST 请求：提交 JSON 数据体
   */
  post(url, data = {}, options = {}) {
    return _request({
      url,
      method: 'POST',
      data,
      ...options
    })
  },

  /**
   * PUT 请求：用于修改数据
   */
  put(url, data = {}, options = {}) {
    return _request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  },

  /**
   * DELETE 请求：用于删除数据
   */
  delete(url, data = {}, options = {}) {
    return _request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  }
}

export default http