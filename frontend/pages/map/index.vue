<template>
  <view class="container">
    <view class="header">
      <view class="user-title">
        <view class="title-badge">{{ currentTitle.name }}</view>
        <view class="title-level">Lv.{{ currentTitle.level }}</view>
      </view>
      <view class="progress-info">
        <view class="provinces-count">已点亮 {{ provincesLit }}/34 个省份</view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%' }"></view>
        </view>
        <view class="next-title" v-if="nextTitle">
          下一级：{{ nextTitle.name }} ({{ nextTitle.required_provinces }}个省份)
        </view>
      </view>
    </view>

    <!-- China Map Display -->
    <view class="map-container">
      <view class="map-wrapper">
        <!-- Placeholder for Tencent Map SDK integration -->
        <view class="map-placeholder">
          <text class="map-hint">🗺️ 中国地图</text>
          <text class="map-desc">通过交换特产点亮各省份</text>
        </view>
        
        <!-- Province List (Grid View) -->
        <scroll-view scroll-y class="provinces-grid">
          <view class="province-item" v-for="province in allProvinces" :key="province.name"
            :class="{ lit: province.isLit }">
            <view class="province-name">{{ province.name }}</view>
            <view class="province-status">
              <text v-if="province.isLit">✓</text>
              <text v-else>○</text>
            </view>
            <view class="province-count" v-if="province.count > 0">×{{ province.count }}</view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- Lighting Animation Overlay -->
    <view class="lighting-animation" v-if="showAnimation">
      <view class="animation-content">
        <view class="animation-icon">🎉</view>
        <view class="animation-text">恭喜点亮</view>
        <view class="animation-province">{{ newProvince }}</view>
      </view>
    </view>

    <!-- Title Upgrade Animation -->
    <view class="upgrade-animation" v-if="showUpgrade">
      <view class="upgrade-content">
        <view class="upgrade-icon">👑</view>
        <view class="upgrade-text">头衔升级</view>
        <view class="upgrade-title">{{ upgradedTitle }}</view>
      </view>
    </view>

    <view class="achievements">
      <view class="section-title">成就徽章</view>
      <view class="badges">
        <view class="badge-item" v-for="title in allTitles" :key="title.level"
          :class="{ unlocked: title.level <= currentTitle.level }">
          <view class="badge-icon">
            <text v-if="title.level <= currentTitle.level">🏆</text>
            <text v-else>🔒</text>
          </view>
          <view class="badge-name">{{ title.name }}</view>
          <view class="badge-req">{{ title.required_provinces }}省</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTitle: {
        level: 1,
        name: '探索者',
        required_provinces: 3
      },
      nextTitle: {
        level: 2,
        name: '旅行家',
        required_provinces: 10
      },
      provincesLit: 0,
      progress: 0,
      allProvinces: [],
      allTitles: [
        { level: 1, name: '探索者', required_provinces: 3 },
        { level: 2, name: '旅行家', required_provinces: 10 },
        { level: 3, name: '游侠', required_provinces: 20 },
        { level: 4, name: '游礼大师', required_provinces: 30 }
      ],
      showAnimation: false,
      newProvince: '',
      showUpgrade: false,
      upgradedTitle: ''
    }
  },
  onLoad() {
    this.loadMapProgress()
  },
  methods: {
    async loadMapProgress() {
      // Load user's map progress from API
      // This includes lit provinces, current title, next title, etc.
      
      // Initialize all provinces
      const provinces = [
        '北京', '天津', '河北', '山西', '内蒙古',
        '辽宁', '吉林', '黑龙江', '上海', '江苏',
        '浙江', '安徽', '福建', '江西', '山东',
        '河南', '湖北', '湖南', '广东', '广西',
        '海南', '重庆', '四川', '贵州', '云南',
        '西藏', '陕西', '甘肃', '青海', '宁夏',
        '新疆', '台湾', '香港', '澳门'
      ]
      
      this.allProvinces = provinces.map(name => ({
        name,
        isLit: false,
        count: 0
      }))
      
      // Simulate API response
      // In production, this would fetch from backend
    },
    
    /**
     * Trigger lighting animation when new province is lit
     * Called after order completion
     */
    playLightingAnimation(provinceName) {
      this.newProvince = provinceName
      this.showAnimation = true
      
      // Find and update province
      const province = this.allProvinces.find(p => p.name === provinceName)
      if (province) {
        province.isLit = true
        province.count = (province.count || 0) + 1
      }
      
      this.provincesLit++
      
      setTimeout(() => {
        this.showAnimation = false
      }, 3000)
      
      // Check for title upgrade
      this.checkTitleUpgrade()
    },
    
    checkTitleUpgrade() {
      const newTitle = this.allTitles.find(t => 
        t.required_provinces <= this.provincesLit && t.level > this.currentTitle.level
      )
      
      if (newTitle) {
        this.upgradedTitle = newTitle.name
        this.showUpgrade = true
        this.currentTitle = newTitle
        
        setTimeout(() => {
          this.showUpgrade = false
        }, 3000)
      }
    },
    
    calculateProgress() {
      if (this.nextTitle) {
        this.progress = (this.provincesLit / this.nextTitle.required_provinces) * 100
      } else {
        this.progress = 100
      }
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f0ff 0%, #ffffff 50%);
}

.header {
  background: white;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
}

.user-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.title-badge {
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
  margin-right: 10rpx;
}

.title-level {
  font-size: 24rpx;
  background: #667eea;
  color: white;
  padding: 5rpx 15rpx;
  border-radius: 20rpx;
}

.progress-info {
  text-align: center;
}

.provinces-count {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
}

.progress-bar {
  height: 20rpx;
  background: #f0f0f0;
  border-radius: 10rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.next-title {
  font-size: 24rpx;
  color: #999;
}

.map-container {
  background: white;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
}

.map-wrapper {
  min-height: 600rpx;
}

.map-placeholder {
  text-align: center;
  padding: 80rpx 0;
}

.map-hint {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.map-desc {
  font-size: 28rpx;
  color: #999;
  display: block;
}

.provinces-grid {
  height: 800rpx;
  margin-top: 20rpx;
}

.province-item {
  display: inline-block;
  width: 23%;
  margin: 1%;
  background: #f5f5f5;
  border-radius: 10rpx;
  padding: 20rpx;
  text-align: center;
  position: relative;
}

.province-item.lit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.province-name {
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

.province-status {
  font-size: 32rpx;
}

.province-count {
  position: absolute;
  top: 5rpx;
  right: 5rpx;
  font-size: 20rpx;
  background: rgba(255,255,255,0.3);
  padding: 2rpx 8rpx;
  border-radius: 10rpx;
}

.lighting-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.animation-content {
  text-align: center;
  color: white;
}

.animation-icon {
  font-size: 120rpx;
  animation: bounce 0.6s ease infinite;
}

.animation-text {
  font-size: 40rpx;
  margin: 20rpx 0;
}

.animation-province {
  font-size: 60rpx;
  font-weight: bold;
  color: #ffd700;
}

.upgrade-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.upgrade-content {
  text-align: center;
  color: white;
}

.upgrade-icon {
  font-size: 150rpx;
  animation: rotate 1s ease infinite;
}

.upgrade-text {
  font-size: 40rpx;
  margin: 20rpx 0;
}

.upgrade-title {
  font-size: 70rpx;
  font-weight: bold;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.achievements {
  background: white;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.badges {
  display: flex;
  justify-content: space-around;
}

.badge-item {
  text-align: center;
  opacity: 0.5;
}

.badge-item.unlocked {
  opacity: 1;
}

.badge-icon {
  font-size: 60rpx;
  margin-bottom: 10rpx;
}

.badge-name {
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.badge-req {
  font-size: 20rpx;
  color: #999;
}
</style>
