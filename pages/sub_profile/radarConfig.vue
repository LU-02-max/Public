<template>
	<view class="page-container">
		<view class="status-bar"></view>
		
		<scroll-view scroll-y="true" class="scroll-body">
			<view class="content">
				<view class="canvas-box">
					<canvas 
						canvas-id="radarCanvas" 
						class="radar-canvas"
						:style="{ width: cSize + 'px', height: cSize + 'px' }"
						@touchstart="handleTouch"
						@touchmove="handleTouch"
						@touchend="handleTouchEnd"
					></canvas>
					
					<view v-if="isDragging" class="drag-bubble" 
						:style="{ left: bubble.x + 'px', top: (bubble.y - 45) + 'px' }">
						<text class="b-txt">{{ features[activeIndex]?.displayName }}</text>
						<text class="b-num">{{ getPercent(features[activeIndex]?.weight) }}%</text>
						<view class="b-arrow"></view>
					</view>
				</view>

				<view class="info-card">
					<view v-if="!hasInteracted" class="guide-content animate-in">
						<view class="guide-header">
							<view class="flutter-icon">
								<view class="icon-circle"></view>
								<view class="icon-pointer"></view>
							</view>
							<text class="guide-title">如何自定义能力？</text>
						</view>
						<view class="guide-body">
							<text class="guide-txt">• 点击雷达图上的小圆点：直接调整各项能力的原始权重。</text>
							<text class="guide-txt">• 点击能力标签：查看该项能力的深度培养目标与科学原理。</text>
						</view>
					</view>
					
					<view v-else class="feature-detail animate-in">
						<view class="detail-header">
							<view class="title-group">
								<text class="main-title">{{ features[activeIndex]?.displayName }}</text>
								<text class="sub-title">{{ features[activeIndex]?.subTitle }}</text>
							</view>
							<text class="percent-val">{{ getPercent(features[activeIndex]?.weight) }}%</text>
						</view>
						<text class="desc-text">{{ features[activeIndex]?.description }}</text>
					</view>
				</view>

				<view class="warm-note">
					<view class="note-header">
						<text class="note-icon">💡</text>
						<text class="note-title">给家长的特别说明：</text>
					</view>
					<text class="note-body">这10种高级能力，一起支撑起了人身为人的精华——“远迁移”，学了一处、却受用万处、在截然不同的领域、复杂且不可预测的情境中应用，从而具备驾驭AI的根本性异能。</text>
				</view>

				<view class="safe-bottom"></view>
			</view>
		</scroll-view>

		<view class="action-bar">
			<button class="save-btn" :loading="isSaving" @click="handleSync">确认同步配置</button>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
// 修正后的路径引用
import { useFeatureViewModel } from './composables/useFeatureViewModel.js';
import { useRadarTouch } from './composables/useRadarTouch.js';

const { features, isSaving, activeIndex, hasInteracted, loadData, saveData, getPercent } = useFeatureViewModel();

const cSize = ref(350);
const isDragging = ref(false);
const bubble = reactive({ x: 0, y: 0 });

let ctx = null;
let touchHelper = null;

const initChart = () => {
	const sys = uni.getSystemInfoSync();
	const size = sys.windowWidth * 0.86; // 恢复 0.86
	cSize.value = size;
	touchHelper = useRadarTouch(size, 10); // 改为10
};

const drawRadar = () => {
	if (!ctx) return;
	const { centerX, centerY, maxR, innerR, activeR } = touchHelper;
	const count = features.value.length;
	const angleStep = (2 * Math.PI) / count;
	const startAngle = -Math.PI / 2;

	ctx.clearRect(0, 0, cSize.value, cSize.value);

	// 网格绘制：恢复原样 (4层)
	ctx.setStrokeStyle('rgba(180, 180, 180, 0.5)');
	ctx.setLineWidth(1);
	for (let j = 1; j <= 4; j++) {
		ctx.beginPath();
		const r = innerR + activeR * (j / 4);
		for (let i = 0; i < count; i++) {
			const x = centerX + r * Math.cos(startAngle + i * angleStep);
			const y = centerY + r * Math.sin(startAngle + i * angleStep);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.closePath(); 
		ctx.stroke();
		
		if(j === 4) { // 轴线
			for (let i = 0; i < count; i++) {
				ctx.beginPath();
				ctx.moveTo(centerX, centerY);
				ctx.lineTo(centerX + maxR * Math.cos(startAngle + i * angleStep), centerY + maxR * Math.sin(startAngle + i * angleStep));
				ctx.stroke();
			}
		}
	}

	// 数据层：恢复原样
	ctx.beginPath();
	features.value.forEach((f, i) => {
		const r = innerR + activeR * (f.weight / 100);
		const x = centerX + r * Math.cos(startAngle + i * angleStep);
		const y = centerY + r * Math.sin(startAngle + i * angleStep);
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	});
	ctx.closePath(); 
	ctx.setFillStyle('rgba(79, 172, 254, 0.2)');
	ctx.fill();
	ctx.setStrokeStyle('#4facfe');
	ctx.setLineWidth(3);
	ctx.stroke();

	// 标签绘制：恢复原样逻辑
	ctx.setFontSize(10);
	ctx.setFillStyle('#666');
	features.value.forEach((f, i) => {
		const r = maxR + 15; 
		const angle = startAngle + i * angleStep;
		const x = centerX + r * Math.cos(angle);
		const y = centerY + r * Math.sin(angle);
		
		let align = 'center';
		const cosVal = Math.cos(angle);
		if (cosVal > 0.2) align = 'left';
		else if (cosVal < -0.2) align = 'right';
		ctx.setTextAlign(align);

		const text = f.displayName;
		if (text.length > 4) {
			const mid = Math.ceil(text.length / 2);
			ctx.fillText(text.substring(0, mid), x, y - 4);
			ctx.fillText(text.substring(mid), x, y + 10);
		} else {
			ctx.fillText(text, x, y + 4);
		}
	});

	// 圆点：恢复原样
	features.value.forEach((f, i) => {
		const r = innerR + activeR * (f.weight / 100);
		const x = centerX + r * Math.cos(startAngle + i * angleStep);
		const y = centerY + r * Math.sin(startAngle + i * angleStep);
		ctx.beginPath();
		ctx.arc(x, y, i === activeIndex.value ? 7 : 4, 0, 2 * Math.PI);
		ctx.setFillStyle(i === activeIndex.value ? '#4facfe' : '#fff');
		ctx.setStrokeStyle('#4facfe');
		ctx.setLineWidth(2);
		ctx.fill();
		ctx.stroke();
	});

	ctx.draw();
};

const handleTouch = (e) => {
	const t = e.touches[0];
	const res = touchHelper.calculateUpdate(t.x, t.y);
	hasInteracted.value = true;
	isDragging.value = true;
	activeIndex.value = res.index;
	features.value[res.index].weight = res.value * 100;
	bubble.x = t.x;
	bubble.y = t.y;
	drawRadar();
};

const handleTouchEnd = () => {
	isDragging.value = false;
	drawRadar();
};

const handleSync = async () => {
    const hasValue = features.value.some(f => Number(f.weight) > 0);
    if (!hasValue) {
        uni.showModal({
            title: '提示',
            content: '请至少为一项能力设置数值，不能全为零哦。',
            showCancel: false,
            confirmColor: '#4facfe'
        });
        return;
    }
    uni.showLoading({ title: '配置同步中...' });
    const ok = await saveData();
    uni.hideLoading();
    if (ok) {
        uni.showToast({ title: '配置已更新', icon: 'success' });
    }
};

onMounted(async () => {
	initChart();
	ctx = uni.createCanvasContext('radarCanvas');
	await loadData();
	drawRadar();
});
</script>

<style scoped>
/* 完全恢复最初提供的 CSS 样式 */
.page-container { height: 100vh; background: #fff; display: flex; flex-direction: column; }
.status-bar { height: var(--status-bar-height); }
.scroll-body { flex: 1; height: 0; }
.content { padding-bottom: 40rpx; }
.canvas-box { position: relative; display: flex; justify-content: center; margin-top: 40rpx; padding: 0 30rpx; }
.drag-bubble {
	position: absolute; z-index: 100; pointer-events: none;
	background: rgba(0,0,0,0.8); padding: 10rpx 20rpx; border-radius: 12rpx;
	transform: translateX(-50%); display: flex; flex-direction: column; align-items: center;
}
.b-txt { color: #fff; font-size: 22rpx; }
.b-num { color: #4facfe; font-size: 20rpx; font-weight: bold; }
.b-arrow { position: absolute; bottom: -8rpx; border-left: 10rpx solid transparent; border-right: 10rpx solid transparent; border-top: 10rpx solid rgba(0,0,0,0.8); }
.info-card { margin: 20rpx 40rpx; padding: 40rpx; background: #f8fbff; border-radius: 28rpx; min-height: 240rpx; }
.guide-header { display: flex; align-items: center; margin-bottom: 24rpx; }
.guide-title { font-size: 32rpx; font-weight: bold; color: #00695C; } 
.flutter-icon { width: 40rpx; height: 40rpx; position: relative; margin-right: 16rpx; display: flex; align-items: center; justify-content: center; }
.icon-circle { width: 24rpx; height: 24rpx; border: 4rpx solid #00897B; border-radius: 50%; }
.icon-pointer { position: absolute; width: 4rpx; height: 16rpx; background: #00897B; bottom: 4rpx; right: 4rpx; transform: rotate(-45deg); }
.guide-body { display: flex; flex-direction: column; gap: 12rpx; }
.guide-txt { font-size: 26rpx; color: #555; line-height: 1.6; }
.detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20rpx; }
.main-title { font-size: 36rpx; font-weight: bold; color: #333; }
.sub-title { font-size: 22rpx; color: #4facfe; margin-top: 8rpx; display: block; }
.percent-val { font-size: 40rpx; font-weight: bold; color: #4facfe; }
.desc-text { font-size: 27rpx; color: #666; line-height: 1.8; text-align: justify; }
.warm-note { margin: 20rpx 40rpx; padding: 32rpx; background: #fffbef; border-radius: 24rpx; border: 1rpx solid #ffeaa7; }
.note-header { display: flex; align-items: center; margin-bottom: 12rpx; }
.note-icon { font-size: 32rpx; margin-right: 10rpx; }
.note-title { font-size: 28rpx; font-weight: bold; color: #d39e00; }
.note-body { font-size: 25rpx; color: #7f8c8d; line-height: 1.8; text-align: justify; display: block; }
.safe-bottom { height: 180rpx; }
.action-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 30rpx 40rpx; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); }
.save-btn { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #fff; height: 100rpx; line-height: 100rpx; border-radius: 50rpx; font-weight: bold; box-shadow: 0 8rpx 20rpx rgba(79, 172, 254, 0.3); }
.animate-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15rpx); } to { opacity: 1; transform: translateY(0); } }
</style>