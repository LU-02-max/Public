<!-- pages/sub_profile/agreement.vue -->
<!-- 协议详情页面 - 使用 rich-text 显示 Markdown 内容 -->

<template>
  <view class="agreement-container">
    <view v-if="loading" class="loading-container">
      <text class="loading-text">协议内容加载中...</text>
    </view>
    <view v-else-if="error" class="error-container">
      <text class="error-text">{{ error }}</text>
      <button class="retry-button" @click="loadAgreementContent">重新加载</button>
    </view>
    <scroll-view v-else scroll-y class="content-scroll">
      <view class="agreement-content">
        <rich-text :nodes="htmlContent" class="rich-text-content"></rich-text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      title: '',
      contentUrl: '',
      htmlContent: '',
      loading: true,
      error: ''
    }
  },
  onLoad(options) {
    console.log('[agreement] 接收到的参数:', options)
    
    // 解码标题参数
    let titleParam = options.title || ''
    try {
      if (titleParam && titleParam.includes('%')) {
        this.title = decodeURIComponent(titleParam)
      } else {
        this.title = titleParam || '协议详情'
      }
    } catch (e) {
      console.error('[agreement] 标题解码失败:', e)
      this.title = titleParam || '协议详情'
    }
    
    // 解码URL参数
    let urlParam = options.url || ''
    try {
      if (urlParam && (urlParam.includes('%25') || urlParam.includes('%3A%2F%2F'))) {
        console.log('[agreement] 检测到双重编码，进行二次解码')
        this.contentUrl = decodeURIComponent(decodeURIComponent(urlParam))
      } else if (urlParam && urlParam.includes('%')) {
        console.log('[agreement] 检测到单次编码，进行一次解码')
        this.contentUrl = decodeURIComponent(urlParam)
      } else {
        this.contentUrl = urlParam
      }
    } catch (e) {
      console.error('[agreement] URL解码失败:', e)
      this.contentUrl = urlParam
    }
    
    console.log('[agreement] 解码后标题:', this.title)
    console.log('[agreement] 最终URL:', this.contentUrl)
    
    uni.setNavigationBarTitle({ title: this.title })
    if (this.contentUrl) {
      this.loadAgreementContent()
    } else {
      this.error = '未提供协议链接'
      this.loading = false
    }
  },
  methods: {
    async loadAgreementContent() {
      this.loading = true
      this.error = ''
      try {
        console.log('[agreement] 开始请求:', this.contentUrl)
        const response = await uni.request({
          url: this.contentUrl,
          method: 'GET',
          header: {
            'Accept': 'text/plain, text/markdown, */*'
          }
        })
        console.log('[agreement] 请求状态:', response.statusCode)
        if (response.statusCode === 200 && response.data) {
          this.htmlContent = this.markdownToHtml(response.data)
          console.log('[agreement] 内容转换成功')
        } else {
          throw new Error('请求失败')
        }
      } catch (err) {
        console.error('[agreement] 加载失败:', err)
        this.error = '协议内容加载失败，请检查网络连接'
      } finally {
        this.loading = false
      }
    },
    markdownToHtml(markdown) {
      let html = markdown.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^### (.+)$/gm, '<h3>$1</h3>')
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      const lines = html.split('\n')
      const processedLines = []
      let inList = false
      for (let line of lines) {
        const listMatch = line.match(/^[-*]\s+(.+)$/)
        if (listMatch) {
          if (!inList) {
            processedLines.push('<ul>')
            inList = true
          }
          processedLines.push('<li>' + listMatch[1] + '</li>')
        } else {
          if (inList) {
            processedLines.push('</ul>')
            inList = false
          }
          if (line.trim()) {
            processedLines.push('<p>' + line + '</p>')
          }
        }
      }
      if (inList) {
        processedLines.push('</ul>')
      }
      html = processedLines.join('\n').replace(/\n\n/g, '</p><p>').replace(/<p>\s*<\/p>/g, '')
      return html
    }
  }
}
</script>

<style lang="scss" scoped>
.agreement-container { min-height: 100vh; background: #fff; }
.loading-container, .error-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400rpx; padding: 32rpx; }
.loading-text, .error-text { font-size: 30rpx; color: #666; text-align: center; margin-bottom: 32rpx; }
.retry-button { background: #8CD0FC; color: #fff; border: none; border-radius: 16rpx; padding: 20rpx 40rpx; font-size: 28rpx; }
.content-scroll { height: 100vh; }
.agreement-content { padding: 32rpx; }
.rich-text-content { font-size: 30rpx; line-height: 1.8; color: #333; }
</style>
