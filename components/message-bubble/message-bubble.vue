<template>
  <view class="message-bubble" :class="{ 'message-bubble--user': isUser }">
    <view class="message-content">
      <!-- 图片 -->
      <image
        v-if="imageUrl"
        class="message-image"
        :src="imageUrl"
        mode="aspectFill"
        @tap="handleImageTap"
        @load="handleImageLoad"
        @error="handleImageError"
      >
        <!-- 转发图标 -->
        <view v-if="showForwardIcon" class="message-forward" @tap.stop="handleForwardTap">
          <text class="message-forward-icon">↗</text>
        </view>
      </image>

      <!-- 文本 -->
      <text v-if="text" class="message-text">{{ text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MessageBubble',
  props: {
    text: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    sender: {
      type: String,
      required: true,
      validator: (value) => ['user', 'ai'].includes(value)
    },
    showForwardIcon: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isUser() {
      return this.sender === 'user'
    }
  },
  methods: {
    handleImageTap() {
      this.$emit('image-tap')
    },
    handleForwardTap() {
      this.$emit('forward-tap')
    },
    handleImageLoad() {
      this.$emit('image-load')
    },
    handleImageError() {
      this.$emit('image-error')
    }
  }
}
</script>

<style lang="scss" scoped>
.message-bubble {
  display: flex;
  justify-content: flex-start;
  margin: 8rpx 0;

  &.message-bubble--user {
    justify-content: flex-end;
  }
}

.message-content {
  max-width: 70%;
  padding: 20rpx 28rpx;
  border-radius: 32rpx;
  box-sizing: border-box;
  background-color: #f0f0f5;

  .message-bubble--user & {
    background-color: #4a90e2;
  }
}

.message-image {
  width: 100%;
  min-height: 200rpx;
  max-height: 600rpx;
  border-radius: 24rpx;
  position: relative;
  overflow: hidden;
}

.message-forward {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 48rpx;
  height: 48rpx;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-forward-icon {
  font-size: 40rpx;
  color: #ffffff;
}

.message-text {
  display: block;
  font-size: 32rpx;
  line-height: 1.5;
  color: #333333;

  .message-bubble--user & {
    color: #ffffff;
  }

  &:not(:first-child) {
    margin-top: 16rpx;
  }
}
</style>
