/**
 * 路由管理工具 - 开发调试版
 * 对应 Flutter 的 app_router.dart
 */
import userStore from '@/store/user.js'

/**
 * 路由路径定义
 */
export const ROUTES = {
  // 启动和登录流程
  WELCOME: '/pages/welcome/welcome',
  LOGIN: '/pages/login/login',

  // 主页（带 tabBar）
  HOME: '/pages/index/index',
  CHAT: '/pages/chat/chat',
  EXPLORE: '/pages/explore/explore',
  STUDY: '/pages/study/study',
  PROFILE: '/pages/profile/profile',

  // 首页子页面
  FAMILY: '/pages/sub_detail/home/family',
  SOS_DETAIL: '/pages/sub_detail/home/sos-detail',

  // 聊天相关
  CHAT_DETAIL: '/pages/sub_detail/chat/detail',

  // 个人中心
  EDIT_PROFILE: '/pages/sub_profile/editProfile',
  BIND_DEVICE: '/pages/sub_profile/bindDevice',
  ABOUT: '/pages/sub_profile/about',
  AGREEMENT: '/pages/sub_profile/agreement'
}

/**
 * 需要登录才能访问的页面列表
 */
export const AUTH_REQUIRED_PAGES = [
  ROUTES.HOME,
  ROUTES.CHAT,
  ROUTES.EXPLORE,
  ROUTES.STUDY,
  ROUTES.PROFILE,
  ROUTES.EDIT_PROFILE,
  ROUTES.BIND_DEVICE,
  ROUTES.FAMILY,
  ROUTES.SOS_DETAIL,
  ROUTES.CHAT_DETAIL
]

/**
 * 免登录页面列表（无需登录即可访问）
 */
export const PUBLIC_PAGES = [
  ROUTES.WELCOME,
  ROUTES.LOGIN,
  ROUTES.AGREEMENT,
  ROUTES.ABOUT
]

/**
 * 🔒 路由守卫配置
 */
const ROUTE_GUARD_CONFIG = {
  // 是否启用路由守卫（开发调试时可临时关闭，上线前必须设置为 true）
  enabled: true,

  // 是否显示调试日志
  debug: true,

  // 登录验证接口调用间隔（避免频繁调用，单位：毫秒）
  validateInterval: 5 * 60 * 1000 // 5分钟
}

/**
 * 上次验证登录态的时间戳
 */
let lastValidateTime = 0

/**
 * 登录后恢复的目标页面（用于登录成功后跳回）
 */
let pendingRedirectUrl = null

/**
 * 🔒 路由守卫 - 实际校验登录态
 * @param {String} to 目标路径
 * @returns {String|null} 需要重定向的路径，null 表示通过
 */
export function routeGuard(to) {
  // 🔧 开发模式开关：临时关闭校验（上线前注释掉此行）
  if (!ROUTE_GUARD_CONFIG.enabled) {
    if (ROUTE_GUARD_CONFIG.debug) {
      console.log('🛠️ [路由守卫] 已禁用，直接放行:', to)
    }
    return null
  }

  const user = userStore.user

  if (ROUTE_GUARD_CONFIG.debug) {
    console.log('🔒 [路由守卫] 检查路由:', to)
    console.log('👤 [路由守卫] 用户状态:', {
      isLoggedIn: user?.isLoggedIn,
      phone: user?.phone,
      deviceBound: user?.deviceBound
    })
  }

  // 1. 检查是否为免登录页面
  const isPublicPage = PUBLIC_PAGES.some(page => to.includes(page))
  if (isPublicPage) {
    if (ROUTE_GUARD_CONFIG.debug) {
      console.log('✅ [路由守卫] 免登录页面，直接通过')
    }
    return null
  }

  // 2. 检查用户是否已登录
  const isLoggedIn = user?.isLoggedIn && user?.phone
  if (!isLoggedIn) {
    console.warn('⛔ [路由守卫] 未登录访问受限页面:', to)
    // 保存目标页面，登录后恢复
    pendingRedirectUrl = to
    return ROUTES.LOGIN
  }

  // 3. 已登录用户访问登录页，重定向到首页
  if (to.includes(ROUTES.LOGIN)) {
    console.log('🔄 [路由守卫] 已登录访问登录页，重定向首页')
    return ROUTES.HOME
  }

  // 4. 验证登录态有效性（长时间未验证时调用接口）
  const now = Date.now()
  if (now - lastValidateTime > ROUTE_GUARD_CONFIG.validateInterval) {
    // 注意：这里不阻塞路由，仅触发异步验证
    // 验证结果在 App.vue 中处理
    if (ROUTE_GUARD_CONFIG.debug) {
      console.log('🔍 [路由守卫] 触发异步登录态验证')
    }
    lastValidateTime = now
  }

  if (ROUTE_GUARD_CONFIG.debug) {
    console.log('✅ [路由守卫] 登录态有效，通过')
  }

  return null
}

/**
 * 安全跳转（带路由守卫）
 */
export function navigateTo(url, options = {}) {
  const redirect = routeGuard(url)
  if (redirect) {
    uni.reLaunch({ url: redirect })
    return
  }
  uni.navigateTo({ url, ...options })
}

/**
 * 🔒 跳转到 tabBar 页面（带路由守卫）
 * @param {String} url 目标路径
 */
export function switchTab(url) {
  const redirect = routeGuard(url)
  if (redirect) {
    uni.reLaunch({ url: redirect })
    return
  }
  uni.switchTab({ url })
}

/**
 * 🔒 重定向（带路由守卫）
 * @param {String} url 目标路径
 */
export function redirectTo(url) {
  const redirect = routeGuard(url)
  if (redirect) {
    uni.reLaunch({ url: redirect })
    return
  }
  uni.redirectTo({ url })
}

/**
 * 🔒 重启应用（带路由守卫）
 * @param {String} url 目标路径
 */
export function reLaunch(url) {
  const redirect = routeGuard(url)
  if (redirect) {
    uni.reLaunch({ url: redirect })
    return
  }
  uni.reLaunch({ url })
}

/**
 * 返回上一页
 */
export function navigateBack(delta = 1) {
  uni.navigateBack({ delta })
}

/**
 * 跳转到聊天详情
 */
export function navigateToChatDetail({ targetId, displayName, imagePath }) {
  const params = { targetId, displayName, imagePath }
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')

  navigateTo(`${ROUTES.CHAT_DETAIL}?${queryString}`)
}

/**
 * 跳转到 SOS 详情
 */
export function navigateToSOSDetail({ location, type }) {
  const params = { location, type }
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')

  navigateTo(`${ROUTES.SOS_DETAIL}?${queryString}`)
}

/**
 * 跳转到协议详情
 */
export function navigateToAgreement({ title, content }) {
  const params = { title, content }
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')

  navigateTo(`${ROUTES.AGREEMENT}?${queryString}`)
}

/**
 * 🎯 获取登录后需要恢复的目标页面
 * @returns {String|null} 目标页面路径
 */
export function getPendingRedirectUrl() {
  return pendingRedirectUrl
}

/**
 * 🎯 清除待恢复的跳转目标
 */
export function clearPendingRedirectUrl() {
  pendingRedirectUrl = null
}

/**
 * 🎯 登录成功后恢复跳转
 * @param {String} defaultUrl 默认跳转页面（无待恢复页面时使用）
 */
export function navigateAfterLogin(defaultUrl = ROUTES.HOME) {
  const targetUrl = getPendingRedirectUrl()

  if (targetUrl) {
    console.log('🔄 [路由] 登录成功，恢复跳转:', targetUrl)
    clearPendingRedirectUrl()
    // 判断目标页面是否为 tabBar 页面
    const isTabBarPage = [ROUTES.HOME, ROUTES.CHAT, ROUTES.EXPLORE, ROUTES.STUDY, ROUTES.PROFILE].some(page => targetUrl.includes(page))

    if (isTabBarPage) {
      uni.switchTab({ url: targetUrl })
    } else {
      uni.redirectTo({ url: targetUrl })
    }
  } else {
    console.log('🏠 [路由] 登录成功，跳转默认页面:', defaultUrl)
    uni.switchTab({ url: defaultUrl })
  }
}

/**
 * 初始化路由（完善版 - 带生命周期兜底）
 * 根据登录状态决定跳转到哪个页面
 */
export function initRouter() {
  console.log('🚀 [路由] 开始初始化应用路由...')

  // 监听 UserStore 初始化完成
  const unlisten = userStore.subscribe((user) => {
    // 确保初始化完成后再跳转
    if (!user) return

    console.log('📋 [路由] 用户状态更新:', {
      isLoggedIn: user.isLoggedIn,
      phone: user.phone,
      deviceBound: user.deviceBound,
      deviceId: user.deviceId,
      newUser: user.newUser
    })

    // 执行路由跳转逻辑
    _executeRouteLogic(user)

    // 跳转完成后取消订阅
    if (unlisten) {
      unlisten()
    }
  })

  // 设置超时兜底（防止 UserStore 一直不初始化）
  setTimeout(() => {
    const user = userStore.user
    if (!user || !user.isLoggedIn) {
      console.log('⏱️ [路由] 初始化超时兜底，检查当前状态')
      if (user) {
        _executeRouteLogic(user)
      } else {
        console.log('⚠️ [路由] UserStore 未初始化，跳转登录页')
        uni.reLaunch({
          url: ROUTES.LOGIN,
          success: () => console.log(' [路由] 跳转登录页成功'),
          fail: (err) => console.log('[路由] 跳转登录页失败', err)
        })
      }
    }
  }, 1500) // 延迟1.5秒，给 UserStore 充足的初始化时间
}

/**
 * [内部] 执行路由跳转逻辑
 * @param {Object} user 用户数据
 */
function _executeRouteLogic(user) {
  if (!user) {
    console.log('⚠️ [路由] 用户数据为空，跳转登录页')
    _safeReLaunch(ROUTES.LOGIN, '跳转登录页')
    return
  }

  // 检查登录状态
  if (!user.isLoggedIn || !user.phone) {
    console.log('📝 [路由] 未登录或无手机号，跳转登录页')
    _safeReLaunch(ROUTES.LOGIN, '跳转登录页')
    return
  }

  // 已登录：检查设备绑定状态
  if (user.deviceBound) {
    // 已绑定设备：检查是否为新用户
    if (user.newUser) {
      console.log('🆕 [路由] 新用户且已绑定设备，跳转编辑资料页')
      _safeReLaunch(ROUTES.EDIT_PROFILE, '跳转编辑资料页')
    } else {
      // 老用户：跳转首页
      console.log('🏠 [路由] 老用户且已绑定设备，跳转首页')
      _safeReLaunch(ROUTES.HOME, '跳转首页')
    }
  } else {
    // 未绑定设备：跳转设备绑定页
    console.log('📱 [路由] 已登录但未绑定设备，跳转设备绑定页')
    _safeReLaunch(ROUTES.BIND_DEVICE, '跳转设备绑定页')
  }
}

/**
 * [内部] 安全跳转（带降级方案）
 * @param {String} url 目标路径
 * @param {String} desc 描述信息
 */
function _safeReLaunch(url, desc = '跳转') {
  // 尝试使用 reLaunch
  uni.reLaunch({
    url,
    success: () => console.log(`✅ [路由] ${desc}成功: ${url}`),
    fail: (err) => {
      console.warn(`⚠️ [路由] ${desc}失败 (${url}):`, err)

      // 降级方案1：尝试 switchTab（如果是 tabBar 页面）
      const isTabBarPage = [ROUTES.HOME, ROUTES.CHAT, ROUTES.EXPLORE, ROUTES.PROFILE].includes(url)
      if (isTabBarPage) {
        uni.switchTab({
          url,
          success: () => console.log(`✅ [路由] switchTab 降级成功: ${url}`),
          fail: () => {
            // 降级方案2：尝试 redirectTo
            uni.redirectTo({
              url,
              success: () => console.log(`✅ [路由] redirectTo 降级成功: ${url}`),
              fail: () => {
                // 降级方案3：尝试 navigateTo
                uni.navigateTo({
                  url,
                  success: () => console.log(`✅ [路由] navigateTo 降级成功: ${url}`),
                  fail: () => console.error(`❌ [路由] 所有跳转方式都失败: ${url}`)
                })
              }
            })
          }
        })
      } else {
        // 非 tabBar 页面，直接尝试 redirectTo
        uni.redirectTo({
          url,
          success: () => console.log(`✅ [路由] redirectTo 降级成功: ${url}`),
          fail: () => console.error(`❌ [路由] 所有跳转方式都失败: ${url}`)
        })
      }
    }
  })
}

// 导出所有方法
export default {
  ROUTES,
  routeGuard,
  navigateTo,
  switchTab,
  redirectTo,
  reLaunch,
  navigateBack,
  navigateToChatDetail,
  navigateToSOSDetail,
  navigateToAgreement,
  initRouter,
  getPendingRedirectUrl,
  clearPendingRedirectUrl,
  navigateAfterLogin
}