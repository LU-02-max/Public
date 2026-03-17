/**
 * config/env.js
 * 环境配置文件
 * 根据开发/生产环境自动切换配置
 */

import { DEV_MODE } from './dev.js'

/**
 * 环境配置
 */
const envConfig = {
	// 基础 URL（包含 /api 后缀）
	BASE_URL: DEV_MODE
		? 'http://39.106.56.81:8082/api' // 开发环境地址
		: 'http://39.106.56.81:8082/api', // 生产环境地址

	// 开发模式
	DEV_MODE,

	// 是否启用日志（独立开关，方便调试）
	ENABLE_LOG: true, // 暂时开启日志以调试问题

}

export default envConfig
