<!-- pages/explore/explore.vue -->
<!-- 主页面 -->
<template>
  <view class="page-wrapper">
    <view class="custom-header">
      <view :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="header-title-bar">
        <text class="header-title">探索</text>
      </view>
    </view>

    <view class="nav-container">
      <view class="tab-box">
        <view 
          v-for="(item, index) in tabs" 
          :key="index"
          class="tab-btn" 
          :class="{ active: currentTab === index }"
          @tap="handleTabChange(index)"
        >
          {{ item }}
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="main-scroll">
      <view class="content-container">
        
        <view v-show="currentTab === 0">
          <ExploreMap />
        </view>

        <view v-if="currentTab === 1">
          <TalentDetail :phone="userPhone" />
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script>
// 💡 为了彻底解决“失效”和“找不到变量”的问题，我们改用标准的 setup 函数写法
// 这种写法在小程序端是最稳定的，能百分百保证变量暴露给模板
import { ref } from 'vue';
import { onShow, onLoad } from '@dcloudio/uni-app';
import userStore from '@/store/user.js';

// 引入组件
import ExploreMap from './components/ExploreMap.vue';
import TalentDetail from './components/TalentDetail.vue';

export default {
  components: {
    ExploreMap,
    TalentDetail
  },
  setup() {
    const currentTab = ref(0); // 默认选中的索引
    const userPhone = ref('');
    const statusBarHeight = ref(44);
    const tabs = ['探索半径', '孩子天赋分析'];

    // 切换函数
    const handleTabChange = (index) => {
      console.log('点击了 Tab:', index);
      currentTab.value = index;
    };

    onLoad(() => {
      const info = uni.getSystemInfoSync();
      statusBarHeight.value = info.statusBarHeight || 44;
    });

    onShow(() => {
      if (userStore.user && userStore.user.phone) {
        userPhone.value = userStore.user.phone;
      }
    });

    // 💡 显式返回，确保模板一定能拿到
    return {
      currentTab,
      userPhone,
      statusBarHeight,
      tabs,
      handleTabChange
    };
  }
}
</script>

<style lang="scss" scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
}

.custom-header {
  background: #fff;
  z-index: 200;
  .header-title-bar {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 32rpx;
    .header-title { 
      font-size: 36rpx; 
      font-weight: bold; 
      text-align: center;
    }
  }
}

.nav-container {
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid #f5f5f5;
  .tab-box {
    display: flex;
    justify-content: space-around;
    padding: 20rpx 0;
    .tab-btn {
      font-size: 26rpx;
      color: #999;
      padding: 10rpx 20rpx;
      &.active {
        color: #333;
        font-weight: bold;
        position: relative;
        &:after {
          content: '';
          position: absolute;
          bottom: -5rpx;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 6rpx;
          background: #3a96ff;
          border-radius: 4rpx;
        }
      }
    }
  }
}

.main-scroll {
  flex: 1;
  height: 0; /* 必须，确保 flex 布局下滚动有效 */
}

.content-container {
  padding: 30rpx 20rpx;
  min-height: 600rpx;
}
</style>