<!-- pages/explore/components/ExploreMap.vue -->
<!-- 地图 -->
<template>
  <view class="explore-map">
    <view class="map-container">
      <map
        class="map-instance"
        :latitude="latitude"
        :longitude="longitude"
        :enable-satellite="false"
        :enable-rotate="false"
        :enable-3D="false"
        :enable-overlooking="false"
        :enable-scroll="true"
        :enable-zoom="true"
        :enable-traffic="true"
        :show-location="hasLocationPermission"
        :enable-poi="true"
        :scale="14"
        :enable-3D-building="false"
        @tap="handleMapTap"
        @regionchange="handleRegionChange"
        @updated="handleMapUpdate"
      ></map>
    </view>

    <view class="map-info">
      <text>{{ locationText }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import mapService from '@/services/map.js';

// --- 数据定义 ---
// 默认坐标（暂时使用中山市，会尽快更新为用户实际位置）
const latitude = ref(22.5151);
const longitude = ref(113.3824);
const hasLocationPermission = ref(false); // 位置权限状态
const locationText = ref('正在获取位置...'); // 位置信息显示文本
const userLatitude = ref(null); // 用户实际纬度
const userLongitude = ref(null); // 用户实际经度
const markers = ref([]); // 地图标记

/**
 * 逻辑函数：处理地图点击事件
 * @param {Object} event - 包含点击位置的经纬度信息
 */
const handleMapTap = (event) => {
  // 打印点击的位置，方便调试定位功能
  console.log('用户点击了地图坐标:', {
    latitude: event.detail.latitude,
    longitude: event.detail.longitude
  });
  
  // 这里可以扩展逻辑，比如点击地图后更新当前选中的位置
  // latitude.value = event.detail.latitude;
  // longitude.value = event.detail.longitude;
};

/**
 * 处理地图区域变化事件（拖动、缩放）
 * @param {Object} event - 包含区域变化信息
 */
const handleRegionChange = (event) => {
  const { type, causedBy, coordinate } = event.detail;
  console.log('地图区域变化:', {
    type, // 'begin' | 'end' | 'drag'
    causedBy, // 'gesture' | 'scale' | 'update'
    coordinate
  });
  
  // 如果是拖动结束，更新中心点坐标
  if (type === 'end') {
    latitude.value = coordinate.latitude;
    longitude.value = coordinate.longitude;
  }
};

/**
 * 处理地图更新事件
 * @param {Object} event - 地图更新事件信息
 */
const handleMapUpdate = (event) => {
  console.log('地图状态更新:', event.detail);
};

// 页面挂载时的逻辑
onMounted(() => {
  console.log('--- ExploreMap 组件已挂载 ---');
  console.log('初始地图中心点（中山市）:', latitude.value, longitude.value);
  
  // 获取用户当前位置（模糊定位）
  getCurrentLocation();
});

/**
 * 获取当前位置（支持模糊定位）
 */
const getCurrentLocation = () => {
  // 先检查位置权限
  uni.getSetting({
    success: (settingRes) => {
      console.log('完整权限设置:', settingRes.authSetting);
      const locationAuth = settingRes.authSetting['scope.userLocation'];
      console.log('位置权限状态:', locationAuth);
      
      if (locationAuth === true) {
        // 已授权，直接获取位置
        console.log('位置权限已授权，直接获取位置');
        hasLocationPermission.value = true;
        fetchLocation();
      } else if (locationAuth === false) {
        // 明确拒绝权限
        console.log('位置权限被明确拒绝');
        console.log('使用默认位置：中山市');
        hasLocationPermission.value = false;
        // 用户拒绝时使用默认位置，不再次请求
      } else {
        // undefined 或未设置，请求授权
        console.log('位置权限未设置，请求授权');
        uni.authorize({
          scope: 'scope.userLocation',
          success: () => {
            console.log('用户授权位置权限成功');
            hasLocationPermission.value = true;
            fetchLocation();
          },
          fail: (err) => {
            console.log('用户拒绝位置权限:', err);
            console.log('使用默认位置：中山市');
            hasLocationPermission.value = false;
            // 用户拒绝时使用默认位置
          }
        });
      }
    },
    fail: (err) => {
      console.log('获取设置失败:', err);
      hasLocationPermission.value = false;
      fetchLocation(); // 尝试直接获取，让系统处理权限
    }
  });
};

/**
 * 实际获取位置信息
 */
const fetchLocation = () => {
  uni.getLocation({
    type: 'wgs84',
    altitude: false,
    isHighAccuracy: false, // 模糊定位，降低精度要求
    success: (res) => {
      console.log('获取位置成功:', res);
      // 更新到用户位置
      latitude.value = res.latitude;
      longitude.value = res.longitude;
      hasLocationPermission.value = true; // 确认权限状态
      
      // 更新底部信息
      updateLocationInfo(res.latitude, res.longitude);
    },
    fail: (err) => {
      console.log('获取位置失败:', err);
      hasLocationPermission.value = false;
      // 失败时保持默认中山市位置
      console.log('使用默认位置：中山市');
    }
  });
};

/**
 * 更新位置信息显示
 * @param {Number} lat 纬度
 * @param {Number} lng 经度
 */
const updateLocationInfo = (lat, lng) => {
  // 使用高德地图逆地理编码获取地址信息
  locationText.value = '正在解析地址...';

  mapService.reverseGeocode(lng, lat).then(address => {
    locationText.value = `当前位置：${address}`;
  }).catch(err => {
    console.error('地址解析失败:', err);
    locationText.value = `当前位置：${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  });
};

/**
 * 添加用户位置标记
 * @param {Number} lat 纬度
 * @param {Number} lng 经度
 */
const addUserMarker = (lat, lng) => {
  markers.value = [{
    id: 1,
    latitude: lat,
    longitude: lng,
    iconPath: 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/default-avatar.png',
    width: 30,
    height: 30,
    rotate: 0
  }];
};

/**
 * 聚焦到用户当前位置
 */
const focusToCurrentLocation = () => {
  if (userLatitude.value && userLongitude.value) {
    console.log('聚焦到用户位置:', userLatitude.value, userLongitude.value);
    latitude.value = userLatitude.value;
    longitude.value = userLongitude.value;
    uni.showToast({
      title: '已定位到当前位置',
      icon: 'success'
    });
  } else {
    console.log('用户位置未获取，重新获取位置');
    getCurrentLocation();
  }
};
</script>

<style lang="scss" scoped>
/* 地图容器样式：控制地图的尺寸和视觉效果 */
.map-container {
  width: 100%;
  height: calc(100vh - 120rpx);       /* 近乎满屏高度，减去底部信息区域 */
  border-radius: 24rpx; /* 圆角效果 */
  overflow: hidden;    /* 必须加这个，否则地图组件会溢出圆角 */
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08); /* 淡淡的投影提升质感 */
  position: relative;

  .map-instance {
    width: 100%;
    height: calc(100vh - 120rpx); /* 明确高度，与容器保持一致 */
    display: block;
    border-radius: 24rpx; /* 地图本身也加圆角 */
    transition: all 0.3s ease; /* 添加过渡效果，提升拖动体验 */
  }

  /* 定位按钮 */
  .location-btn {
    position: absolute;
    bottom: 40rpx;
    right: 40rpx;
    width: 90rpx;
    height: 90rpx;
    background: white;
    border-radius: 50%;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;

    .location-icon {
      font-size: 40rpx;
    }

    &:active {
      transform: scale(0.95);
      background: #f5f5f5;
    }
  }
}

/* 底部辅助信息 */
.map-info {
  margin-top: 30rpx;
  font-size: 24rpx;
  color: #888;
  text-align: center;
}
</style>