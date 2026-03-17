// viewmodels/home.js
import userStore from '@/store/user.js'
import envConfig from '@/config/env.js'


/**
 * 【Model 层】首页数据模型
 * 负责定义首页需要展示的所有数据字段
 */
class HomeModel {
    constructor({
        deviceName = '话痨同桌',
        deviceId = '888881119999',
        battery = 80,         // 电量百分比
        todayMinutes = 68,    // 今日探索分钟
        todayApps = 5,        // 使用应用数
        todayQuestions = 12,  // 互动提问数
        talent = '加载中...',  // AI 天赋分析文本
        isSOS = false,        // 是否处于紧急状态
    } = {}) {
        this.deviceName = deviceName
        this.deviceId = deviceId
        this.battery = battery
        this.todayMinutes = todayMinutes
        this.todayApps = todayApps
        this.todayQuestions = todayQuestions
        this.talent = talent
        this.isSOS = isSOS
    }

    /**
     *  逻辑：不可变数据模式，通过产生新对象来通知 Vue 更新 UI
     */
    copyWith(config = {}) {
        return Object.assign(new HomeModel(), this, config)
    }
}

/**
 * 【ViewModel 层】首页业务逻辑控制中心
 * 负责：调用接口、处理用户登录状态变化、通知 UI 刷新
 */
class HomeViewModel {
    constructor() {
        console.log(' [HomeVM] 构造函数初始化...');
        this.state = new HomeModel()
        this._listeners = []   // UI 监听队列
        this._isFetching = false // 请求防抖锁
        this._currentPhone = null // 当前登录手机号
        this._lastTalentData = null // 缓存的天赋数据
        this._talentVersion = 0 // 天赋数据版本号
        this._lastTalentRefreshTime = 0 // 上次刷新天赋数据的时间戳

        // 1. 监听全局用户状态（如：手机号、登录状态）
        this._setupUserSubscription()

        // 2. 如果初始化时已经登录，直接获取数据
        if (userStore.user?.phone) {
            console.log(` [HomeVM] 初始已登录 [${userStore.user.phone}]，立即查询天赋`);
            this._currentPhone = userStore.user.phone
            this._initializeTalent()
        }
    }
    
    /**
     *  逻辑：订阅全局 UserStore
     * 当用户登录、登出或修改资料时，VM 会自动做出反应
     */
    _setupUserSubscription() {
        userStore.subscribe((user) => {
            const phone = user?.phone
            if (phone && !this._isFetching) {
                // 检查是否是新的手机号（用户切换）
                if (phone !== this._currentPhone) {
                    console.log(` [HomeVM] 检测到用户切换 [${this._currentPhone} -> ${phone}]，重新获取天赋数据`);
                    this._currentPhone = phone
                    this._lastTalentData = null // 清空缓存
                    this._talentVersion = 0 // 重置版本号
                    this._initializeTalent()
                } else {
                    console.log(' [HomeVM] 用户状态未变化，跳过天赋数据请求');
                }
            } else if (!phone) {
                console.log(' [HomeVM] 用户已注销，重置天赋描述');
                this._currentPhone = null
                this._lastTalentData = null
                this._talentVersion = 0
                this.state = this.state.copyWith({ talent: '等待宝贝展现更多光芒...' })
                this._notify()
            }
        })
    }
    
    /**
     *  逻辑：提供给 Vue 页面订阅数据变化的方法
     */
    listen(listener) {
        this._listeners.push(listener)
        listener(this.state)
        return () => {
            this._listeners = this._listeners.filter(l => l !== listener)
        }
    }
    
    /**
     *  逻辑：广播通知，让所有绑定了 homeState 的 UI 组件刷新
     */
    _notify() {
        console.log(' [HomeVM] 数据发生变化，正在驱动页面更新');
        this._listeners.forEach(listener => listener(this.state))
    }
    
    /**
     *  逻辑：获取手机号并触发网络请求
     */
    _initializeTalent() {
        const phone = userStore.user?.phone
        if (phone) {
            this.getTalent(phone)
        }
    }
    
    /**
     * 【网络请求】从服务器获取 AI 天赋分析
     * @param {String} phone 用户手机号
     * @param {Boolean} forceRefresh 是否强制刷新（忽略缓存）
     */
    getTalent(phone, forceRefresh = false) {
        if (this._isFetching) return; // 避免重复请求
        
        // 检查是否有缓存数据，除非强制刷新
        if (!forceRefresh && this._lastTalentData && this._currentPhone === phone) {
            console.log(' [HomeVM] 使用缓存的天赋数据，跳过网络请求');
            return;
        }
        
        this._isFetching = true;
        const apiUrl = `${envConfig.BASE_URL}/parent/${phone}/talent-analysis`;

        console.log(` [HomeVM] >>> 开始请求 AI 天赋接口: ${apiUrl}`);

        uni.request({
            url: apiUrl,
            method: 'GET',
            timeout: 10000,
            success: (res) => {
                console.log(' [HomeVM] <<< 接口原始返回:', res.data);
                
                if (res.statusCode === 200) {
                    let talentText = '宝贝还在学习中，积累提问后将生成分析';
                    const data = res.data;

                    //  逻辑：兼容多种数据返回格式（纯文本、对象、消息体）
                    if (typeof data === 'string' && data.trim()) {
                        talentText = data;
                    } else if (data && data.analysisText) {
                        talentText = data.analysisText;
                    } else if (data && data.message) {
                        talentText = data.message;
                    }

                    // 缓存天赋数据
                    this._lastTalentData = talentText;
                    this._talentVersion++;
                    
                    this.state = this.state.copyWith({ talent: talentText });
                    console.log(` [HomeVM] 天赋数据已缓存，版本: ${this._talentVersion}`);
                } else {
                    console.warn(`⚠️ [HomeVM] 服务器响应但不成功: ${res.statusCode}`);
                    this.state = this.state.copyWith({ talent: '别小看那些看似天马行空的问题，那是创造力萌芽的声响。守护好这片土壤，未来终将收获惊喜的芬芳。' });
                }
            },
            fail: (err) => {
                console.error('❌ [HomeVM] 网络层错误:', err);
                this.state = this.state.copyWith({ talent: '天赋获取失败，请检查网络连接' });
            },
            complete: () => {
                this._isFetching = false;
                this._notify(); // 最终刷新 UI
                console.log(' [HomeVM] 天赋加载流程结束');
            }
        });
    }

    /**
     * 【业务方法】强制刷新天赋数据（带频次限制）
     * 用于用户主动要求更新数据时调用
     * 频次限制: 最少间隔 5 分钟才能再次刷新
     */
    forceRefreshTalent() {
        if (!this._currentPhone) {
            console.warn('⚠️ [HomeVM] 未登录,无法刷新天赋数据');
            return;
        }

        const now = Date.now();
        const MIN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 分钟间隔

        // 检查是否在刷新间隔期内
        if (this._lastTalentRefreshTime && now - this._lastTalentRefreshTime < MIN_REFRESH_INTERVAL) {
            const remainingSeconds = Math.ceil((MIN_REFRESH_INTERVAL - (now - this._lastTalentRefreshTime)) / 1000);
            console.log(`⏰ [HomeVM] 刷新过于频繁,请等待 ${remainingSeconds} 秒后再试`);
            return;
        }

        console.log(' [HomeVM] 强制刷新天赋数据');
        this._lastTalentRefreshTime = now;
        this.getTalent(this._currentPhone, true);
    }

    /**
     * 【业务方法】手动刷新看板数据
     *  逻辑：在真实接口未对接前，模拟数据的动态增长
     */
    refreshData() {
        console.log(' [HomeVM] 执行看板数据刷新...');
        this.state = this.state.copyWith({
            // 模拟电量缓慢下降
            battery: Math.max(0, this.state.battery - (Math.random() > 0.8 ? 1 : 0)),
            // 模拟探索时长缓慢增加
            todayMinutes: this.state.todayMinutes + Math.floor(Math.random() * 2),
            todayQuestions: this.state.todayQuestions + (Math.random() > 0.9 ? 1 : 0)
        })
        this._notify()
    }
    
    /**
     * 【业务方法】设置/取消 SOS 状态
     */
    setSOS(isSOS) {
        console.log(` [HomeVM] SOS 状态变更: ${isSOS}`);
        this.state = this.state.copyWith({ isSOS })
        this._notify()
    }

    /**
     * 【导航方法】处理编辑资料跳转
     */
    onEditProfileTap() {
        uni.navigateTo({ url: '/pages/sub_detail/home/family' })
    }
}

//  单例模式导出：保证整个 App 运行期间只有一个首页数据源
const homeViewModel = new HomeViewModel()
export default homeViewModel