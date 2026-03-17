<template>
  <view class="customer-service-container">
    <view class="status-bar"></view>
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="left" size="24" color="#fff"></uni-icons>
      </view>
      <text class="nav-title">客服微信</text>
      <view style="width: 80rpx;"></view>
    </view>

    <!-- 顶部留白区域 -->
    <view class="top-spacer">
      <!-- <view class="top-decoration">
        <image class="decoration-icon" src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/客服@3x.png" mode="aspectFit"></image>
      </view> -->
    </view>

    <view class="content-section">
      <view class="wx-card">
        <view class="card-header">
          <text class="card-title">联系专属客服</text>
          <text class="card-subtitle">一对一服务支持</text>
        </view>
        <image class="wx-qr" src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/QRcode.png" mode="aspectFit"></image>
        <text class="wx-tips">扫码添加客服微信</text>
        <text class="wx-desc">获取更专业的产品指导</text>
      </view>

      <view class="tips-section">
        <view class="section-header">
          <text class="section-icon">💡</text>
          <text class="tips-title">温馨提示</text>
        </view>
        <view class="tips-content">
          <view class="tip-item">
            <text class="tip-icon">✓</text>
            <text class="tips-item">添加客服微信可获得专属服务支持</text>
          </view>
          <view class="tip-item">
            <text class="tip-icon">✓</text>
            <text class="tips-item">如有疑问可随时咨询客服</text>
          </view>
          <view class="tip-item">
            <text class="tip-icon">✓</text>
            <text class="tips-item">工作时间：周一至周日 9:00-18:00</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 按钮不再固定在底部，改为相对定位 -->
    <view class="button-section">
      <button class="skip-button" @click="skipToHome">跳过</button>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue';
import userStore from '@/store/user.js';

onMounted(() => {
  console.log('[客服微信] 页面加载');
});

const goBack = () => {
  uni.navigateBack();
};

const skipToHome = () => {
  console.log('[客服微信] 跳过，跳转到首页');
  uni.switchTab({
    url: '/pages/index/index',
    success: () => {
      console.log('[客服微信] 跳转首页成功');
    },
    fail: (err) => {
      console.error('[客服微信] 跳转首页失败:', err);
      uni.reLaunch({ url: '/pages/index/index' });
    }
  });
};
</script>

<style lang="scss" scoped>
.customer-service-container {
  min-height: 100vh;
  background-color: #F8F9FB;
  display: flex;
  flex-direction: column;
}

.status-bar {
  height: var(--status-bar-height);
  background-color: #6DBEF6;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  background: #6DBEF6;
  color: #fff;
  flex-shrink: 0;
  .back-btn {
    width: 80rpx;
    display: flex;
    justify-content: center;
  }
  .nav-title {
    font-size: 34rpx;
    font-weight: bold;
  }
}

/* 顶部留白区域 */
.top-spacer {
  height: 120rpx;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

// .top-decoration {
//   display: flex;
//   flex-direction: column;
//   align-items: center;
// }

.decoration-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #6DBEF6, #4A9BE8);
  padding: 20rpx;
  box-shadow: 0 10rpx 30rpx rgba(109, 190, 246, 0.3);
}

.content-section {
  padding: 40rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.wx-card {
  background: #fff;
  border-radius: 30rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.08);
  margin-bottom: 40rpx;
  border: 1rpx solid rgba(109, 190, 246, 0.1);
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
  text-align: center;
}

.card-title {
  font-size: 36rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.card-subtitle {
  font-size: 28rpx;
  color: #666;
}

.wx-qr {
  width: 400rpx;
  height: 400rpx;
  border-radius: 20rpx;
  background: #f9f9f9;
  margin-bottom: 30rpx;
  border: 2rpx solid #f0f0f0;
  padding: 20rpx;
}

.wx-tips {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 10rpx;
}

.wx-desc {
  font-size: 26rpx;
  color: #999;
  text-align: center;
}

.wx-number {
  font-size: 28rpx;
  color: #999;
}

.tips-section {
  background: #fff;
  border-radius: 30rpx;
  padding: 40rpx;
  flex: 1;
  margin-bottom: 40rpx;
  border: 1rpx solid rgba(109, 190, 246, 0.1);
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.08);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-icon {
  font-size: 36rpx;
  margin-right: 15rpx;
}

.tips-title {
  font-size: 34rpx;
  color: #333;
  font-weight: bold;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 25rpx;
}

.tip-item {
  display: flex;
  align-items: flex-start;
}

.tip-icon {
  font-size: 28rpx;
  color: #6DBEF6;
  margin-right: 15rpx;
  background: rgba(109, 190, 246, 0.1);
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.tips-item {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  flex: 1;
}

.button-section {
  padding: 40rpx;
  background: transparent;
  flex-shrink: 0;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.skip-button {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #6DBEF6, #4A9BE8);
  color: #fff;
  border-radius: 50rpx;
  font-size: 34rpx;
  font-weight: bold;
  border: none;
  box-shadow: 0 8rpx 30rpx rgba(109, 190, 246, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skip-button:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 15rpx rgba(109, 190, 246, 0.3);
}

.skip-button::after {
  border: none;
}

/* 响应式调整 */
@media (max-height: 1200rpx) {
  .top-spacer {
    height: 40rpx;
  }
  
  .wx-card {
    padding: 40rpx 30rpx;
    
    .wx-qr {
      width: 350rpx;
      height: 350rpx;
    }
  }
}
</style>
