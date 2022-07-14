// app.js

import Dialog from '/libs/vant/dialog/dialog'
import Notify from '/libs/vant/notify/notify'
import {
  encode,
  decode
} from './utils/base64'

App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 授权
    this.accessToken()
  },
  // 授权
  accessToken() {
    // 发送 res.code 到后台换取 openId, sessionKey, unionId, access_token, refresh_token
    // 登录：https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html
    wx.login({
      success: res => {
        if (res.code) {

          // 获取 access_token, refresh_token
          // 后台使用：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
          wx.request({
            url: `${this.tokenHost()}&code=${res.code}`,
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
                this.globalData.scope = resData.scope

                let dot1 = access_token.indexOf('.')
                if (dot1 !== -1) {
                  this.globalData.header = JSON.parse(decode(access_token.substring(0, dot1)))
                  let dot2 = access_token.indexOf('.', dot1 + 1)
                  if (dot2 !== -1) {
                    this.globalData.payload = JSON.parse(decode(access_token.substring(dot1 + 1, dot2)))
                    this.globalData.signature = access_token.substring(dot2 + 1)
                  }
                }

              } else {
                Dialog.alert({
                  title: '授权异常',
                  message: resData.msg,
                }).then(() => {
                  // on close
                })
              }
            },
            fail: res => {
              console.error(res)
              Dialog.alert({
                title: '授权异常',
                message: '授权时网络异常，稍后再试',
              }).then(() => {
                // on close
              })
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    access_token: null,
    // 当且仅当拥有 refresh_token 授权类型时才有该值（如需实时生效，需要清空权限表、刷新权限表）
    refresh_token: null,
    scope: null,
    header: null,
    payload: null,
    signature: null,
  },
  // 小程序服务地址
  wechatHost() {
    return `${this.host}/wechat_miniprogram`
  },
  // 授权服务地址：授权类型为 OAuth 2.1 自定义拓展的 wechat_miniprogram，基于开源项目：https://gitee.com/xuxiaowei-com-cn/spring-boot-starter-wechat-miniprogram
  tokenHost() {
    return `${this.host}/passport/oauth2/token?grant_type=wechat_miniprogram&client_id=${this.client_id}&client_secret=${this.client_secret}&appid=wxcf4f3a217a8bc728`
  },
  // 小程序服务地址
  host: 'http://127.0.0.1:1101',
  // 小程序客户ID
  client_id: 'xuxiaowei_client_wechat_miniprogram_id',
  // 小程序客户秘钥
  client_secret: 'xuxiaowei_client_wechat_miniprogram_secret',
  // 正常响应代码
  ok: '000000'
})