import config from '../config.js'

/**
 * HTTP Request wrapper for WeChat Mini Program
 */
class Request {
  constructor() {
    this.baseURL = config.baseURL
    this.timeout = config.timeout
  }

  request(options) {
    const { url, method = 'GET', data = {}, header = {} } = options

    // Get token from storage
    const token = uni.getStorageSync('token')
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    return new Promise((resolve, reject) => {
      uni.request({
        url: this.baseURL + url,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          ...header
        },
        timeout: this.timeout,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else if (res.statusCode === 401) {
            // Token expired, redirect to login
            uni.removeStorageSync('token')
            uni.showToast({
              title: '登录已过期',
              icon: 'none'
            })
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/profile/index' })
            }, 1500)
            reject(res.data)
          } else {
            uni.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(res.data)
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          })
          reject(err)
        }
      })
    })
  }

  get(url, data) {
    return this.request({ url, method: 'GET', data })
  }

  post(url, data) {
    return this.request({ url, method: 'POST', data })
  }

  put(url, data) {
    return this.request({ url, method: 'PUT', data })
  }

  delete(url, data) {
    return this.request({ url, method: 'DELETE', data })
  }
}

export default new Request()
