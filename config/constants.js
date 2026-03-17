/**
 * config/constants.js
 * 全局常量配置 - 消除魔法数字和硬编码
 */

import envConfig from './env.js'

// 从 dev.js 重新导出配置常量
export { DEV_MODE, DEV_CLEANUP, FORCE_CLEAR_ALL, TEST_PHONE } from './dev.js'

const { IMAGE_BASE } = envConfig

// ================== 时间常量 ==================
export const TIME_CONSTANTS = {
  // 页面跳转延迟（毫秒）
  NAVIGATION_DELAY: 1500,

  // 心跳上报间隔（毫秒）
  HEARTBEAT_INTERVAL: 600000, // 10分钟

  // 请求超时时间（毫秒）
  REQUEST_TIMEOUT: 30000,
  LOCATION_REQUEST_TIMEOUT: 20000,

  // Toast 显示时间（毫秒）
  TOAST_DURATION: 3000,
}

// ================== 路由路径 ==================
export const ROUTES = {
  LOGIN: '/pages/login/login',
  WELCOME: '/pages/welcome/welcome',
  CUSTOMER_SERVICE: '/pages/customerService/customerService',
  HOME: '/pages/index/index',
  CHAT: '/pages/chat/chat',
  CHAT_DETAIL: '/pages/sub_detail/chat/detail',
  EXPLORE: '/pages/explore/explore',
  STUDY: '/pages/study/study',
  PROFILE: '/pages/profile/profile',
  EDIT_PROFILE: '/pages/sub_profile/editProfile',
  BIND_DEVICE: '/pages/sub_profile/bindDevice',
  FAMILY: '/pages/sub_detail/home/family',
  SOS_DETAIL: '/pages/sub_detail/home/sos-detail',
  RADAR_CONFIG: '/pages/sub_profile/radarConfig',
  ABOUT: '/pages/sub_profile/about',
  HELP: '/pages/help/help',
  AGREEMENT: '/pages/sub_profile/agreement',
}

// ================== 存储键名 ==================
export const STORAGE_KEYS = {
  USER: 'user_profile',
  GENDER: 'profile_gender',
  BIRTHDAY: 'profile_birthday',
  NICKNAME: 'profile_nickname',
  PHONE: 'profile_phone',
  DEVICE_ID: 'profile_device_id',
  LOGIN: 'is_logged_in',
  DEVICE_BOUND: 'profile_device_bound',
  PROFILE_COMPLETED: 'profileCompleted',
  IS_FIRST: 'profileisFirst',
}

// ================== AI模型图片映射 ==================
const MODEL_PREFIXES = [
  'cam-context',
  'math-context',
  'fac-context',
  'mcec-context',
  'cse-context',
  'eac-context-2',
  'eac-context-1',
  'emp-context',
  'kc-context-2',
  'kc-context-1',
  'yg-context-2',
  'yg-context-1',
  'mus-context'
]

const MODEL_IMAGES = [
  'chat1.png',
  '相机-01.png',
  '相机-02.png',
  '相机-03.png',
  '相机-04.png',
  '相机-05.png',
  '相机-06.png',
  '相机-07.png',
  '相机-08.png',
  '相机-09.png',
  '相机-10.png',
  '相机-11.png',
  '相机-12.png',
  '相机-13.png'
]

// 普通版本映射
export const AI_MODEL_IMAGES = {
  '小宇': `${IMAGE_BASE}/chat1.png`,
  ...Object.fromEntries((MODEL_PREFIXES || []).map((model, index) => [
    model,
    `${IMAGE_BASE}/${(MODEL_IMAGES || [])[index] || 'chat1.png'}`
  ]))
}

// K2 版本映射
export const AI_MODEL_IMAGES_K2 = Object.fromEntries(
  MODEL_PREFIXES.map(model => [`${model}-K2`, AI_MODEL_IMAGES[model]])
)

// 合并所有版本（兼容旧代码）
export const AI_MODEL_IMAGE_MAP = {
  ...AI_MODEL_IMAGES,
  ...AI_MODEL_IMAGES_K2,
}

// 获取 AI 模型图片的辅助函数
export function getAIModelImage(modelName) {
  // 校验 modelName 入参，避免非字符串类型导致的异常
  const validModelName = typeof modelName === 'string' ? modelName : '';
  return AI_MODEL_IMAGE_MAP[validModelName] || `${IMAGE_BASE}/chat1.png`
}

// ================== 埋点事件名称 ==================
export const TRACKING_EVENTS = {
  // 应用生命周期
  APP_LAUNCH: 'app_launch',
  APP_EXIT: 'app_exit',
  SESSION_END: 'session_end',
  PAGE_VIEW: 'page_view',
  USAGE_HEARTBEAT: 'usage_heartbeat',

  // 认证相关
  LOGIN: 'login',
  LOGOUT: 'logout',
  DEVICE_BIND_SUCCESS: 'device_bind_success',
  DEVICE_BIND_FAILED: 'device_bind_failed',

  // 页面访问
  CHAT_LIST_VIEW: 'chat_list_view',
  CHAT_LIST_REFRESH: 'chat_list_refresh',
  CHAT_ITEM_CLICK: 'chat_item_click',
  PROFILE_PAGE_VIEW: 'profile_page_view',

  // 个人中心
  PROFILE_EDIT_CLICK: 'profile_edit_click',
  MY_DEVICE_CLICK: 'my_device_click',
  ABOUT_US_CLICK: 'about_us_click',
  SOS_SETTINGS_CLICK: 'sos_settings_click',
  STUDY_REGISTRATION_CLICK: 'study_registration_click',
  HELP_FEEDBACK_CLICK: 'help_feedback_click',

  // 内容交互
  CONTENT_CLICK: 'content_click',
  SHARE_ACTION: 'share_action',
  SOCIAL_ACTION: 'social_action',

  // 用户资料
  PROFILE_UPDATE: 'profile_update',
}

// ================== 设备类型 ==================
export const DEVICE_TYPES = {
  UNKNOWN: 'Unknown Device',
}

// ================== 用户默认值 ==================
export const USER_DEFAULTS = {
  CHILD_GENDER: '请填写',
  PARENT_RELATIONSHIP: '请填写',
}

// ================== 状态码消息 ==================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接异常，请检查手机联网',
  DOMAIN_ERROR: '域名未配置，请在开发工具中忽略域名校验',
  REQUEST_FAILED: '网络请求失败，请检查网络配置',
  UNAUTHORIZED: '登录过期，请重新登录',
  FORBIDDEN: '权限不足',
  NOT_FOUND: '资源不存在',
  BAD_REQUEST: '请求参数错误',
  SERVER_ERROR: '服务器内部错误',
}
