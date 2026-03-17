/**
 * utils/logger.js
 * 统一日志工具 - 根据环境变量控制日志输出
 */

import { DEV_MODE } from '@/config/dev.js'

/**
 * 日志级别
 */
const LOG_LEVELS = {
	DEBUG: 'debug',
	INFO: 'info',
	WARN: 'warn',
	ERROR: 'error',
}

/**
 * 日志类
 */
class Logger {
	constructor() {
		this.enabled = DEV_MODE
		this.prefix = '[App]'
	}

	/**
	 * 设置前缀
	 */
	setPrefix(prefix) {
		this.prefix = prefix
		return this
	}

	/**
	 * 调试日志 - 仅开发环境输出
	 */
	debug(...args) {
		if (this.enabled) {
			console.debug(`%c${this.prefix}`, 'color: #909399;', ...args)
		}
	}

	/**
	 * 信息日志 - 仅开发环境输出
	 */
	info(...args) {
		if (this.enabled) {
			console.info(`%c${this.prefix}`, 'color: #409eff;', ...args)
		}
	}

	/**
	 * 警告日志 - 仅开发环境输出
	 */
	warn(...args) {
		if (this.enabled) {
			console.warn(`%c${this.prefix}`, 'color: #e6a23c;', ...args)
		}
	}

	/**
	 * 错误日志 - 所有环境都输出
	 */
	error(...args) {
		console.error(`%c${this.prefix}`, 'color: #f56c6c;', ...args)
	}

	/**
	 * 创建带前缀的子 logger
	 */
	createChild(childPrefix) {
		const child = new Logger()
		child.enabled = this.enabled
		child.prefix = `${this.prefix}:${childPrefix}`
		return child
	}
}

// 创建默认实例
const logger = new Logger()

// 便捷方法
export const log = {
	debug: logger.debug.bind(logger),
	info: logger.info.bind(logger),
	warn: logger.warn.bind(logger),
	error: logger.error.bind(logger),
	createLogger: (prefix) => logger.createChild(prefix),
}

export default logger
