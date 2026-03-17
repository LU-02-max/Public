// utils/storage.js
/**
 * 本地存储工具
 * 封装 uni.storage，提供类型安全的存取方法
 */

import { STORAGE_KEYS } from '@/config/constants.js'
import log from '@/utils/logger.js'

/**
 * 用户信息存储
 */

// 保存用户信息
export function saveUser(userInfo) {
	return new Promise((resolve, reject) => {
		try {
			uni.setStorageSync(STORAGE_KEYS.USER, JSON.stringify(userInfo))
			log.info('保存用户信息成功', userInfo)
			resolve(true)
		} catch (e) {
			log.error('保存用户信息失败', e)
			reject(e)
		}
	})
}

// 获取用户信息
export function getUser() {
	try {
		const jsonStr = uni.getStorageSync(STORAGE_KEYS.USER)
		if (jsonStr) {
			return JSON.parse(jsonStr)
		}
		return null
	} catch (e) {
		log.error('获取用户信息失败', e)
		return null
	}
}

// 移除用户信息
export function removeUser() {
	uni.removeStorageSync(STORAGE_KEYS.USER)
}

/**
 * 性别存储
 */
export function saveGender(gender) {
	uni.setStorageSync(STORAGE_KEYS.GENDER, gender)
}

export function getGender() {
	return uni.getStorageSync(STORAGE_KEYS.GENDER) || ''
}

/**
 * 生日存储
 */
export function saveBirthday(birthday) {
	// 存储时间戳
	uni.setStorageSync(STORAGE_KEYS.BIRTHDAY, birthday.getTime())
}

export function getBirthday() {
	const timestamp = uni.getStorageSync(STORAGE_KEYS.BIRTHDAY)
	if (timestamp) {
		return new Date(timestamp)
	}
	return null
}

/**
 * 昵称存储
 */
export function saveNickname(nickname) {
	uni.setStorageSync(STORAGE_KEYS.NICKNAME, nickname)
}

export function getNickname() {
	return uni.getStorageSync(STORAGE_KEYS.NICKNAME) || ''
}

/**
 * 手机号存储
 */
export function savePhone(phone) {
	uni.setStorageSync(STORAGE_KEYS.PHONE, phone)
}

export function getPhone() {
	return uni.getStorageSync(STORAGE_KEYS.PHONE) || ''
}

/**
 * 设备 ID 存储
 */
export function saveDeviceId(deviceId) {
	uni.setStorageSync(STORAGE_KEYS.DEVICE_ID, deviceId)
}

export function getDeviceId() {
	return uni.getStorageSync(STORAGE_KEYS.DEVICE_ID) || ''
}

/**
 * 登录状态
 */
export function setLogin(isLoggedIn) {
	uni.setStorageSync(STORAGE_KEYS.LOGIN, isLoggedIn)
}

export function isLoggedIn() {
	return uni.getStorageSync(STORAGE_KEYS.LOGIN) || false
}

/**
 * 设备绑定状态
 */
export function setDeviceBound(isBound) {
	uni.setStorageSync(STORAGE_KEYS.DEVICE_BOUND, isBound)
}

export function isDeviceBound() {
	return uni.getStorageSync(STORAGE_KEYS.DEVICE_BOUND) || false
}

/**
 * 资料完成状态
 */
export function setProfileCompleted(isCompleted) {
	uni.setStorageSync(STORAGE_KEYS.PROFILE_COMPLETED, isCompleted)
}

export function isProfileCompleted() {
	return uni.getStorageSync(STORAGE_KEYS.PROFILE_COMPLETED) || false
}

/**
 * 是否首次
 */
export function setIsFirst(isFirst) {
	uni.setStorageSync(STORAGE_KEYS.IS_FIRST, isFirst)
}

export function isFirst() {
	return uni.getStorageSync(STORAGE_KEYS.IS_FIRST) || false
}

/**
 * 清除所有存储数据
 */
export function clearAll() {
	try {
		uni.clearStorageSync()
		log.info('清除所有存储成功')
	} catch (e) {
		log.error('清除所有存储失败', e)
	}
}
