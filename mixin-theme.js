/**
 * 主题 Mixin
 * 用于在组件中使用主题变量
 */
import { colors, fontSizes, fontWeights, spacing, borderRadius, shadows } from '@/theme.js'

export default {
	data() {
		return {
			// 颜色
			$colors: colors,
			$primary: colors.primary,
			$primaryLight: colors.primaryLight,
			$background: colors.background,
			$surface: colors.surface,
			$error: colors.error,
			$textPrimary: colors.textPrimary,
			$textSecondary: colors.textSecondary,
			$textWhite: colors.textWhite,

			// 字体大小
			$fontSizes: fontSizes,
			$fontWeights: fontWeights,

			// 间距
			$spacing: spacing,

			// 圆角
			$borderRadius: borderRadius,

			// 阴影
			$shadows: shadows
		}
	}
}
