/**
 * config/api.js
 * API路径配置文件
 * 集中管理所有接口路径
 */

import envConfig from './env.js'

/**
 * 认证相关接口
 */
export const AUTH_API = {
  // 微信手机号快速登录
  WECHAT_LOGIN: '/auth/wechat-login',
  // 发送验证码
  SEND_CODE: '/auth/send-code',
  // 验证验证码登录
  VERIFY: '/auth/verify',
  // 检查用户状态
  STATUS: '/auth/status'
}

/**
 * 设备相关接口
 */
export const DEVICE_API = {
  // 绑定设备
  BIND_DEVICE: (phone) => `/parent/${phone}/bind-device`,
  // 解绑设备
  UNBIND_DEVICE: (phone) => `/parent/${phone}/device`,
  // 获取设备定位
  LOCATION: (phone) => `/parent/${phone}/device/location`,
  // 设置功能概率
  FUNCTION_PROBABILITIES: (phone) => `/parent/${phone}/device/function-probabilities`
}

/**
 * 用户相关接口
 */
export const USER_API = {
  // 初次信息采集
  INITIAL_SETUP: (phone) => `/parent/${phone}/initial-setup`,
  // 拉取基本信息
  FAMILY_PROFILE: (phone) => `/parent/${phone}/family-profile`,
  // 上报微信订阅信息
  WX_SUBSCRIBE_INFO: (phone) => `/parent/${phone}/wx-subscribe-info`,
  // 短信设置
  SMS_SETTINGS: (phone) => `/parent/${phone}/sms-settings`
}

/**
 * 聊天相关接口
 */
export const CHAT_API = {
  // 获取儿童聊天问题
  QUESTIONS: (phone) => `/parent/${phone}/questions`
}

/**
 * 分析相关接口
 */
export const ANALYSIS_API = {
  // 获取儿童天赋分析
  TALENT_ANALYSIS: (phone) => `/parent/${phone}/talent-analysis`
}

/**
 * 短信相关接口
 */
export const SMS_API = {
  // 发送SOS警报短信
  SEND_SOS_ALERT: '/sms/send-sos-alert',
  // 发送设备离线短信
  SEND_DEVICE_OFFLINE: '/sms/send-device-offline',
  // 发送设备上线短信
  SEND_DEVICE_ONLINE: '/sms/send-device-online'
}

/**
 * 资源文件路径配置
 */
export const ASSETS_PATHS = {
  // Logo
  LOGO: `${envConfig.ASSETS_BASE}/uniapp_jzd_image1/logo.png`,

  // 协议文档（使用Flutter同链接，通过web-view或下载方式访问）
  PRIVACY_POLICY: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/flutter-jzd-assets/txt/YO%21WOW%E5%A3%AE%E6%B8%B8%E6%9C%BA%E9%9A%90%E7%A7%81%E6%94%BF%E7%AD%96.md',
  SERVICE_AGREEMENT: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/flutter-jzd-assets/txt/YO%21WOW%E5%A3%AE%E6%B8%B8%E6%9C%BA%E8%BD%AF%E4%BB%B6%E7%94%A8%E6%88%B7%E6%9C%8D%E5%8A%A1%E5%8D%8F%E8%AE%AE.md',
  MEMBER_AGREEMENT: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/flutter-jzd-assets/txt/YO%21WOW%E5%A3%AE%E6%B8%B8%E6%9C%BA%E4%BC%9A%E5%91%98%E6%9C%8D%E5%8A%A1%E5%8D%8F%E8%AE%AE.md',
  CHILD_PRIVACY: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/flutter-jzd-assets/txt/YO%21WOW%E5%A3%AE%E6%B8%B8%E6%9C%BA%E5%84%BF%E7%AB%A5%E9%9A%90%E7%A7%81%E5%8D%8F%E8%AE%AE.md'
}

export default {
  AUTH_API,
  DEVICE_API,
  USER_API,
  CHAT_API,
  ANALYSIS_API,
  SMS_API,
  ASSETS_PATHS
}
