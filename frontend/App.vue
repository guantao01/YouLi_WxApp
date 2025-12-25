<script>
export default {
  onLaunch: function () {
    console.log('YouLi App Launched')
    // Check login status
    this.checkLoginStatus()
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
  methods: {
    async checkLoginStatus() {
      const token = uni.getStorageSync('token')
      if (token) {
        // Verify token validity
        // If invalid, clear and prompt re-login
      }
    }
  }
}
</script>

<style>
/* Global styles */
page {
  background-color: #f8f8f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
