<template>
  <view class="notification-demo">
    <view class="header">
      <text class="title">通知服务演示（方案 C）</text>
      <text class="subtitle">订阅消息 + 短信语音兜底</text>
    </view>

    <!-- 短信服务开关 -->
    <view class="section">
      <text class="section-title">短信服务设置</text>
      <view class="setting-item">
        <text class="setting-label">启用短信语音兜底</text>
        <switch :checked="smsEnabled" @change="handleSMSChange" />
      </view>
      <text class="setting-hint">启用后，SOS 警报会同时发送短信语音提醒</text>
    </view>

    <!-- 订阅消息 -->
    <view class="section">
      <text class="section-title">微信订阅消息</text>
      <button class="action-btn" @tap="handleSubscribeAll">订阅所有消息</button>
      <text class="setting-hint">订阅后可接收微信服务通知</text>
    </view>

    <!-- 发送测试通知 -->
    <view class="section">
      <text class="section-title">发送测试通知</text>

      <button class="action-btn danger" @tap="sendSOSAlert">
        🚨 发送 SOS 警报
      </button>

      <button class="action-btn warning" @tap="sendDeviceOffline">
        ⚠️ 发送设备离线
      </button>

      <button class="action-btn info" @tap="sendDeviceOnline">
        ✅ 发送设备上线
      </button>

      <button class="action-btn primary" @tap="sendLocationUpdate">
        📍 发送位置更新
      </button>
    </view>

    <!-- 通知日志 -->
    <view class="section">
      <text class="section-title">通知日志</text>
      <view class="log-container">
        <scroll-view scroll-y class="log-scroll">
          <view v-for="(log, index) in notificationLog" :key="index" class="log-item">
            <text class="log-time">{{ formatTime(log.timestamp) }}</text>
            <text class="log-type">{{ formatType(log.type) }}</text>
            <text class="log-channel" :class="'channel-' + log.channel">
              {{ log.channel === 'wx' ? '微信' : '短信' }}
            </text>
            <text class="log-status" :class="{ success: log.success, fail: !log.success }">
              {{ log.success ? '✅ 成功' : '❌ 失败' }}
            </text>
          </view>
          <view v-if="notificationLog.length === 0" class="empty-log">
            <text>暂无通知记录</text>
          </view>
        </scroll-view>
      </view>
      <button class="action-btn secondary" @tap="clearLog">清空日志</button>
    </view>
  </view>
</template>

<script>
import smsService from '@/services/sms.js'
import notificationService from '@/services/notification.js'
import { NOTIFICATION_TYPE } from '@/services/notification.js'
import userStore from '@/store/user.js'

export default {
  name: 'NotificationDemo',
  data() {
    return {
      smsEnabled: smsService.isEnabled(),
      notificationLog: notificationService.getLog()
    }
  },
  onLoad() {
    console.log('[NotificationDemo] 页面加载')
  },
  methods: {
    /**
     * 切换短信服务开关
     */
    handleSMSChange(e) {
      const enabled = e.detail.value
      if (enabled) {
        smsService.enable()
        uni.showToast({
          title: '短信服务已启用',
          icon: 'success'
        })
      } else {
        smsService.disable()
        uni.showToast({
          title: '短信服务已禁用',
          icon: 'none'
        })
      }
      this.smsEnabled = enabled
    },

    /**
     * 订阅所有消息
     */
    async handleSubscribeAll() {
      const user = userStore.user
      if (!user.isLoggedIn) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }

      uni.showLoading({ title: '请求订阅...' })

      try {
        const result = await notificationService.requestAllSubscriptions(user.phone)

        uni.hideLoading()

        if (result.success) {
          uni.showToast({
            title: '订阅成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: '订阅失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '订阅异常',
          icon: 'none'
        })
        console.error('[NotificationDemo] 订阅失败', error)
      }

      this.refreshLog()
    },

    /**
     * 发送 SOS 警报
     */
    async sendSOSAlert() {
      await this.sendNotification(NOTIFICATION_TYPE.SOS_ALERT)
    },

    /**
     * 发送设备离线通知
     */
    async sendDeviceOffline() {
      await this.sendNotification(NOTIFICATION_TYPE.DEVICE_OFFLINE)
    },

    /**
     * 发送设备上线通知
     */
    async sendDeviceOnline() {
      await this.sendNotification(NOTIFICATION_TYPE.DEVICE_ONLINE)
    },

    /**
     * 发送位置更新通知
     */
    async sendLocationUpdate() {
      await this.sendNotification(NOTIFICATION_TYPE.LOCATION_UPDATE)
    },

    /**
     * 发送通知
     */
    async sendNotification(type) {
      const user = userStore.user
      if (!user.isLoggedIn) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }

      uni.showLoading({ title: '发送中...' })

      try {
        const now = new Date()
        const data = {
          childName: '小明',
          location: '113.32533, 23.10647',
          time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
        }

        let result
        switch (type) {
          case NOTIFICATION_TYPE.SOS_ALERT:
            result = await notificationService.sendSOSAlert({
              phone: user.phone,
              ...data
            })
            break
          case NOTIFICATION_TYPE.DEVICE_OFFLINE:
            result = await notificationService.sendDeviceOffline({
              phone: user.phone,
              ...data
            })
            break
          case NOTIFICATION_TYPE.DEVICE_ONLINE:
            result = await notificationService.sendDeviceOnline({
              phone: user.phone,
              ...data
            })
            break
          case NOTIFICATION_TYPE.LOCATION_UPDATE:
            result = await notificationService.sendLocationUpdate({
              phone: user.phone,
              ...data
            })
            break
        }

        uni.hideLoading()

        if (result) {
          uni.showToast({
            title: '发送成功',
            icon: 'success'
          })
        }

        this.refreshLog()
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '发送失败',
          icon: 'none'
        })
        console.error('[NotificationDemo] 发送失败', error)
      }
    },

    /**
     * 刷新日志
     */
    refreshLog() {
      this.notificationLog = notificationService.getLog()
    },

    /**
     * 清空日志
     */
    clearLog() {
      notificationService.clearLog()
      this.notificationLog = []
      uni.showToast({
        title: '日志已清空',
        icon: 'success'
      })
    },

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
    },

    /**
     * 格式化类型
     */
    formatType(type) {
      const map = {
        sos_alert: 'SOS 警报',
        device_offline: '设备离线',
        device_online: '设备上线',
        location_update: '位置更新',
        system_notify: '系统通知'
      }
      return map[type] || type
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-demo {
  min-height: 100vh;
  padding: 32rpx;
  background-color: #f7f7f7;
}

.header {
  text-align: center;
  margin-bottom: 48rpx;
}

.title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #999999;
}

.section {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 24rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.setting-label {
  font-size: 28rpx;
  color: #666666;
}

.setting-hint {
  display: block;
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

.action-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  margin-bottom: 24rpx;
  border: none;
  background-color: #6DBEF6;
  color: #ffffff;

  &.danger {
    background-color: #FF5252;
  }

  &.warning {
    background-color: #FF9800;
  }

  &.info {
    background-color: #2196F3;
  }

  &.primary {
    background-color: #4CAF50;
  }

  &.secondary {
    background-color: #9E9E9E;
  }
}

.log-container {
  height: 400rpx;
  margin-bottom: 24rpx;
}

.log-scroll {
  height: 100%;
}

.log-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.log-time {
  flex-shrink: 0;
  width: 120rpx;
  font-size: 24rpx;
  color: #999999;
}

.log-type {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  padding-left: 16rpx;
}

.log-channel {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  margin-right: 16rpx;

  &.channel-wx {
    background-color: #07c160;
    color: #ffffff;
  }

  &.channel-sms {
    background-color: #FF9800;
    color: #ffffff;
  }
}

.log-status {
  flex-shrink: 0;
  font-size: 24rpx;

  &.success {
    color: #4CAF50;
  }

  &.fail {
    color: #FF5252;
  }
}

.empty-log {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 28rpx;
  color: #999999;
}
</style>
