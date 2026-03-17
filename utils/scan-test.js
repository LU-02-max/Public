/**
 * utils/scan-test.js
 * 扫码功能测试工具
 */

/**
 * 生成测试二维码数据
 */
export function generateTestQRData() {
    const testCases = [
        {
            type: '标准SN号',
            data: 'SN:ABC123456789',
            description: '标准SN格式'
        },
        {
            type: '设备序列号',
            data: '设备序列号:XYZ987654321',
            description: '中文标识格式'
        },
        {
            type: '纯数字SN',
            data: '202412345678901',
            description: '纯数字序列号'
        },
        {
            type: '混合格式',
            data: 'ID:DEV-2024-A1B2C3',
            description: 'ID标识格式'
        },
        {
            type: 'URL格式',
            data: 'https://device.example.com/setup?sn=ABC123XYZ789',
            description: 'URL中的SN号'
        },
        {
            type: 'JSON格式',
            data: '{"device_sn":"ABC123XYZ789","model":"KidsWatch-1.0"}',
            description: 'JSON数据格式'
        }
    ];
    
    return testCases;
}

/**
 * 测试SN号提取逻辑
 */
export function testSNExtraction() {
    const testCases = generateTestQRData();
    
    console.log('🧪 ===== SN号提取测试 =====');
    
    // 导入提取函数（在实际使用中需要从对应页面导入）
    // const extractSNFromResult = (result) => { /* 提取逻辑 */ };
    
    testCases.forEach((testCase, index) => {
        console.log(`\n测试案例 ${index + 1}: ${testCase.type}`);
        console.log(`输入数据: ${testCase.data}`);
        console.log(`描述: ${testCase.description}`);
        
        // 这里应该调用实际的提取函数进行测试
        // const extracted = extractSNFromResult(testCase.data);
        // console.log(`提取结果: ${extracted}`);
        
        console.log('---');
    });
    
    console.log('🧪 ===== 测试完成 =====');
}

/**
 * 模拟扫码成功
 */
export function simulateScanSuccess(data) {
    // 模拟uni.scanCode的成功回调
    return {
        result: data,
        scanType: 'QR_CODE',
        charSet: 'UTF-8',
        errMsg: 'scanCode:ok'
    };
}

/**
 * 模拟扫码失败
 */
export function simulateScanFailure(errorType = 'cancel') {
    const errorMap = {
        cancel: { errMsg: 'scanCode:fail cancel' },
        permission: { errMsg: 'scanCode:fail no camera permission' },
        notSupport: { errMsg: 'scanCode:fail not support' }
    };
    
    return errorMap[errorType] || errorMap.cancel;
}

/**
 * 显示扫码测试帮助
 */
export function showScanTestHelp() {
    console.log(`
📷 ===== 扫码功能测试帮助 =====

测试数据格式:
1. SN:ABC123456789     - 标准SN格式
2. 设备序列号:XYZ987654321 - 中文标识
3. 202412345678901       - 纯数字
4. ID:DEV-2024-A1B2C3     - ID格式
5. URL中的SN参数          - URL格式
6. JSON数据格式           - JSON格式

使用方法:
import { generateTestQRData, testSNExtraction } from '@/utils/scan-test.js'

// 生成测试数据
const testData = generateTestQRData();

// 测试提取逻辑
testSNExtraction();

支持的SN号格式:
- SN:xxx 或 SN：xxx
- Serial:xxx
- 设备序列号:xxx
- 设备ID:xxx
- ID:xxx
- 8位以上的字母数字组合
- 特殊格式的URL和JSON
===============================
`);
}

// 自动显示帮助信息（仅在开发环境）
setTimeout(() => {
    console.log('💡 提示: 调用 showScanTestHelp() 查看扫码测试帮助');
}, 3000);