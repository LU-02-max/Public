<template>
  <view class="mine-menu-item" :style="{ borderRadius: containerRadius + 'rpx', backgroundColor, boxShadow }">
    <view class="mine-menu-content" @tap="handleTap">
      <!-- 左侧图标 -->
      <image
        class="mine-menu-icon"
        :src="imagePath"
        :style="{ width: imageSize + 'rpx', height: imageSize + 'rpx', borderRadius: borderRadius + 'rpx' }"
        mode="aspectFill"
      />

      <!-- 中间文字 -->
      <text class="mine-menu-title">{{ title }}</text>

      <!-- 右侧箭头 -->
      <text class="mine-menu-arrow">›</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MineMenuItem',
  props: {
    imagePath: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    imageSize: {
      type: Number,
      default: 48 // 24 * 2
    },
    borderRadius: {
      type: Number,
      default: 0
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    containerRadius: {
      type: Number,
      default: 24 // 12 * 2
    },
    boxShadow: {
      type: String,
      default: '0 4rpx 8rpx rgba(0, 0, 0, 0.05)'
    }
  },
  methods: {
    handleTap() {
      this.$emit('tap')
    }
  }
}
</script>

<style lang="scss" scoped>
.mine-menu-item {
  padding: 24rpx;
  box-sizing: border-box;
}

.mine-menu-content {
  display: flex;
  align-items: center;
}

.mine-menu-icon {
  flex-shrink: 0;
}

.mine-menu-title {
  flex: 1;
  margin-left: 24rpx;
  font-size: 32rpx;
  color: #333333;
}

.mine-menu-arrow {
  font-size: 40rpx;
  color: #999999;
}
</style>
