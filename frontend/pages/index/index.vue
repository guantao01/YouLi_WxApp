<template>
  <view class="container">
    <view class="header">
      <view class="logo">游礼</view>
      <view class="subtitle">发现中国特产 点亮美好旅程</view>
    </view>

    <view class="features">
      <view class="feature-card" @tap="navigateTo('/pages/market/index')">
        <view class="feature-icon">🎁</view>
        <view class="feature-title">特产市场</view>
        <view class="feature-desc">C2C交易·盲盒惊喜</view>
      </view>

      <view class="feature-card" @tap="navigateTo('/pages/map/index')">
        <view class="feature-icon">🗺️</view>
        <view class="feature-title">点亮中国</view>
        <view class="feature-desc">收集省份·升级头衔</view>
      </view>

      <view class="feature-card" @tap="navigateTo('/pages/welfare/index')">
        <view class="feature-icon">❤️</view>
        <view class="feature-title">宝贝回家</view>
        <view class="feature-desc">公益寻亲·传递希望</view>
      </view>
    </view>

    <view class="stats">
      <view class="stat-item">
        <view class="stat-value">{{ stats.users }}</view>
        <view class="stat-label">活跃用户</view>
      </view>
      <view class="stat-item">
        <view class="stat-value">{{ stats.provinces }}</view>
        <view class="stat-label">省份覆盖</view>
      </view>
      <view class="stat-item">
        <view class="stat-value">{{ stats.products }}</view>
        <view class="stat-label">特产种类</view>
      </view>
    </view>

    <view class="recent-products">
      <view class="section-title">最新上架</view>
      <scroll-view scroll-x class="products-scroll">
        <view class="product-item" v-for="product in recentProducts" :key="product.id"
          @tap="navigateTo('/pages/market/detail?id=' + product.id)">
          <image :src="product.images[0]" class="product-image" mode="aspectFill"></image>
          <view class="product-info">
            <view class="product-title">{{ product.title }}</view>
            <view class="product-province">{{ product.province }}</view>
            <view class="product-price">¥{{ product.price }}</view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      stats: {
        users: '10k+',
        provinces: 34,
        products: '500+'
      },
      recentProducts: []
    }
  },
  onLoad() {
    this.loadRecentProducts()
  },
  methods: {
    navigateTo(url) {
      uni.navigateTo({ url })
    },
    async loadRecentProducts() {
      // Load recent products from API
      // Placeholder data for now
      this.recentProducts = []
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 60rpx 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
}

.logo {
  font-size: 60rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 28rpx;
  opacity: 0.9;
}

.features {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
}

.feature-card {
  flex: 1;
  background: white;
  padding: 30rpx 20rpx;
  margin: 0 10rpx;
  border-radius: 15rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
}

.feature-icon {
  font-size: 50rpx;
  margin-bottom: 10rpx;
}

.feature-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.feature-desc {
  font-size: 22rpx;
  color: #999;
}

.stats {
  display: flex;
  justify-content: space-around;
  background: white;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 30rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
  margin-top: 5rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.products-scroll {
  white-space: nowrap;
}

.product-item {
  display: inline-block;
  width: 280rpx;
  background: white;
  border-radius: 15rpx;
  margin-right: 20rpx;
  overflow: hidden;
}

.product-image {
  width: 280rpx;
  height: 280rpx;
}

.product-info {
  padding: 20rpx;
}

.product-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-province {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.product-price {
  font-size: 32rpx;
  color: #ff6b6b;
  font-weight: bold;
}
</style>
