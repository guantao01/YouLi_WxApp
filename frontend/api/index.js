import request from '../utils/request.js'

/**
 * Auth API
 */
export const authAPI = {
  // WeChat login
  wechatLogin(code, userInfo) {
    return request.post('/auth/wechat-login', { code, userInfo })
  },
  
  // Verify token
  verifyToken(token) {
    return request.post('/auth/verify', { token })
  }
}

/**
 * User API
 */
export const userAPI = {
  // Get user profile
  getProfile(userId) {
    return request.get(`/users/${userId}`)
  },
  
  // Update user profile
  updateProfile(userId, data) {
    return request.put(`/users/${userId}`, data)
  },
  
  // Real-name verification
  verifyRealName(userId, realName, idCard) {
    return request.post(`/users/${userId}/verify`, { realName, idCard })
  }
}

/**
 * Product API
 */
export const productAPI = {
  // Get product list
  getProducts(params) {
    return request.get('/products', params)
  },
  
  // Get product detail
  getProductById(id) {
    return request.get(`/products/${id}`)
  },
  
  // Create product
  createProduct(data) {
    return request.post('/products', data)
  },
  
  // Update product
  updateProduct(id, data) {
    return request.put(`/products/${id}`, data)
  },
  
  // Delete product
  deleteProduct(id, userId) {
    return request.delete(`/products/${id}`, { userId })
  },
  
  // Get user's products
  getUserProducts(userId) {
    return request.get(`/products/user/${userId}`)
  }
}

/**
 * Order API
 */
export const orderAPI = {
  // Create order with escrow payment
  createOrder(buyerId, productId, shippingAddress) {
    return request.post('/orders', { buyerId, productId, shippingAddress })
  },
  
  // Ship order
  shipOrder(orderId, sellerId, shippingNo, shippingCompany, sellerProvince) {
    return request.put(`/orders/${orderId}/ship`, {
      sellerId, shippingNo, shippingCompany, sellerProvince
    })
  },
  
  // Confirm receipt
  confirmReceipt(orderId, buyerId) {
    return request.put(`/orders/${orderId}/confirm`, { buyerId })
  },
  
  // Request refund
  requestRefund(orderId, userId, reason) {
    return request.post(`/orders/${orderId}/refund`, { userId, reason })
  },
  
  // Get user orders
  getUserOrders(userId, type) {
    return request.get(`/orders/user/${userId}`, { type })
  },
  
  // Get order detail
  getOrderById(orderId) {
    return request.get(`/orders/${orderId}`)
  }
}

/**
 * Map API
 */
export const mapAPI = {
  // Get user's map progress
  getMapProgress(userId) {
    return request.get(`/map/progress/${userId}`)
  },
  
  // Get all titles
  getAllTitles() {
    return request.get('/map/titles')
  },
  
  // Get lit provinces
  getLitProvinces(userId) {
    return request.get(`/map/provinces/${userId}`)
  }
}

/**
 * Welfare API (Missing Children)
 */
export const welfareAPI = {
  // Get missing children list
  getMissingChildren(params) {
    return request.get('/welfare/missing-children', params)
  },
  
  // Get missing child detail
  getMissingChildById(id) {
    return request.get(`/welfare/missing-children/${id}`)
  },
  
  // Get statistics
  getStatistics() {
    return request.get('/welfare/statistics')
  }
}
