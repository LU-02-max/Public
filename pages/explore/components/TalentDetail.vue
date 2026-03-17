<!-- pages/explore/components/TalentDetail.vue -->
<!-- 孩子天赋判断 -->
<template>
  <view class="talent-detail">
    <view class="section-title">孩子天赋判断详情</view>

    <view v-if="loading" class="loading-box">数据加载中...</view>

    <view v-else-if="hasData" class="bar-grid-container">
      <view class="grid-lines">
        <view class="grid-line" v-for="n in 6" :key="n"></view>
      </view>

      <view class="bar-list">
        <view class="bar-row" v-for="item in talentList" :key="item.id">
          <view class="row-label">{{ item.name }}</view>
          
          <view class="row-content-wrapper">
            <view class="bar-track">
              <view 
                class="bar-fill" 
                :style="{ width: item.score + '%', background: '#46a1ff' }"
              ></view>
            </view>
            <text class="percent-text">{{ item.score }}%</text>
          </view>
        </view>
      </view>

      <view class="grid-labels">
        <text v-for="p in ['0%','20%','40%','60%','80%','100%']" :key="p">{{ p }}</text>
      </view>
    </view>

    <view v-else class="empty-state">
      <view class="empty-icon">
        <view class="icon-circle"></view>
        <view class="icon-star"></view>
      </view>
      <text class="empty-title">发现之旅尚未开启</text>
      <text class="empty-desc">孩子目前的探索轨迹较少，暂无法生成深度天赋分析报告。请引导孩子参与更多模块的交互体验。</text>
    </view>
    
    <view class="footer-note" v-if="!loading">* 基于各功能模块认知表现的天赋判断</view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';

const props = defineProps(['phone']);
const talentList = ref([]); 
const loading = ref(true);  

/**
 * 💡 计算属性：判断是否有有效数据
 * 逻辑：数组不为空且至少有一个分数大于 0
 */
const hasData = computed(() => {
  return talentList.value.length > 0 && talentList.value.some(item => item.score > 0);
});

/**
 * 💡 映射表逻辑：
 * 作用：将后端返回的英文标识符(ID)转换为前端显示的中文名称
 */
const NAME_MAP = {
  'math-context-K2': '理科直觉', 
  'fac-context-K2': '析辨明思', 
  'mcec-context-K2': '多维立体沟通',
  'cse-context-K2': '新社交达人', 
  'eac-context-2-K2': '纵向创新破题', 
  'eac-context-1-K2': '横向创新执行',
  'emp-context-K2': '万物有情', 
  'kc-context-2-K2': '指物而谈的汉语机锋', 
  'kc-context-1-K2': '即景起兴的英语辞令',
  'yg-context-2-K2': '中文书面语感', 
  'yg-context-1-K2': '英文书面语感', 
  'mus-context': '视界即音阶',
  'cam-context': '逻辑与观察'
};

/**
 * 💡 核心请求函数：拉取天赋分布数据
 * 逻辑：
 * 1. 验证手机号是否存在
 * 2. 拼接动态 URL (使用 ${} 语法)
 * 3. 转换后端数组为 Map，方便按映射表顺序取值
 */
const loadTalentData = () => {
  if (!props.phone) {
    console.error('❌ [天赋详情] 无法加载数据：手机号(phone)为空');
    loading.value = false;
    return;
  }

  loading.value = true;
  console.log(`📡 [天赋详情] 正在请求接口，查询手机号: ${props.phone}`);

  uni.request({
    // ✅ 关键修正：使用 ${props.phone} 动态注入变量，确保请求的是当前登录账号
    url: `http://39.106.56.81:8082/api/parent/${props.phone}/talent-distribution`,
    method: 'GET',
    success: (res) => {
      console.log('✅ [天赋详情] 接口原始数据回复:', res.data);

      if (res.statusCode === 200) {
        // 后端数据可能直接在 res.data 中，也可能在 res.data.data 中
        const rawArray = res.data.data || res.data;
        
        // 1. 数据预处理：将数组转为对象格式，提高匹配效率
        // 格式：{ "math-context-K2": 93 }
        const scoreMap = {};
        if (Array.isArray(rawArray)) {
          rawArray.forEach(item => {
            scoreMap[item.talentName] = item.abilityValue;
          });
        }

        // 2. 格式化渲染：以 NAME_MAP 为基准，保证前端显示顺序一致且名称对应
        const formattedData = Object.keys(NAME_MAP).map(key => {
          return {
            id: key,
            name: NAME_MAP[key],
            score: scoreMap[key] || 0 // 如果后端没返，默认 0 分
          };
        });

        talentList.value = formattedData;
        console.log('📊 [天赋详情] 渲染数据组装完成:', talentList.value);
      } else {
        console.error(`⚠️ [天赋详情] 接口响应异常，状态码: ${res.statusCode}`);
      }
    },
    fail: (err) => {
      console.error('❌ [天赋详情] 网络请求失败:', err);
    },
    complete: () => {
      loading.value = false;
    }
  });
};

/**
 * 💡 监听逻辑：
 * 逻辑：解决切换账号时不更新数据的核心。只要父组件传入的 phone 变化，就立即重刷接口。
 */
watch(() => props.phone, (newPhone) => {
  console.log(`🔄 [天赋详情] 监听到手机号变更: ${newPhone}，正在刷新数据...`);
  loadTalentData();
});

// 初始化加载
onMounted(() => {
  loadTalentData();
});
</script>

<style lang="scss" scoped>
/* 样式部分保持不变，已包含在之前的回复中 */
.talent-detail { padding: 30rpx; }
.section-title { font-size: 34rpx; font-weight: bold; text-align: center; margin-bottom: 50rpx; }
.loading-box { text-align: center; padding: 100rpx; color: #999; }
.empty-state {
  display: flex; flex-direction: column; align-items: center; padding: 80rpx 60rpx; background-color: #fcfdfe; border-radius: 24rpx; margin: 20rpx;
  .empty-icon {
    position: relative; width: 120rpx; height: 120rpx; margin-bottom: 40rpx;
    .icon-circle { width: 100%; height: 100%; border: 6rpx dashed #e1e9f0; border-radius: 50%; }
    .icon-star { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40rpx; height: 40rpx; background: #3a96ff; clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); opacity: 0.6; }
  }
  .empty-title { font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; }
  .empty-desc { font-size: 26rpx; color: #999; line-height: 1.6; text-align: center; }
}
.bar-grid-container {
  position: relative; padding-bottom: 80rpx;
  .grid-lines { position: absolute; left: 240rpx; right: 40rpx; top: 0; bottom: 80rpx; display: flex; justify-content: space-between; pointer-events: none;
    .grid-line { width: 1rpx; background: #ebf2f9; }
  }
  .bar-list { position: relative; z-index: 2;
    .bar-row { display: flex; align-items: center; height: 64rpx; margin-bottom: 22rpx;
      .row-label { width: 240rpx; text-align: right; font-size: 24rpx; color: #555; padding-right: 25rpx; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .row-content-wrapper { flex: 1; display: flex; align-items: center; padding-right: 8%;
        .bar-track { flex: 1; height: 26rpx; background: #f8f8f8; border-radius: 13rpx; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 0 13rpx 13rpx 0; transition: width 1s ease-out; }
        .percent-text { width: 80rpx; font-size: 24rpx; color: #888; margin-left: 15rpx; }
      }
    }
  }
  .grid-labels { position: absolute; bottom: 20rpx; left: 240rpx; right: 40rpx; padding-right: 8%; display: flex; justify-content: space-between;
    text { font-size: 20rpx; color: #bbb; transform: translateX(-50%); }
  }
}
.footer-note { font-size: 22rpx; color: #bbb; text-align: center; margin-top: 40rpx; }
</style>