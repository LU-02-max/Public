/**
 * utils/cleanup-helper.js
 * 用户友好的数据清理工具
 */

import { TEST_PHONE } from '@/config/dev.js'

/**
 * 清理选项枚举
 */
export const CleanupOptions = {
    NONE: 'none',                    // 不清理
    TEST_DATA_ONLY: 'test-data',    // 仅清理测试数据
    USER_DATA: 'user-data',          // 清理用户数据
    ALL_DATA: 'all-data'            // 清理所有数据
}

/**
 * 分析当前存储状态
 */
export function analyzeStorageState() {
    try {
        const userProfile = uni.getStorageSync('user_profile')

        if (!userProfile) {
            return {
                hasData: false,
                isTestData: false,
                isRealData: false,
                summary: '无用户数据'
            }
        }

        let parsedUser
        try {
            parsedUser = typeof userProfile === 'string' ? JSON.parse(userProfile) : userProfile
        } catch (e) {
            return {
                hasData: true,
                isTestData: false,
                isRealData: false,
                summary: '数据格式异常'
            }
        }

        const isTestData = (
            parsedUser.phone === TEST_PHONE ||
            parsedUser.username === '开发调试模式' ||
            parsedUser.childNickname === '小可爱' ||
            (parsedUser.phone && parsedUser.phone.startsWith('199'))
        )

        const summary = isTestData ? '检测到测试数据' : '检测到真实用户数据'

        return {
            hasData: true,
            isTestData,
            isRealData: !isTestData,
            user: parsedUser,
            summary
        }
    } catch (e) {
        return {
            hasData: false,
            isTestData: false,
            isRealData: false,
            summary: '分析失败: ' + e.message
        }
    }
}

/**
 * 执行清理操作
 */
export function performCleanup(option = CleanupOptions.NONE) {
    console.log(`🧹 [CleanupHelper] 执行清理操作: ${option}`)
    
    switch (option) {
        case CleanupOptions.NONE:
            console.log('ℹ️ 不执行任何清理操作')
            return true
            
        case CleanupOptions.TEST_DATA_ONLY:
            return cleanupTestDataOnly()
            
        case CleanupOptions.USER_DATA:
            return cleanupUserData()
            
        case CleanupOptions.ALL_DATA:
            return cleanupAllData()
            
        default:
            console.error('❌ 未知的清理选项:', option)
            return false
    }
}

/**
 * 仅清理测试数据
 */
function cleanupTestDataOnly() {
    try {
        const analysis = analyzeStorageState()

        if (!analysis.hasData) {
            console.log('ℹ️ 无数据需要清理')
            return true
        }

        if (!analysis.isTestData) {
            console.log('⚠️ 检测到真实用户数据，拒绝清理测试数据')
            return false
        }

        // 仅清理测试数据
        uni.removeStorageSync('user_profile')
        console.log('✅ 测试数据清理完成')
        return true
    } catch (e) {
        console.error('❌ 清理测试数据失败:', e)
        return false
    }
}

/**
 * 清理用户数据
 */
function cleanupUserData() {
    try {
        const keysToRemove = [
            'user_profile',
            'profile_gender',
            'profile_birthday',
            'profile_nickname',
            'profile_phone',
            'profile_device_id',
            'is_logged_in',
            'profile_device_bound',
            'profileCompleted',
            'profileisFirst'
        ]

        keysToRemove.forEach(key => {
            uni.removeStorageSync(key)
        })

        console.log('✅ 用户数据清理完成')
        return true
    } catch (e) {
        console.error('❌ 清理用户数据失败:', e)
        return false
    }
}

/**
 * 清理所有数据
 */
function cleanupAllData() {
    try {
        uni.clearStorageSync()
        console.log('✅ 所有数据清理完成')
        return true
    } catch (e) {
        console.error('❌ 清理所有数据失败:', e)
        return false
    }
}

/**
 * 显示清理控制台帮助信息
 */
export function showCleanupHelp() {
    console.log(`
🧹 ===== 数据清理工具帮助 =====

当前状态分析:`)
    
    const analysis = analyzeStorageState()
    console.log(`- 有数据: ${analysis.hasData}`)
    console.log(`- 是测试数据: ${analysis.isTestData}`)
    console.log(`- 是真实数据: ${analysis.isRealData}`)
    console.log(`- 摘要: ${analysis.summary}`)
    
    console.log(`
清理选项:
- CleanupOptions.NONE: 不清理
- CleanupOptions.TEST_DATA_ONLY: 仅清理测试数据
- CleanupOptions.USER_DATA: 清理用户数据
- CleanupOptions.ALL_DATA: 清理所有数据

使用方法:
import { performCleanup, CleanupOptions } from '@/utils/cleanup-helper.js'
performCleanup(CleanupOptions.TEST_DATA_ONLY)
===============================`)
}

// 在开发环境自动显示帮助信息
if (typeof console !== 'undefined') {
    setTimeout(() => {
        console.log('💡 提示: 调用 showCleanupHelp() 查看数据清理工具帮助')
    }, 2000)
}