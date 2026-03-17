import { ref, computed } from 'vue';
import userStore from '@/store/user.js';
import { featureDescriptions } from './featureConfig.js';

export function useFeatureViewModel() {
	const baseUrl = 'http://39.106.56.81:8082/api/parent';
	const features = ref([]);
	const isSaving = ref(false);
	const activeIndex = ref(-1);
	const hasInteracted = ref(false); 

	const initDefault = () => {
		// 自动根据 config 中的 10 项进行初始化
		features.value = Object.keys(featureDescriptions).map(key => ({
			functionName: key,
			displayName: featureDescriptions[key].name,
			subTitle: featureDescriptions[key].subTitle,
			description: featureDescriptions[key].desc,
			weight: 1
		}));
		console.log('ViewModel: 10项能力初始化完成');
	};

	const totalWeight = computed(() => {
		const sum = features.value.reduce((s, i) => s + (Number(i.weight) || 0), 0);
		return sum === 0 ? 1 : sum; 
	});

	const getPercent = (weight) => {
		return ((weight / totalWeight.value) * 100).toFixed(0);
	};

	const loadData = async () => {
		const phone = userStore.user?.phone;
		initDefault();
		if (!phone || phone === 'undefined') return;

		try {
			const res = await uni.request({
				url: `${baseUrl}/${phone}/device/function-probabilities`,
				method: 'GET'
			});
			if (res.statusCode === 200 && res.data) {
				const serverData = res.data;
				features.value.forEach(item => {
					const matched = serverData.find(s => s.functionName === item.functionName);
					if (matched) item.weight = matched.probability;
				});
				console.log('ViewModel: 数据加载成功', serverData);
			}
		} catch (e) { console.error('数据加载异常', e); }
	};

	const saveData = async () => {
		const phone = userStore.user?.phone;
		if (!phone || isSaving.value) return false;

		let currentSum = 0;
		const submitData = features.value.map((item, index) => {
			let prob = Math.round((item.weight / totalWeight.value) * 100);
			// 最后一个元素补齐 100% 误差
			if (index === features.value.length - 1) {
				prob = 100 - currentSum;
			} else {
				currentSum += prob;
			}
			return { functionName: item.functionName, probability: prob };
		});

		isSaving.value = true;
		try {
			const res = await uni.request({
				url: `${baseUrl}/${phone}/device/function-probabilities`,
				method: 'PUT',
				data: submitData
			});
			console.log('ViewModel: 保存成功', submitData);
			return res.statusCode === 200 || res.statusCode === 204;
		} catch (e) { 
			console.error('ViewModel: 保存失败', e);
			return false; 
		} 
		finally { isSaving.value = false; }
	};

	return { features, isSaving, activeIndex, hasInteracted, loadData, saveData, getPercent };
}