//index.js
//获取应用实例
const app = getApp()

const dbName = 'check_in_check_out'
wx.cloud.init()
const db = wx.cloud.database()

Page({
  data: {
    userInfo: "",
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    title: "UWCTA 自习打卡",
    description: "请注意这是测试版，check in 和check out的时候名字必须完全match，邮箱为optional 可以填也可以不填，之后源表格就会变成只读状态，打卡只可以从这个小程序进行"
  },
  check: function (e) {
    var searchName = e.detail.value.name
    db.collection(dbName).where({
      name: searchName
    }).get({
      success: function (res) {
        var total = 0
        for (var i = 0; i < res.data.length; i++) {
          total += res.data[i].studyTime
        }
        wx.showModal({
          title: 'Total study time',
          content: total + " minutes",
        })
      },
      fail: function(res) {
        wx.showModal({
          title: 'Error',
          content: "Network Error",
        })
      }
    })
  },
  onLoad: function () {
    wx.showToast({
      title: 'loading',
      icon: 'loading',
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
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
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})