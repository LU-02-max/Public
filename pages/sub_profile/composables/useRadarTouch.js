// useRadarTouch.js
export function useRadarTouch(canvasPxSize, dataCount) {
	const radiusScale = 0.72;      // 缩减半径比例，给末端标签留位置
	const innerRadiusRatio = 0.15; 
	
	const centerX = canvasPxSize / 2;
	const centerY = canvasPxSize / 2;
	const maxR = (canvasPxSize / 2) * radiusScale;
	const innerR = maxR * innerRadiusRatio;
	const activeR = maxR - innerR;

	const calculateUpdate = (touchX, touchY) => {
		const dx = touchX - centerX;
		const dy = touchY - centerY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// 计算点击角度
		let angle = Math.atan2(dy, dx);
		if (angle < 0) angle += 2 * Math.PI;

		const startAngle = -Math.PI / 2;
		const angleStep = (2 * Math.PI) / dataCount;
		
		// 寻找最接近的维度索引
		let relativeAngle = (angle - startAngle + 2 * Math.PI) % (2 * Math.PI);
		const closestIndex = Math.round(relativeAngle / angleStep) % dataCount;

		// 计算距离比例映射为 0-1
		let val = 0;
		if (distance > innerR) {
			val = (distance - innerR) / activeR;
		}
		const finalVal = Math.max(0, Math.min(1, val));

		console.log(`RadarTouch: 索引 ${closestIndex}, 原始值 ${finalVal}`);

		return {
			index: closestIndex,
			value: finalVal,
			coord: { x: touchX, y: touchY }
		};
	};

	return { calculateUpdate, centerX, centerY, maxR, innerR, activeR };
}