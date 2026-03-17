// viewmodels/chat.js
// 聊天 ViewModel - uniapp 版本

import { getChatQuestions } from '@/api.js'
import { ChatItem, ChatGroup } from '@/models/chat.js'
import trackingService from '@/services/tracking.js'
import userStore from '@/store/user.js'
import { getAIModelImage } from '@/config/constants.js'
import { BaseViewModel } from '@/utils/base-viewmodel.js'

// 聊天状态
class ChatState {
	constructor() {
		this.isLoading = false
		this.chatGroups = []
		this.error = null
	}

	copyWith({ isLoading, chatGroups, error } = {}) {
		return Object.assign(new ChatState(), this, {
			isLoading: isLoading !== undefined ? isLoading : this.isLoading,
			chatGroups: chatGroups !== undefined ? chatGroups : this.chatGroups,
			error: error !== undefined ? error : this.error,
		})
	}
}

// 聊天 ViewModel
class ChatViewModel extends BaseViewModel {
	constructor() {
		super()
		this.state = new ChatState()
	}
	
	// 根据目标ID获取聊天组
	getGroupById(targetId) {
		try {
			return this.state.chatGroups.find(group => group.targetId === targetId)
		} catch (e) {
			return null
		}
	}
	
	// 加载聊天组列表
	async loadChatGroups(phone) {
		this.state = this.state.copyWith({ isLoading: true, error: null })
		this._notify()
		
		try {
			const response = await getChatQuestions(phone)
			
			if (response) {
				const data = Array.isArray(response) ? response : [response]
				const questions = data.map(json => ChatItem.fromJson(json))
				
				// 按 AI 模型分组
				const groups = {}
				for (const question of questions) {
					if (!groups[question.aiModel]) {
						groups[question.aiModel] = []
					}
					groups[question.aiModel].push(question)
				}
				
				// 转换为 ChatGroup
				const chatGroups = Object.entries(groups).map(([key, conversations]) => {
					// 按时间排序，最新的在前面
					conversations.sort((a, b) => b.timestamp - a.timestamp)
					
					const lastActiveTime = conversations.length > 0
						? conversations[0].timestamp
						: new Date()
					
				return new ChatGroup({
						targetId: key,
						imagePath: getAIModelImage(key),
						conversations: conversations,
						lastActiveTime: lastActiveTime,
					})
				})
				
				// 按最后活动时间排序
				chatGroups.sort((a, b) => b.lastActiveTime - a.lastActiveTime)
				
				this.state = this.state.copyWith({
					isLoading: false,
					chatGroups: chatGroups,
				})
				this.notify(this.state)
			} else {
				this.state = this.state.copyWith({
					isLoading: false,
					error: '加载对话列表失败',
				})
				this.notify(this.state)
			}
		} catch (e) {
			this.state = this.state.copyWith({
				isLoading: false,
				error: `加载失败: ${e.message || e}`,
			})
			this.notify(this.state)
		}
	}
	
	// 刷新
	async refresh() {
		const phone = userStore.phone
		
		await trackingService.trackEvent('chat_list_refresh', {
			user_id: phone,
			refresh_time: new Date().toISOString(),
		})
		
		if (phone) {
			await this.loadChatGroups(phone)
		}
	}
	
	// 点击聊天项
	async onChatItemTap(chatGroup) {
		const phone = userStore.phone
		
		// 记录埋点
		await trackingService.trackEvent('chat_item_click', {
			user_id: phone,
			target_id: chatGroup.targetId,
			display_name: chatGroup.displayName,
			click_time: new Date().toISOString(),
		})
		
		// 跳转到聊天详情页
		uni.navigateTo({
			url: `/pages/sub_detail/chat/detail?targetId=${chatGroup.targetId}&displayName=${encodeURIComponent(chatGroup.displayName)}&imagePath=${encodeURIComponent(chatGroup.imagePath)}`
		})
	}
	
	// 记录页面访问（未使用）
	async trackPageView() {
		const phone = userStore.phone
		
		await trackingService.trackPageView('chat_list_page')
		
		await trackingService.trackEvent('chat_list_view', {
			user_id: phone,
			view_time: new Date().toISOString(),
			chat_count: this.state.chatGroups.length,
		})
	}
}

// 导出单例
const chatViewModel = new ChatViewModel()
export default chatViewModel
