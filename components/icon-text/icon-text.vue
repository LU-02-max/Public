<template>
  <view class="icon-text">
    <text class="icon-text-icon" :style="{ fontSize: iconSize + 'rpx', color: iconColor }">
      {{ icon }}
    </text>
    <text class="icon-text-text" :style="textStyle">{{ text }}</text>
  </view>
</template>

<script>
export default {
  name: 'IconText',
  props: {
    icon: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    iconSize: {
      type: Number,
      default: 48 // 24 * 2
    },
    textStyle: {
      type: Object,
      default: () => ({})
    },
    iconColor: {
      type: String,
      default: '#333333'
    }
  }
}
</script>

<style lang="scss" scoped>
.icon-text {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text-icon {
  margin-right: 6rpx;
}

.icon-text-text {
  font-size: 28rpx;
  color: #666666;
}
</style>
