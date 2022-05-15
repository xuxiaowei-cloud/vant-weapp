// app.js

import Dialog from '/libs/vant/dialog/dialog'
import Notify from '/libs/vant/notify/notify'

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
          // 发起网络请求：微信小程序登录
          wx.request({
            url: this.wechatHost() + '/onLogin',
            data: {
              code: res.code
            },
            success: res => {
              console.log(res)
              const resData = res.data
              console.log('登录结果', resData)
              if (resData.code == this.ok) {
                console.log('登录成功！', resData.msg)
                Notify({
                  type: 'success',
                  duration: 1000,
                  message: '登录成功！'
                })

                const data = resData.data
                this.globalData.appid = data.appid
                this.globalData.openid = data.openid

                // 授权
                this.accessToken()

              } else {
                console.error('登录失败！', resData.msg)

                Dialog.alert({
                  title: '登录异常',
                  message: resData.msg,
                }).then(() => {
                  // on close
                })
              }
            }
          })
        } else {
          console.error('登录失败！' + res.errMsg)

          Dialog.alert({
            title: '登录异常',
            message: res.errMsg,
          }).then(() => {
            // on close
          })
        }
      }
    })
  },
  // 授权
  accessToken() {
    // 发送 res.code 到后台换取 openId, sessionKey, unionId, access_token, refresh_token
    wx.login({
      success: res => {
        if (res.code) {

          // 获取 access_token, refresh_token
          wx.request({
            url: this.tokenHost() + '&appid=' + this.globalData.appid + '&username=' + this.globalData.openid + '&password=' + res.code,
            method: 'POST',
            success: res => {
              console.log('授权结果', res)
              const resData = res.data
              const access_token = resData.access_token
              if (access_token) {
                Notify({
                  type: 'success',
                  duration: 1000,
                  message: '授权成功！'
                })

                this.globalData.access_token = access_token
                // 当且仅当拥有 refresh_token 授权类型时才有该值（如需实时生效，需要清空权限表、刷新权限表）
                this.globalData.refresh_token = resData.refresh_token
                this.globalData.jti = resData.jti
                this.globalData.scope = resData.scope
                this.globalData.expires_in = Date.now() + resData.expires_in * 1000
              } else {
                Dialog.alert({
                  title: '授权异常',
                  message: resData.msg,
                }).then(() => {
                  // on close
                })
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    // 用户标识
    openid: null,
    access_token: null,
    // 当且仅当拥有 refresh_token 授权类型时才有该值（如需实时生效，需要清空权限表、刷新权限表）
    refresh_token: null,
    jti: null,
    scope: null,
    expires_in: null
  },
  // 小程序服务地址
  wechatHost() {
    return `${this.host}/wechat-applet`
  },
  // 授权服务地址：授权类型为密码模式
  // 客户端类型：wechat_applet（代表微信小程序）
  tokenHost() {
    return `${this.host}/authorization-server/oauth/token?grant_type=password&client_type=wechat_applet&client_id=${this.client_id}&client_secret=${this.client_secret}`
  },
  // 小程序服务地址
  host: 'http://gateway.example.xuxiaowei.cloud:1101',
  // 密码模式下的客户ID（为了保证安全，请给该用户仅授权：password 模式）
  client_id: 'xuxiaowei_client_wechat_id',
  // 密码模式下的客户凭证
  client_secret: 'xuxiaowei_client_wechat_secret',
  // 正常响应代码
  ok: '000000'
})