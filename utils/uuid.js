/**
 * UUID 生成工具
 * 生成符合 UUID v4 规范的唯一标识符
 */

/**
 * 生成 UUID v4
 * @returns {String} UUID 字符串
 */
export function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0
		const v = c === 'x' ? r : (r & 0x3 | 0x8)
		return v.toString(16)
	})
}

/**
 * 生成短 ID（16位）
 * @returns {String} 短 ID 字符串
 */
export function generateShortId() {
	return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

/**
 * 生成时间戳 ID
 * @returns {String} 时间戳 ID
 */
export function generateTimestampId() {
	return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}
