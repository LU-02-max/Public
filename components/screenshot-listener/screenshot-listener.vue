<!--
  截图监听组件（仅支持 APP 端）

  注意：
  1. 小程序端不支持原生截图监听
  2. H5 端可以使用 Canvas 截图功能
  3. 该组件仅在 APP 端有效

  使用方法：
  <screenshot-listener @screenshot="handleScreenshot">
    <view class="content">
      你的页面内容
    </view>
  </screenshot-listener>
-->
<template>
  <view>
    <!-- APP 端：使用 canvas 截图 -->
    <!-- #ifdef APP-PLUS -->
    <canvas
      ref="screenshotCanvas"
      canvas-id="screenshotCanvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px', position: 'absolute', top: '-9999px' }"
    />
    <!-- #endif -->

    <!-- 页面内容 -->
    <slot></slot>
  </view>
</template>

<script>
export default {
  name: 'ScreenshotListener',
  data() {
    return {
      canvasWidth: 750,
      canvasHeight: 1334
    }
  },
  mounted() {
    // APP 端：注册截图监听
    // #ifdef APP-PLUS
    this.initScreenshotListener()
    // #endif

    // 小程序端提示不支持
    // #ifdef MP-WEIXIN
    console.warn('截图监听功能在小程序端不支持')
    // #endif

    // H5 端提示功能受限
    // #ifdef H5
    console.warn('截图监听功能在 H5 端功能受限')
    // #endif
  },
  beforeDestroy() {
    // #ifdef APP-PLUS
    this.destroyScreenshotListener()
    // #endif
  },
  methods: {
    // #ifdef APP-PLUS
    initScreenshotListener() {
      // 注意：uniapp 原生插件需要单独开发
      // 这里提供思路代码，实际使用需要集成原生插件

      // 可以使用 plus.gallery 监听相册变化
      // 但这种方式不够准确

      // 更好的方式是使用原生插件监听系统截图事件
      console.log('ScreenshotListener: 已初始化（需要原生插件支持）')
    },

    destroyScreenshotListener() {
      console.log('ScreenshotListener: 已销毁')
    },

    captureCurrentUI() {
      // 使用 canvas 截图
      // 注意：这需要页面内容支持 canvas 绘制
      return new Promise((resolve) => {
        const ctx = uni.createCanvasContext('screenshotCanvas', this)
        // 这里需要将页面内容绘制到 canvas
        // 实际实现比较复杂，需要根据具体页面调整
        ctx.draw(false, () => {
          uni.canvasToTempFilePath({
            canvasId: 'screenshotCanvas',
            success: (res) => {
              resolve(res.tempFilePath)
            },
            fail: (err) => {
              console.error('截图失败', err)
              resolve(null)
            }
          }, this)
        })
      })
    },

    showScreenshotDialog(imagePath) {
      uni.showActionSheet({
        itemList: ['分享到微信', '保存到相册'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.shareToWechat(imagePath)
          } else if (res.tapIndex === 1) {
            this.saveToAlbum(imagePath)
          }
        }
      })
    },

    shareToWechat(imagePath) {
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 5, // 5 = 图片
        imageUrl: imagePath,
        success: () => {
          uni.showToast({ title: '分享成功', icon: 'success' })
        },
        fail: (err) => {
          uni.showToast({ title: '分享失败', icon: 'none' })
        }
      })
    },

    saveToAlbum(imagePath) {
      uni.saveImageToPhotosAlbum({
        filePath: imagePath,
        success: () => {
          uni.showToast({ title: '已保存到相册', icon: 'success' })
        },
        fail: (err) => {
          uni.showToast({ title: '保存失败', icon: 'none' })
        }
      })
    },
    // #endif
  }
}
</script>

<style lang="scss" scoped>
/* 样式在模板内联样式定义 */
</style>
