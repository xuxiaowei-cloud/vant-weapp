// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录：https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html
    // 后台使用：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //发起网络请求
          wx.request({
            url: this.host + '/onLogin',
            data: {
              code: res.code
            },
            success: resp => {
              console.log(resp)
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
  globalData: {
    userInfo: null
  },
  host: 'http://gateway.example.xuxiaowei.cloud:1101/wechat-applet'
})
