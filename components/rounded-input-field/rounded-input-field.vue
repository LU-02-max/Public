<template>
  <view class="rounded-input-field">
    <view class="input-wrapper">
      <!-- 左侧图标 -->
      <text class="input-icon" :style="{ color: iconColor }">{{ icon }}</text>

      <!-- 输入框 -->
      <input
        class="input-field"
        :type="obscureText ? 'password' : 'text'"
        :placeholder="hint"
        :value="value"
        @input="handleInput"
        :placeholder-style="{ color: '#999999' }"
      />

      <!-- 右侧切换可见性图标 -->
      <view v-if="onToggleVisibility" class="input-toggle" @tap="handleToggleVisibility">
        <text class="input-toggle-icon">{{ obscureText ? '👁️‍🗨️' : '👁️' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RoundedInputField',
  props: {
    value: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    obscureText: {
      type: Boolean,
      default: false
    },
    iconColor: {
      type: String,
      default: '#6DBEF6'
    }
  },
  methods: {
    handleInput(e) {
      this.$emit('input', e.detail.value)
    },
    handleToggleVisibility() {
      this.$emit('toggle-visibility')
    }
  }
}
</script>

<style lang="scss" scoped>
.rounded-input-field {
  margin: 12rpx 16rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  background-color: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  height: 88rpx;
  box-sizing: border-box;
}

.input-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.input-field {
  flex: 1;
  font-size: 32rpx;
  color: #333333;
  height: 100%;
  line-height: 88rpx;
}

.input-toggle {
  flex-shrink: 0;
  padding: 8rpx;
}

.input-toggle-icon {
  font-size: 36rpx;
  color: #6DBEF6;
}
</style>
