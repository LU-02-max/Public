<template>
  <view class="chat-list-item" @tap="handleTap">
    <!-- AI 头像 -->
    <image
      class="chat-avatar"
      :src="chatGroup.imagePath"
      mode="aspectFill"
      @error="handleImageError"
    >
      <template #error>
        <view class="chat-avatar-placeholder">
          <text class="chat-avatar-icon">🤖</text>
        </view>
      </template>
    </image>

    <!-- 聊天信息 -->
    <view class="chat-info">
      <!-- AI 模型名称 -->
      <text class="chat-name">{{ chatGroup.displayName }}</text>
      <!-- 最后一条消息预览 -->
      <text class="chat-preview">{{ chatGroup.lastMessage }}</text>
    </view>

    <!-- 对话数量指示器 -->
    <view v-if="chatGroup.conversations && chatGroup.conversations.length > 0" class="chat-count">
      <text class="chat-count-text">{{ chatGroup.conversations.length }}</text>
    </view>

    <text class="chat-arrow">›</text>
  </view>
</template>

<script>
export default {
  name: 'ChatListItem',
  props: {
    chatGroup: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleTap() {
      this.$emit('tap')
    },
    handleImageError() {
      // 图片加载失败时显示占位图
      console.log('Chat avatar image error')
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-list-item {
  display: flex;
  align-items: center;
  margin: 12rpx 16rpx;
  padding: 28rpx 32rpx;
  background-color: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.chat-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
}

.chat-avatar-placeholder {
  width: 80rpx;
  height: 80rpx;
  background-color: #e0e0e0;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-avatar-icon {
  font-size: 40rpx;
  color: #9e9e9e;
}

.chat-info {
  flex: 1;
  margin-left: 24rpx;
  margin-right: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.chat-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  line-height: 1.4;
}

.chat-preview {
  font-size: 28rpx;
  color: #999999;
  margin-top: 8rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.chat-count {
  padding: 8rpx 16rpx;
  background-color: #e3f2fd;
  border-radius: 24rpx;
  margin-right: 16rpx;
}

.chat-count-text {
  font-size: 24rpx;
  color: #2196f3;
  font-weight: 500;
}

.chat-arrow {
  font-size: 32rpx;
  color: #999999;
  flex-shrink: 0;
}
</style>
