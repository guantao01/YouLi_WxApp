<template>
  <view class="container">
    <view class="tabs">
      <view class="tab" :class="{ active: currentTab === 'sale' }" @tap="switchTab('sale')">出售</view>
      <view class="tab" :class="{ active: currentTab === 'purchase' }" @tap="switchTab('purchase')">求购</view>
      <view class="tab" :class="{ active: currentTab === 'blindbox' }" @tap="switchTab('blindbox')">盲盒</view>
    </view>

    <view class="filter-bar">
      <picker mode="selector" :range="provinces" @change="onProvinceChange">
        <view class="filter-item">
          <text>{{ selectedProvince || '全部省份' }}</text>
          <text class="arrow">▼</text>
        </view>
      </picker>
    </view>

    <scroll-view scroll-y class="product-list" @scrolltolower="loadMore">
      <view class="product-card" v-for="product in products" :key="product.id"
        @tap="navigateToDetail(product.id)">
        <image :src="product.images[0]" class="product-image" mode="aspectFill"></image>
        <view class="product-info">
          <view class="product-title">{{ product.title }}</view>
          <view class="product-location">
            <text class="location-icon">📍</text>
            <text>{{ product.province }}</text>
          </view>
          <view class="product-footer">
            <view class="product-price">¥{{ product.price }}</view>
            <view class="product-type" v-if="product.type === 'blindbox'">🎁 盲盒</view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="float-button" @tap="navigateTo('/pages/market/publish')">
      <text class="plus-icon">+</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 'sale',
      selectedProvince: '',
      provinces: ['全部省份', '北京', '上海', '广东', '浙江', '江苏', '四川', '云南', '西藏', '新疆'],
      products: [],
      page: 1,
      loading: false
    }
  },
  onLoad() {
    this.loadProducts()
  },
  methods: {
    switchTab(tab) {
      this.currentTab = tab
      this.page = 1
      this.products = []
      this.loadProducts()
    },
    onProvinceChange(e) {
      this.selectedProvince = this.provinces[e.detail.value]
      this.page = 1
      this.products = []
      this.loadProducts()
    },
    async loadProducts() {
      if (this.loading) return
      this.loading = true
      
      // API call to load products
      // Placeholder for now
      
      this.loading = false
    },
    loadMore() {
      if (!this.loading) {
        this.page++
        this.loadProducts()
      }
    },
    navigateToDetail(id) {
      uni.navigateTo({ url: `/pages/market/detail?id=${id}` })
    },
    navigateTo(url) {
      uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  background: white;
  padding: 20rpx 0;
}

.tab {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  padding: 10rpx 0;
  color: #666;
}

.tab.active {
  color: #667eea;
  font-weight: bold;
  border-bottom: 4rpx solid #667eea;
}

.filter-bar {
  background: white;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.filter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 20rpx;
  background: #f5f5f5;
  border-radius: 10rpx;
}

.arrow {
  color: #999;
  font-size: 24rpx;
}

.product-list {
  flex: 1;
  padding: 20rpx;
}

.product-card {
  background: white;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
}

.product-image {
  width: 100%;
  height: 400rpx;
}

.product-info {
  padding: 20rpx;
}

.product-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.product-location {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 15rpx;
}

.location-icon {
  margin-right: 5rpx;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 36rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.product-type {
  font-size: 24rpx;
  color: #667eea;
  background: #f0f0ff;
  padding: 5rpx 15rpx;
  border-radius: 20rpx;
}

.float-button {
  position: fixed;
  right: 30rpx;
  bottom: 100rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.4);
}

.plus-icon {
  color: white;
  font-size: 60rpx;
  font-weight: 300;
}
</style>
