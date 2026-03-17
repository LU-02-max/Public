/**
 * 应用主题配置
 * 对应 Flutter 的 AppTheme
 */

// 主色调
export const colors = {
	// 主要颜色
	primary: '#8CD0FC',           // 主色 (对应 primaryColor)
	primaryLight: '#B3DFFFF',      // 次要色 (对应 secondaryColor)
	background: '#F0F9FB',        // 背景色 (对应 backgroundColor)
	surface: '#FFFFFF',             // 表面色 (对应 surfaceColor)
	error: '#B00020',              // 错误色 (对应 errorColor)

	// 文本颜色
	textPrimary: '#212121',         // 主要文本
	textSecondary: '#757575',       // 次要文本
	textHint: '#9E9E9E',          // 提示文本
	textWhite: '#FFFFFF',           // 白色文本

	// 导航栏颜色
	navSelected: '#8CD0FC',         // 选中状态
	navUnselected: '#9E9E9E',      // 未选中状态

	// 边框颜色
	border: '#E0E0E0',
	borderLight: '#F5F5F5',

	// 阴影颜色
	shadow: 'rgba(0, 0, 0, 0.15)',
	shadowLight: 'rgba(0, 0, 0, 0.08)',

	// 成功/警告/信息色
	success: '#4CAF50',
	warning: '#FFC107',
	info: '#2196F3',

	// 分割线
	divider: '#E0E0E0',

	// 遮罩层
	mask: 'rgba(0, 0, 0, 0.45)'
}

// 字体大小（rpx 单位）
export const fontSizes = {
	xs: 20,      // 10px * 2
	sm: 22,      // 11px * 2
	base: 24,    // 12px * 2
	md: 26,      // 13px * 2
	lg: 28,      // 14px * 2
	xl: 30,      // 15px * 2
	2xl: 32,     // 16px * 2
	3xl: 36,     // 18px * 2
	4xl: 40,     // 20px * 2
	5xl: 48,     // 24px * 2
	6xl: 56,     // 28px * 2
	h1: 48,      // 24px * 2
	h2: 40,      // 20px * 2
	h3: 36,      // 18px * 2
	h4: 32,      // 16px * 2
	h5: 28,      // 14px * 2
	h6: 24       // 12px * 2
}

// 字重
export const fontWeights = {
	normal: 400,
	medium: 500,
	semibold: 600,
	bold: 700
}

// 间距（rpx 单位）
export const spacing = {
	xs: 4,       // 2px * 2
	sm: 8,       // 4px * 2
	md: 12,      // 6px * 2
	lg: 16,      // 8px * 2
	xl: 20,      // 10px * 2
	2xl: 24,     // 12px * 2
	3xl: 32,     // 16px * 2
	4xl: 40,     // 20px * 2
	5xl: 48,     // 24px * 2
	6xl: 64      // 32px * 2
}

// 圆角（rpx 单位）
export const borderRadius = {
	none: 0,
	sm: 4,
	md: 8,
	lg: 12,
	xl: 16,
	2xl: 20,
	3xl: 24,
	full: 9999
}

// 阴影
export const shadows = {
	sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
	md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
	lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
	xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
}

// 过渡动画
export const transitions = {
	fast: '0.15s ease-in-out',
	base: '0.3s ease-in-out',
	slow: '0.5s ease-in-out'
}

// Z-index 层级
export const zIndex = {
	base: 1,
	dropdown: 10,
	sticky: 20,
	fixed: 30,
	modal: 40,
	popover: 50,
	tooltip: 60
}

// 完整的主题配置对象
export const theme = {
	colors,
	fontSizes,
	fontWeights,
	spacing,
	borderRadius,
	shadows,
	transitions,
	zIndex
}

// 导出默认主题
export default theme
