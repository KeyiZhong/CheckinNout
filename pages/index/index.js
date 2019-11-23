//index.js
//获取应用实例
const app = getApp()

var query = wx.createSelectorQuery();

Page({
  data: {
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  bindFormSubmit:function(e){
    wx.request({
      url: "https://script.google.com/macros/s/AKfycbxX2XKX1Ajar6kSje2rmfgpIOpjH_na9d3_Yrm4h_PHF2Dj0RU/exec",
      method: "post",
      data: {
        action: "checkIn",
        name: e.detail.value.name,
        email: e.detail.value.email
      },
      header:{
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.showToast({
          title: '成功！',
          icon: 'success',
          duration: 2000
        })
      }, fail: function (res) {
        wx.showToast({
          title: '出错',
          icon: 'fail',
          duration: 2000
        })
      }
    })
  },
  bindFormSubmit2: function (e) {
    wx.request({
      url: "https://script.google.com/macros/s/AKfycbxX2XKX1Ajar6kSje2rmfgpIOpjH_na9d3_Yrm4h_PHF2Dj0RU/exec",
      method: "POST",
      data: {
        action: "checkOut",
        name: e.detail.value.name
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },  
      success: function (res) {
        console.log(res.data);
        wx.showToast({
          title: '成功！',
          icon: 'success',
          duration: 2000
        })
      },
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})