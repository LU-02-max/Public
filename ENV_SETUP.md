# 环境配置说明

## 📝 修改内容

### 1. 创建了环境配置文件

- `config/env.js` - 环境配置（开发/预发布/生产）
- `config/api.js` - API路径配置

### 2. 修改了以下文件

- `utils/request.js` - 使用环境配置，支持日志开关
- `manifest.json` - 开启域名校验 (`urlCheck: true`)
- `viewmodels/home.js` - 使用环境配置的BASE_URL
- `pages/login/login.vue` - 使用配置的Logo和协议路径

---

## 🚀 上线前配置

### 步骤1: 配置生产环境域名

编辑 `config/env.js` 文件，修改生产环境配置：

```javascript
const PROD_CONFIG = {
  // 修改为您的实际生产环境HTTPS API地址
  BASE_URL: 'https://api.yourdomain.com/api',

  // 修改为您的实际资源服务器地址
  ASSETS_BASE: 'https://assets.yourdomain.com',

  URL_CHECK: true,      // 必须保持 true
  DEV_MODE: false,      // 必须保持 false
  ENABLE_LOG: false     // 生产环境关闭日志
}
```

### 步骤2: 在微信公众平台配置域名

登录 [微信公众平台](https://mp.weixin.qq.com/)，进入：开发 -> 开发管理 -> 开发设置 -> 服务器域名

**必须添加以下域名：**

1. **request 合法域名**
   - `https://api.yourdomain.com` (您的生产API域名)

2. **uploadFile 合法域名** (如需要上传文件)
   - `https://api.yourdomain.com`

3. **downloadFile 合法域名** (如需要下载文件)
   - `https://assets.yourdomain.com`

4. **web-view 域名** (如需要)
   - `https://www.yourdomain.com`

### 步骤3: 修改 manifest.json 中的 appid

确保 `manifest.json` 中的 appid 为正式版小程序的 appid：

```json
{
  "mp-weixin": {
    "appid": "wx62d6e07b76d6c068"  // 您的正式小程序 appid
  }
}
```

---

## 🧪 本地开发调试

### 开发环境

当前自动判断为开发环境，配置如下：

- `BASE_URL`: `http://39.106.56.81:8082/api`
- `urlCheck`: `false` (关闭域名校验，方便调试)
- `ENABLE_LOG`: `true` (开启日志)

### 调试方法

在微信开发者工具中：
1. 确保已关闭"不校验合法域名、web-view（业务域名）、TLS版本以及HTTPS证书"选项
2. 开发环境会自动使用 `urlCheck: false`

---

## 📦 发布流程

### 1. 开发版测试
- 上传代码到微信后台
- 设置体验版，配置测试微信号
- 测试所有功能

### 2. 预发布版本（可选）
如需预发布环境，修改 `config/env.js` 中的 `STAGING_CONFIG`

### 3. 正式版发布
1. 确保 `config/env.js` 中的 `PROD_CONFIG` 已配置正确的HTTPS域名
2. 确保微信公众平台已配置合法域名
3. 上传代码到微信后台
4. 提交审核
5. 审核通过后发布

---

## ⚠️ 重要提示

### 必须使用HTTPS
微信小程序**强制要求**生产环境使用HTTPS协议，且必须配置合法域名。

### 不要泄露代码
- 不要将 `config/env.js` 中的生产域名提交到公开仓库
- 可以考虑使用环境变量或构建时注入

### 日志管理
- 开发环境: `ENABLE_LOG: true` - 便于调试
- 生产环境: `ENABLE_LOG: false` - 减少控制台输出，提升性能

---

## 🔍 环境判断逻辑

代码会根据 `uni.getAccountInfoSync().miniProgram.envVersion` 自动判断环境：

| envVersion | 环境 | 使用配置 |
|------------|------|----------|
| release | 正式版 | `PROD_CONFIG` |
| trial | 体验版 | `STAGING_CONFIG` |
| develop | 开发版 | `DEV_CONFIG` |

---

## ❓ 常见问题

### Q: 上线后请求失败？
A: 检查以下几点：
1. 微信公众平台是否配置了合法域名
2. 域名是否为HTTPS
3. 域名是否已备案
4. 服务器是否正常响应

### Q: 体验版也用开发环境配置？
A: 代码默认体验版使用 `STAGING_CONFIG`，如需使用开发配置，可在 `config/env.js` 中修改 `getEnv()` 函数

### Q: 如何切换环境？
A: 修改 `config/env.js` 中的 `getEnv()` 函数返回值，或通过微信小程序的版本自动判断

---

## 📞 技术支持

如有问题，请查看：
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [服务器域名配置说明](https://developers.weixin.qq.com/miniprogram/dev/framework/server-ability/domain-config.html)
