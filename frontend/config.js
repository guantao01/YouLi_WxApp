export default {
  // Base API URL - should be configured based on environment
  baseURL: 'https://api.youli.com', // Change this to your actual API endpoint
  
  // Timeout for API requests
  timeout: 10000,
  
  // WeChat Mini Program config
  wechat: {
    appId: '', // Set in manifest.json
  },
  
  // Tencent Map config
  tencentMap: {
    key: '', // Your Tencent Map API key
  },
  
  // Auto-confirm days
  autoConfirmDays: 7,
}
