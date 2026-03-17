/**
 * 临时脚本：彻底清除所有本地数据
 * 在小程序控制台中运行此脚本来清理所有存储
 */

console.log('🧹 开始清除所有本地数据...')

// 1. 清除所有已知的存储键
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
    try {
        uni.removeStorageSync(key)
        console.log(`✅ 已清除: ${key}`)
    } catch (e) {
        console.error(`❌ 清除失败 ${key}:`, e)
    }
})

// 2. 彻底清除所有存储
try {
    uni.clearStorageSync()
    console.log('✅ 已执行 uni.clearStorageSync()')
} catch (e) {
    console.error('❌ uni.clearStorageSync() 失败:', e)
}

// 3. 重置 UserStore（如果可以访问）
try {
    if (typeof userStore !== 'undefined') {
        userStore.user = userStore.resetToEmpty()
        console.log('✅ UserStore 已重置为空状态')
    }
} catch (e) {
    console.error('❌ 重置 UserStore 失败:', e)
}

console.log('🎉 清除完成！所有本地数据已被清理')
console.log('📱 建议重启小程序以确保完全生效')