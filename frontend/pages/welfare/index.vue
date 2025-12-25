<template>
  <view class="container">
    <view class="header">
      <view class="title">宝贝回家</view>
      <view class="subtitle">传递爱心 帮助失散家庭团聚</view>
    </view>

    <view class="statistics">
      <view class="stat-card">
        <view class="stat-number">{{ stats.total }}</view>
        <view class="stat-label">登记案例</view>
      </view>
      <view class="stat-card highlight">
        <view class="stat-number">{{ stats.missing }}</view>
        <view class="stat-label">寻找中</view>
      </view>
      <view class="stat-card success">
        <view class="stat-number">{{ stats.found }}</view>
        <view class="stat-label">已找到</view>
      </view>
    </view>

    <view class="notice">
      <view class="notice-icon">ℹ️</view>
      <view class="notice-text">
        此页面仅展示"宝贝回家"公益数据，数据由管理员录入维护。如有线索，请联系页面显示的联系方式。
      </view>
    </view>

    <view class="filter-bar">
      <picker mode="selector" :range="provinces" @change="onProvinceChange">
        <view class="filter-btn">
          <text>{{ selectedProvince || '全部省份' }}</text>
          <text class="arrow">▼</text>
        </view>
      </picker>
    </view>

    <scroll-view scroll-y class="children-list" @scrolltolower="loadMore">
      <view class="child-card" v-for="child in children" :key="child.id"
        @tap="viewDetail(child.id)">
        <view class="child-photo">
          <image v-if="child.photo" :src="child.photo" mode="aspectFill"></image>
          <view v-else class="no-photo">暂无照片</view>
        </view>
        <view class="child-info">
          <view class="child-name">{{ child.name }}</view>
          <view class="child-detail">
            <view class="detail-row">
              <text class="label">性别：</text>
              <text>{{ child.gender === 'male' ? '男' : '女' }}</text>
            </view>
            <view class="detail-row">
              <text class="label">失踪时间：</text>
              <text>{{ formatDate(child.missing_date) }}</text>
            </view>
            <view class="detail-row">
              <text class="label">失踪地点：</text>
              <text>{{ child.missing_location }}</text>
            </view>
            <view class="detail-row">
              <text class="label">当前年龄：</text>
              <text>约{{ child.current_age }}岁</text>
            </view>
          </view>
          <view class="action-buttons">
            <button class="action-btn share" @tap.stop="shareCase(child)">
              <text>分享海报</text>
            </button>
          </view>
        </view>
      </view>

      <view class="loading" v-if="loading">加载中...</view>
      <view class="no-more" v-if="noMore">没有更多了</view>
    </scroll-view>

    <!-- Detail Modal -->
    <view class="modal" v-if="showModal" @tap="closeModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <view class="modal-title">详细信息</view>
          <view class="modal-close" @tap="closeModal">×</view>
        </view>
        <scroll-view scroll-y class="modal-body">
          <view class="detail-photo" v-if="currentChild.photo">
            <image :src="currentChild.photo" mode="aspectFit"></image>
          </view>
          <view class="detail-section">
            <view class="section-title">基本信息</view>
            <view class="info-row">
              <text class="info-label">姓名：</text>
              <text>{{ currentChild.name }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">性别：</text>
              <text>{{ currentChild.gender === 'male' ? '男' : '女' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">失踪时年龄：</text>
              <text>{{ currentChild.age_at_missing }}岁</text>
            </view>
            <view class="info-row">
              <text class="info-label">当前推算年龄：</text>
              <text>约{{ currentChild.current_age }}岁</text>
            </view>
          </view>
          <view class="detail-section">
            <view class="section-title">失踪信息</view>
            <view class="info-row">
              <text class="info-label">失踪时间：</text>
              <text>{{ formatDate(currentChild.missing_date) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">失踪地点：</text>
              <text>{{ currentChild.missing_location }}</text>
            </view>
            <view class="info-row" v-if="currentChild.case_number">
              <text class="info-label">案件编号：</text>
              <text>{{ currentChild.case_number }}</text>
            </view>
          </view>
          <view class="detail-section" v-if="currentChild.description">
            <view class="section-title">特征描述</view>
            <view class="info-text">{{ currentChild.description }}</view>
          </view>
          <view class="detail-section" v-if="currentChild.contact_info">
            <view class="section-title">联系方式</view>
            <view class="contact-info">{{ currentChild.contact_info }}</view>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button class="modal-btn primary" @tap="generatePoster(currentChild)">生成海报</button>
          <button class="modal-btn" @tap="closeModal">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      stats: {
        total: 0,
        missing: 0,
        found: 0
      },
      selectedProvince: '',
      provinces: ['全部省份', '北京', '上海', '广东', '四川', '云南', '河南', '山东'],
      children: [],
      page: 1,
      loading: false,
      noMore: false,
      showModal: false,
      currentChild: {}
    }
  },
  onLoad() {
    this.loadStatistics()
    this.loadChildren()
  },
  methods: {
    async loadStatistics() {
      // Load statistics from API
      // Placeholder data
      this.stats = {
        total: 150,
        missing: 120,
        found: 30
      }
    },
    
    async loadChildren() {
      if (this.loading || this.noMore) return
      this.loading = true
      
      // API call to load missing children data
      // This is read-only, no UGC allowed
      
      // Placeholder data
      this.loading = false
    },
    
    loadMore() {
      if (!this.loading && !this.noMore) {
        this.page++
        this.loadChildren()
      }
    },
    
    onProvinceChange(e) {
      this.selectedProvince = this.provinces[e.detail.value]
      this.page = 1
      this.children = []
      this.noMore = false
      this.loadChildren()
    },
    
    viewDetail(id) {
      // Load child detail
      const child = this.children.find(c => c.id === id)
      if (child) {
        this.currentChild = child
        this.showModal = true
      }
    },
    
    closeModal() {
      this.showModal = false
    },
    
    async shareCase(child) {
      // Generate and share poster
      // Prevent event bubbling
      uni.showToast({
        title: '准备生成海报',
        icon: 'none'
      })
      
      // In production, generate poster image with child info
      // and allow sharing to WeChat
    },
    
    async generatePoster(child) {
      uni.showLoading({ title: '生成中...' })
      
      // Generate poster with child information
      // Use canvas API to draw poster
      
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '海报已生成',
          icon: 'success'
        })
      }, 2000)
    },
    
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8f8f8;
}

.header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: white;
  padding: 50rpx 30rpx;
  text-align: center;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 26rpx;
  opacity: 0.9;
}

.statistics {
  display: flex;
  padding: 30rpx 20rpx;
  background: white;
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: 20rpx;
}

.stat-card.highlight {
  color: #ff6b6b;
}

.stat-card.success {
  color: #51cf66;
}

.stat-number {
  font-size: 44rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.notice {
  display: flex;
  align-items: flex-start;
  background: #fff3cd;
  padding: 20rpx;
  margin: 20rpx;
  border-radius: 10rpx;
  border-left: 4rpx solid #ffc107;
}

.notice-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.notice-text {
  flex: 1;
  font-size: 24rpx;
  color: #856404;
  line-height: 1.6;
}

.filter-bar {
  padding: 20rpx;
}

.filter-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20rpx;
  border-radius: 10rpx;
}

.arrow {
  color: #999;
}

.children-list {
  height: calc(100vh - 500rpx);
  padding: 0 20rpx;
}

.child-card {
  display: flex;
  background: white;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
}

.child-photo {
  width: 200rpx;
  height: 200rpx;
  margin-right: 20rpx;
  border-radius: 10rpx;
  overflow: hidden;
  background: #f5f5f5;
  flex-shrink: 0;
}

.child-photo image {
  width: 100%;
  height: 100%;
}

.no-photo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 24rpx;
}

.child-info {
  flex: 1;
}

.child-name {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 15rpx;
}

.child-detail {
  margin-bottom: 15rpx;
}

.detail-row {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.label {
  color: #999;
}

.action-buttons {
  display: flex;
}

.action-btn {
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  border: none;
}

.action-btn.share {
  background: #ff6b6b;
  color: white;
}

.loading, .no-more {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 24rpx;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 90%;
  max-height: 80vh;
  background: white;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
}

.modal-close {
  font-size: 60rpx;
  color: #999;
  line-height: 1;
}

.modal-body {
  flex: 1;
  padding: 30rpx;
}

.detail-photo {
  width: 100%;
  height: 400rpx;
  margin-bottom: 30rpx;
  border-radius: 10rpx;
  overflow: hidden;
}

.detail-photo image {
  width: 100%;
  height: 100%;
}

.detail-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 15rpx;
  color: #ff6b6b;
}

.info-row {
  font-size: 26rpx;
  margin-bottom: 10rpx;
  color: #333;
}

.info-label {
  color: #999;
}

.info-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.8;
}

.contact-info {
  font-size: 28rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.modal-footer {
  display: flex;
  padding: 20rpx;
  border-top: 1rpx solid #eee;
}

.modal-btn {
  flex: 1;
  margin: 0 10rpx;
  padding: 20rpx;
  border-radius: 10rpx;
  border: none;
  font-size: 28rpx;
}

.modal-btn.primary {
  background: #ff6b6b;
  color: white;
}
</style>
