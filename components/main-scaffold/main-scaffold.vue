<template>
  <view class="main-scaffold">
    <!-- 页面内容 -->
    <slot></slot>

    <!-- 底部 TabBar -->
    <!-- 注意：uniapp 的 tabBar 在 pages.json 中配置 -->
  </view>
</template>

<script>
/**
 * 主框架组件
 * 对应 Flutter 的 mainScaffold.dart
 *
 * 注意：
 * uniapp 的底部导航栏（tabBar）在 pages.json 中配置
 * 该组件主要作为主框架的包装器
 */
export default {
  name: 'MainScaffold',
  data() {
    return {
      currentIndex: 0
    }
  },
  onLoad() {
    // 获取当前页面索引
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const route = currentPage.route

    // 根据路由设置当前索引
    const routeMap = {
      'pages/index/index': 0,
      'pages/chat/chat': 1,
      'pages/explore/explore': 2,
      'pages/study/study': 3,
      'pages/profile/profile': 4
    }

    this.currentIndex = routeMap[route] || 0
  },
  methods: {
    /**
     * 切换 Tab
     * @param {number} index - Tab 索引
     */
    switchTab(index) {
      this.currentIndex = index

      const routes = [
        '/pages/index/index',
        '/pages/chat/chat',
        '/pages/explore/explore',
        '/pages/study/study',
        '/pages/profile/profile'
      ]

      uni.switchTab({
        url: routes[index]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.main-scaffold {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
