<!-- pages/sub_detail/home/family.vue -->
<template>
  <view class="family-container">
    <view class="section-title">{{ childName }}的家庭角色概览</view>

    <view class="member-card parent-card" @click="handleParentTap">
      <view class="avatar-wrapper parent-avatar">
        <image class="avatar-image" src="https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/device.png" mode="aspectFill" />
      </view>
      <view class="member-info">
        <view class="role-tag parent-tag">主要监护人</view>
        <text class="member-name">{{ childName }}的{{ relation }}</text>
        <text class="member-relation">家长：{{ relation }}</text>
      </view>
      <text class="arrow">›</text>
    </view>

    <view class="member-card child-card" @click="handleChildTap">
      <view class="avatar-wrapper child-avatar">
        <image class="avatar-image" 
          :src="childGender === '女' ? 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/female.png' : 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/male.png'" 
          mode="aspectFill" />
      </view>
      <view class="member-info">
        <view class="role-tag child-tag">宝贝</view>
        <text class="member-name">{{ childName }}</text>
        <text class="member-relation">性别：{{ childGender }}</text>
      </view>
      <text class="arrow">›</text>
    </view>

    <view class="add-button" @click="handleAddMember">
      <text class="add-icon">+</text>
      <text class="add-text">新增成员</text>
    </view>
  </view>
</template>

<script>
import userStore from '@/store/user.js'

export default {
  data() {
    return {
      // 所有默认值改为空字符串
      childName: '',
      childGender: '',
      relation: ''
    }
  },
  
  /**
   * [生命周期] 每次页面显示时执行
   * 逻辑：从全局 Store 获取最新修改的资料并同步到本地变量
   */
  onShow() {
    console.log(' [Family] 页面进入，开始同步 Store 数据...');
    
    const user = userStore.user;
    
    // 同步逻辑：只取 Store 中的值，没有则为空字符串
    this.childName = user.childNickname || user.username || '';
    this.childGender = user.childGender || '';
    this.relation = user.parentRelationship || '';

    console.log(`✅ [Family] 数据同步结果: 名字=${this.childName}, 性别=${this.childGender}, 关系=${this.relation}`);

    // 动态修改小程序/App 原生导航栏标题（处理空值情况）
    const titleName = this.childName || '';
    uni.setNavigationBarTitle({
      title: `${titleName}的家庭成员`
    });
  },

  methods: {
    /**
     * [交互] 点击家长卡片
     * 逻辑：跳转到资料编辑页面
     */
    handleParentTap() {
      console.log(' [Family] 用户点击家长卡片，准备跳转编辑页');
      uni.navigateTo({ url: '/pages/sub_profile/editProfile' });
    },

    /**
     * [交互] 点击宝贝卡片
     * 逻辑：跳转到资料编辑页面
     */
    handleChildTap() {
      console.log(' [Family] 用户点击宝贝卡片，准备跳转编辑页');
      uni.navigateTo({ url: '/pages/sub_profile/editProfile' });
    },

    /**
     * [交互] 点击新增成员
     * 逻辑：弹出开发提示
     */
    handleAddMember() {
      console.log(' [Family] 用户尝试新增成员');
      uni.showToast({ 
        title: '功能开发中，敬请期待', 
        icon: 'none' 
      });
    }
  }
}
</script>

<style lang="scss" scoped>
/* 样式部分保持原有的精美设计 */
.family-container {
  min-height: 100vh;
  background: #F7F9FB;
  padding: 32rpx;
  padding-top: 56rpx;
}

.section-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 40rpx;
}

.member-card {
  background: #fff;
  border-radius: 40rpx;
  padding: 36rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  border: 3rpx solid transparent;
  transition: all 0.2s;

  &:active {
    transform: scale(0.98); // 点击缩放效果
    background-color: #fcfcfc;
  }
}

.parent-card {
  border-color: rgba(140, 208, 252, 0.2);
}

.child-card {
  border-color: rgba(255, 192, 120, 0.2);
}

.avatar-wrapper {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 32rpx;
}

.parent-avatar {
  border: 6rpx solid #8CD0FC;
}

.child-avatar {
  border: 6rpx solid #FFC078;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.member-info {
  flex: 1;
}

.role-tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.parent-tag {
  background: rgba(140, 208, 252, 0.15);
  color: #1890ff;
}

.child-tag {
  background: rgba(255, 192, 120, 0.15);
  color: #ff9c6e;
}

.member-name {
  display: block;
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.member-relation {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-top: 4rpx;
}

.arrow {
  font-size: 44rpx;
  color: #ccc;
  font-weight: 300;
}

.add-button {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 120rpx;
  height: 120rpx;
  background: #8CD0FC;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(140, 208, 252, 0.4);
  
  &:active {
    opacity: 0.8;
  }
}

.add-icon {
  font-size: 60rpx;
  color: #fff;
  line-height: 1;
}

.add-text {
  font-size: 20rpx;
  color: #fff;
}
</style>