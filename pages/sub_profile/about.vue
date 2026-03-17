<!-- pages/sub_profile/about.vue -->
<!-- 关于我们页面 -->

<template>
  <view class="about-container">
    <scroll-view class="agreement-list" scroll-y>
      <view
        v-for="(item, index) in agreements"
        :key="index"
        class="agreement-item"
        @click="handleAgreementClick(item)"
      >
        <text class="agreement-title">{{ item.title }}</text>
        <text class="arrow">›</text>
      </view>
    </scroll-view>

    <!-- 底部版本信息 -->
    <view class="version-info">
      <text class="version-text">版本号：{{ version }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      version: '1.0.0',
      agreements: [
        { title: '用户协议', path: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/flutter-jzd-assets/txt/YO%21WOW%E5%A3%AE%E6%B8%B8%E6%9C%BA%E4%BC%9A%E5%91%98%E6%9C%8D%E5%8A%A1%E5%8D%8F%E8%AE%AE.md' },
        { title: '隐私政策', path: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/flutter-jzd-assets/txt/YO%21WOW%E5%A3%AE%E6%B8%B8%E6%9C%BA%E9%9A%90%E7%A7%81%E6%94%BF%E7%AD%96.md' },
        { title: '服务条款', path: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/flutter-jzd-assets/txt/YO%21WOW%E5%A3%AE%E6%B8%B8%E6%9C%BA%E8%BD%AF%E4%BB%B6%E7%94%A8%E6%88%B7%E6%9C%8D%E5%8A%A1%E5%8D%8F%E8%AE%AE.md' },
        { title: '儿童隐私保护', path: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/flutter-jzd-assets/txt/YO%21WOW%E5%A3%AE%E6%B8%B8%E6%9C%BA%E5%84%BF%E7%AB%A5%E9%9A%90%E7%A7%81%E5%8D%8F%E8%AE%AE.md' }
      ]
    }
  },
  onLoad() {},
  methods: {
    handleAgreementClick(item) {
      // 正确跳转到协议详情页面，传递title和url参数
      uni.navigateTo({
        url: `/pages/sub_profile/agreement?title=${encodeURIComponent(item.title)}&url=${encodeURIComponent(item.path)}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.about-container {
  min-height: 100vh;
  background: #F7F7F7;
}

.agreement-list {
  padding: 16rpx 32rpx;
}

.agreement-item {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 18rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.agreement-title {
  font-size: 32rpx;
  color: #333;
}

.arrow {
  font-size: 48rpx;
  color: #999;
  font-weight: 300;
}

.version-info {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  text-align: center;
}

.version-text {
  font-size: 28rpx;
  color: #999;
}
</style>
