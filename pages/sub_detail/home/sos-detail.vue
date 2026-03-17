<!-- pages/sub_detail/home/sos-detail.vue -->
<!-- SOS 详情页面 -->

<template>
  <view class="sos-detail-container">
    <!-- SOS 巨型图标 -->
    <view class="sos-icon">
      <text class="sos-text">SOS</text>
    </view>

    <!-- 警报标题 -->
    <text class="alert-title">紧急求助信号！</text>
    <text class="alert-desc">您的孩子可能遇到危险，请立即处理！</text>

    <!-- 详情信息卡片 -->
    <view class="detail-card">
      <view class="detail-row">
        <text class="detail-label">求助设备</text>
        <text class="detail-value">话痨同桌</text>
      </view>
      <view class="divider"></view>
      <view class="detail-row">
        <text class="detail-label">求助时间</text>
        <text class="detail-value">{{ helpTime }}</text>
      </view>
      <view class="divider"></view>
      <view class="detail-row">
        <text class="detail-label">最后位置</text>
        <text class="detail-value location">查看位置</text>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="action-section">
      <button class="action-button primary" @click="handleViewLocation">立即查看实时位置</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      helpTime: ''
    }
  },
  onLoad() {
    const now = new Date()
    this.helpTime = this.formatTime(now)
  },
  methods: {
    formatTime(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    handleViewLocation() {
      uni.switchTab({
        url: '/pages/explore/explore'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.sos-detail-container {
  min-height: 100vh;
  background: #FFF9F9;
  padding: 32rpx;
  padding-top: 80rpx;
}

.sos-icon {
  width: 240rpx;
  height: 240rpx;
  background: #FF007F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 48rpx;
  box-shadow: 0 20rpx 60rpx rgba(255, 0, 127, 0.3);
}

.sos-text {
  font-size: 64rpx;
  font-weight: bold;
  color: #fff;
}

.alert-title {
  display: block;
  text-align: center;
  font-size: 48rpx;
  font-weight: bold;
  color: #FF5252;
  margin-bottom: 16rpx;
}

.alert-desc {
  display: block;
  text-align: center;
  font-size: 32rpx;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 64rpx;
}

.detail-card {
  background: #fff;
  border-radius: 40rpx;
  padding: 40rpx;
  margin-bottom: 80rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.detail-label {
  width: 160rpx;
  font-size: 32rpx;
  color: rgba(0, 0, 0, 0.6);
}

.detail-value {
  flex: 1;
  text-align: right;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.detail-value.location {
  color: #2196F3;
}

.divider {
  height: 2rpx;
  background: #F5F5F5;
  margin: 30rpx 0;
}

.action-section {
  padding: 0 16rpx;
}

.action-button {
  width: 100%;
  height: 112rpx;
  background: #00C853;
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 56rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(0, 200, 83, 0.4);
}

.action-button::after {
  border: none;
}
</style>
