/**
 * 用户模型
 */

// 默认头像路径（替换为阿里云OSS的HTTPS链接）
const DEFAULT_AVATAR = 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/default-avatar.png'

// 计算年龄
function calcAge(birthday) {
	if (!birthday) return null
	const now = new Date()
	let age = now.getFullYear() - birthday.getFullYear()
	const monthDiff = now.getMonth() - birthday.getMonth()
	if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthday.getDate())) {
		age--
	}
	return age
}

// 用户类
export class UserModel {
	constructor({
		isLoggedIn = false,
		username = '',
		parentId = null,
		deviceId = '',
		deviceBound = false,
		avatarPath = DEFAULT_AVATAR,
		phone = '',
		gender = '',
		birthday = null,
		relation = '',
		age = null,
		profileCompleted = false,
		isFirst = false
	} = {}) {
		this.isLoggedIn = isLoggedIn
		this.username = username
		this.parentId = parentId
		this.deviceId = deviceId
		this.deviceBound = deviceBound
		this.avatarPath = avatarPath
		this.phone = phone
		this.gender = gender
		this.birthday = birthday
		this.relation = relation
		this.age = age || calcAge(birthday)
		this.profileCompleted = profileCompleted
		this.isFirst = isFirst
	}

	// 复制并更新部分字段
	copyWith({
		isLoggedIn,
		username,
		parentId,
		deviceId,
		deviceBound,
		avatarPath,
		phone,
		gender,
		birthday,
		age,
		relation,
		profileCompleted,
		isFirst
	} = {}) {
		const newBirthday = birthday !== undefined ? birthday : this.birthday
		return new UserModel({
			isLoggedIn: isLoggedIn !== undefined ? isLoggedIn : this.isLoggedIn,
			username: username !== undefined ? username : this.username,
			parentId: parentId !== undefined ? parentId : this.parentId,
			deviceId: deviceId !== undefined ? deviceId : this.deviceId,
			deviceBound: deviceBound !== undefined ? deviceBound : this.deviceBound,
			avatarPath: avatarPath !== undefined ? avatarPath : this.avatarPath,
			phone: phone !== undefined ? phone : this.phone,
			gender: gender !== undefined ? gender : this.gender,
			birthday: newBirthday,
			age: age !== undefined ? age : calcAge(newBirthday),
			relation: relation !== undefined ? relation : this.relation,
			profileCompleted: profileCompleted !== undefined ? profileCompleted : this.profileCompleted,
			isFirst: isFirst !== undefined ? isFirst : this.isFirst
		})
	}

	// 转换为 Profile 格式
	toProfile() {
		return {
			username: this.username || '',
			gender: this.gender || '',
			birthday: this.birthday,
			age: this.age || 0,
			relation: this.relation || ''
		}
	}

	// 从 Profile 更新
	updateFromProfile(profile) {
		return this.copyWith({
			username: profile.username,
			gender: profile.gender,
			birthday: profile.birthday,
			age: profile.age,
			relation: profile.relation
		})
	}

	// 转换为 JSON
	toJSON() {
		return {
			isLoggedIn: this.isLoggedIn,
			username: this.username,
			parentId: this.parentId,
			deviceId: this.deviceId,
			deviceBound: this.deviceBound,
			avatarPath: this.avatarPath,
			phone: this.phone,
			gender: this.gender,
			birthday: this.birthday ? this.birthday.getTime() : null,
			age: this.age,
			relation: this.relation,
			profileCompleted: this.profileCompleted,
			isFirst: this.isFirst
		}
	}

	// 从 JSON 创建
	static fromJSON(json) {
		if (!json) return new UserModel()
		return new UserModel({
			isLoggedIn: json.isLoggedIn || false,
			username: json.username || '',
			parentId: json.parentId,
			deviceId: json.deviceId || '',
			deviceBound: json.deviceBound || false,
			avatarPath: json.avatarPath || DEFAULT_AVATAR,
			phone: json.phone || '',
			gender: json.gender || '',
			birthday: json.birthday ? new Date(json.birthday) : null,
			age: json.age,
			relation: json.relation || '',
			profileCompleted: json.profileCompleted || false,
			isFirst: json.isFirst || false
		})
	}
}

// 默认空用户
export function createEmptyUser() {
	return new UserModel()
}
