<!-- pages/explore/components/AbilityAnalysis.vue -->
<!-- 孩子综合能力 -->
<template>
  <view class="ability-analysis">
    <view class="section-title">孩子综合能力分布</view>

    <view class="chart-box">
      <view class="ring-container">
        <view class="ring-placeholder">
          <view class="inner-content">
            <text class="label">综合评估</text>
            <text class="value">计算中...</text>
          </view>
        </view>
        <view class="dot dot-1"></view>
        <view class="dot dot-2"></view>
      </view>

      <view class="analysis-card">
        <view class="card-header">
          <view class="tag">报告生成中</view>
          <text class="update-time">实时同步</text>
        </view>
        
        <text class="card-desc">
          系统正在调取探索中心的最新数据，基于孩子在各认知维度的交互深度，为您构建多维能力画像。
        </text>

        <view class="loading-bar">
          <view class="bar-inner" :class="{ 'animating': isActive }"></view>
        </view>
      </view>
    </view>
    
    <view class="tips-footer">
      <text class="icon">i</text>
      <text>综合能力分布由 12 项核心维度数据计算得出</text>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  phone: String,
  isActive: {
    type: Boolean,
    default: false
  }
});
</script>

<style lang="scss" scoped>
.ability-analysis {
  padding: 10rpx 30rpx;
}

.section-title { 
  font-size: 34rpx; 
  font-weight: bold; 
  text-align: center; 
  margin-bottom: 40rpx; 
  color: #333;
}

.ring-container {
  position: relative;
  width: 360rpx;
  height: 360rpx;
  margin: 0 auto 40rpx;
  
  .ring-placeholder { 
    width: 320rpx; 
    height: 320rpx; 
    margin: 20rpx;
    border: 12rpx solid #f4f9ff; 
    border-top: 12rpx solid #46a1ff; 
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    background: radial-gradient(circle, #ffffff 60%, #f9fcff 100%);
    
    .inner-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      .label { font-size: 24rpx; color: #999; }
      .value { font-size: 36rpx; color: #46a1ff; font-weight: bold; }
    }
  }

  .dot { position: absolute; width: 10rpx; height: 10rpx; border-radius: 50%; background: #46a1ff; opacity: 0.2; }
  .dot-1 { top: 15%; right: 10%; }
  .dot-2 { bottom: 25%; left: 8%; }
}

.analysis-card { 
  background: #ffffff; 
  border-radius: 24rpx; 
  padding: 34rpx; 
  border: 1rpx solid #f0f4f8;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    .tag { background: #eef6ff; color: #46a1ff; font-size: 20rpx; padding: 4rpx 16rpx; border-radius: 8rpx; }
    .update-time { font-size: 22rpx; color: #bbb; }
  }
  
  .card-desc { 
    color: #5e6d82; 
    font-size: 26rpx; 
    line-height: 1.7;
    display: block;
    margin-bottom: 30rpx;
  }

  .loading-bar {
    height: 8rpx;
    background: #f5f7fa;
    border-radius: 10rpx;
    overflow: hidden;
    
    .bar-inner {
      width: 30%;
      height: 100%;
      background: #46a1ff;
      transform: translate3d(-150%, 0, 0);
      
      &.animating {
        animation: slideProgress 2s infinite linear;
      }
    }
  }
}

.tips-footer {
  margin-top: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #c0c4cc;
  font-size: 22rpx;
  .icon { 
    width: 26rpx; height: 26rpx; border: 1rpx solid #dcdfe6; 
    border-radius: 50%; text-align: center; line-height: 24rpx; margin-right: 10rpx;
  }
}

@keyframes slideProgress {
  from { transform: translate3d(-150%, 0, 0); }
  to { transform: translate3d(400%, 0, 0); }
}
</style>