<template>
  <view class="verify-code-field">
    <view class="input-wrapper">
      <!-- 左侧图标 -->
      <text class="input-icon">🔒</text>

      <!-- 验证码输入框 -->
      <input
        class="input-field"
        type="number"
        :placeholder="hint"
        :value="value"
        @input="handleInput"
        :placeholder-style="{ color: '#999999' }"
      />

      <!-- 获取验证码按钮 -->
      <view class="verify-code-btn" :class="{ 'verify-code-btn--disabled': isCounting }" @tap="handleSendCode">
        <text class="verify-code-text" :style="{ color: isCounting ? '#999999' : '#2196f3' }">
          {{ isCounting ? `${seconds}s后重试` : '获取验证码' }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VerifyCodeField',
  props: {
    value: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      default: '请输入验证码'
    }
  },
  data() {
    return {
      seconds: 0,
      timer: null
    }
  },
  computed: {
    isCounting() {
      return this.seconds > 0
    }
  },
  methods: {
    handleInput(e) {
      this.$emit('input', e.detail.value)
    },
    async handleSendCode() {
      if (this.isCounting) return

      // 先调用外部传入的发送验证码逻辑
      this.$emit('send-code')

      // 再启动倒计时
      this.startCountdown()
    },
    startCountdown() {
      this.seconds = 60
      this.timer = setInterval(() => {
        if (this.seconds === 0) {
          this.stopCountdown()
        } else {
          this.seconds--
        }
      }, 1000)
    },
    stopCountdown() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.seconds = 0
    }
  },
  beforeDestroy() {
    this.stopCountdown()
  }
}
</script>

<style lang="scss" scoped>
.verify-code-field {
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
  color: #6DBEF6;
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

.verify-code-btn {
  flex-shrink: 0;
  padding: 8rpx 16rpx;

  &.verify-code-btn--disabled {
    pointer-events: none;
  }
}

.verify-code-text {
  font-size: 28rpx;
  font-weight: 500;
}
</style>
