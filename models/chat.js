/**
 * 聊天相关数据模型
 */

// 聊天条目
export class ChatItem {
	constructor({
		aiModel = '',
		questionText = '',
		answerText = '',
		conversationId = '',
		imageUrl = '',
		timestamp = null
	} = {}) {
		this.aiModel = aiModel
		this.questionText = questionText
		this.answerText = answerText
		this.conversationId = conversationId
		this.imageUrl = imageUrl
		this.timestamp = timestamp || new Date()
	}

	toJSON() {
		return {
			aiModel: this.aiModel,
			questionText: this.questionText,
			answerText: this.answerText,
			conversationId: this.conversationId,
			imageUrl: this.imageUrl,
			timestamp: this.timestamp.getTime()
		}
	}

	static fromJSON(json) {
		if (!json) return new ChatItem()
		return new ChatItem({
			aiModel: json.aiModel || '',
			questionText: json.questionText || '',
			answerText: json.answerText || '',
			conversationId: json.conversationId || '',
			imageUrl: json.imageUrl || '',
			timestamp: json.timestamp ? new Date(json.timestamp) : new Date()
		})
	}
}

// 聊天组
export class ChatGroup {
	constructor({
		targetId = '',
		imagePath = '',
		conversations = [],
		lastActiveTime = null
	} = {}) {
		this.targetId = targetId
		this.imagePath = imagePath
		this.conversations = Array.isArray(conversations) ? conversations.map(item => {
			return item instanceof ChatItem ? item : new ChatItem(item)
		}) : []
		this.lastActiveTime = lastActiveTime || new Date()
	}

	// 显示名称
	get displayName() {
		return this.getDisplayName(this.targetId)
	}

	// 最后一条消息
	get lastMessage() {
		if (this.conversations.length === 0) {
			return '暂无对话'
		}
		const lastItem = this.conversations[this.conversations.length - 1]
		return lastItem.answerText || lastItem.questionText
	}

	// 获取显示名称（静态方法）
	static getDisplayName(targetId) {
		const nameMap = {
			'小宇': '测试数据',
			'cam-context': '泛聊',
			'math-context': '理科直觉',
			'fac-context': '析辨明思',
			'mcec-context': '多维立体沟通',
			'cse-context': '新社交达人',
			'eac-context-2': '纵向创新破题',
			'eac-context-1': '横向创新执行',
			'emp-context': '万物有情',
			'kc-context-2': '指物而谈的汉语机锋',
			'kc-context-1': '即景起兴的英语辞令',
			'yg-context-2': '中文书面语感',
			'yg-context-1': '英文书面语感',
			'mus-context': '视界即音阶',
			'cam-context-K2': '泛聊',
			'math-context-K2': '理科直觉',
			'fac-context-K2': '析辨明思',
			'mcec-context-K2': '多维立体沟通',
			'cse-context-K2': '新社交达人',
			'eac-context-2-K2': '纵向创新破题',
			'eac-context-1-K2': '横向创新执行',
			'emp-context-K2': '万物有情',
			'kc-context-2-K2': '指物而谈的汉语机锋',
			'kc-context-1-K2': '即景起兴的英语辞令',
			'yg-context-2-K2': '中文书面语感',
			'yg-context-1-K2': '英文书面语感',
			'mus-context-K2': '视界即音阶',
		}
		return nameMap[targetId] || targetId
	}

	toJSON() {
		return {
			targetId: this.targetId,
			imagePath: this.imagePath,
			conversations: this.conversations.map(item => item.toJSON()),
			lastActiveTime: this.lastActiveTime.getTime()
		}
	}

	static fromJSON(json) {
		if (!json) return new ChatGroup()
		return new ChatGroup({
			targetId: json.targetId || '',
			imagePath: json.imagePath || '',
			conversations: json.conversations || [],
			lastActiveTime: json.lastActiveTime ? new Date(json.lastActiveTime) : new Date()
		})
	}
}