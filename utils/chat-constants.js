// utils/chat-constants.js:

// 注意：这里每一个变量和函数前面都必须有 export 关键字

export const CHAT_NAME_MAP = {
  'cam-context': '泛聊',
  'math-context': '理科直觉',
  'fac-context': '析辨明思',
  'mcec-context': '多维立体沟通',
  'cse-context': '新社交达人',
  'eac-context-2': '纵向创新破题',
  'eac-context-1': '横向创新执行',
  'emp-context': '万物有情',
  'kc-context-2': '指物而谈的汉语机锋',
  'kc-context-1': '即景起兴的英语辞令',
  'yg-context-2': '中文书面语感',
  'yg-context-1': '英文书面语感',
  'mus-context': '视界即音阶',
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
  'mus-context-K2': '视界即音阶',
  'touch': '触觉'
}

export const CHAT_IMAGE_MAP = {
  'cam-context': 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/chat1.png',
  'math-context': 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-01.png',
  'fac-context': 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-02.png',
  'mcec-context': 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-03.png',
  'cse-context': 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-04.png',
  'eac-context-2': 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-05.png',
  'eac-context-1': 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-06.png',
  'emp-context': 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-07.png',
  'kc-context-2': 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-08.png',
  'kc-context-1': 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-09.png',
  'yg-context-2': 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-10.png',
  'yg-context-1': 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-11.png',
  'mus-context': 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-12.png',
  'touch': 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/相机-13.png'
}

// 必须确保函数名是 getDisplayName
export function getDisplayName(targetId) {
  if (!targetId) return '未知';
  return CHAT_NAME_MAP[targetId] || targetId;
}

// 必须确保函数名是 getAIImage
export function getAIImage(targetId) {
  const cleanId = targetId ? targetId.replace('-K2', '') : '';
  return CHAT_IMAGE_MAP[targetId] || CHAT_IMAGE_MAP[cleanId] || 'https://lqwy-test.oss-cn-shanghai.aliyuncs.com/uniapp_jzd_image1/chat.png';
}
