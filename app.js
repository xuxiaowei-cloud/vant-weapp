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

    // 登录：https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html
    // 后台使用：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
    // 授权
    this.accessToken()
  },
  // 授权
  accessToken() {
    // 发送 res.code 到后台换取 openId, sessionKey, unionId, access_token, refresh_token
    wx.login({
      success: res => {
        if (res.code) {

          // 获取 access_token, refresh_token
          wx.request({
            url: this.tokenHost() + '&code=' + res.code,
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
  },
  // 小程序服务地址
  wechatHost() {
    return `${this.host}/wechat_miniprogram`
  },
  // 授权服务地址：授权类型为密码模式
  // 客户端类型：wechat_applet（代表微信小程序）
  tokenHost() {
    // 此处发送的 client_secret 可以进行加密、签名，并在 https://gitee.com/xuxiaowei-cloud/xuxiaowei-cloud/blob/main/authorization-server/src/main/java/cloud/xuxiaowei/authorizationserver/service/impl/ClientPasswordEncoderImpl.java 中进行验证加密、签名
    return `${this.host}/passport/oauth2/token?grant_type=wechat_miniprogram&client_id=${this.client_id}&client_secret=${this.client_secret}&appid=wxcf4f3a217a8bc728`
  },
  // 小程序服务地址
  host: 'http://gateway.example.next.xuxiaowei.cloud:1101',
  // 密码模式下的客户ID（为了保证安全，请给该用户仅授权：password 模式）
  client_id: 'xuxiaowei_client_webchat_miniprogram_id',
  // 密码模式下的客户凭证
  client_secret: 'xuxiaowei_client_webchat_miniprogram_secret',
  // 正常响应代码
  ok: '000000'
})