//index.js
//获取应用实例
const app = getApp()

const odeLatitude = 47.656396;
const odeLong = -122.310363;
var query = wx.createSelectorQuery();

function checkIn(e) {
  return {
    url: "https://script.google.com/macros/s/AKfycbxX2XKX1Ajar6kSje2rmfgpIOpjH_na9d3_Yrm4h_PHF2Dj0RU/exec",
    method: "post",
    data: {
      action: "checkIn",
      name: e.detail.value.name,
      email: e.detail.value.email
    },
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: function (res) {
      if(res.data != "Success") {
        if (res.data.length < 100) {
          wx.showModal({
            title: '出错',
            content: res.data,
          })
        } else {
          wx.showModal({
            title: '出错',
            content: 'oops，出错了，请联系管理员',
          })
        }
      }else{
        wx.showToast({
          title: 'Checked In',
          icon: 'success',
          duration: 2000
        })
      }
    }, fail: function (res) {
      wx.showToast({
        title: '出错',
        icon: 'fail',
        duration: 2000
      })
    }
  }
}


function checkOut(e) {
  return {
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
      if (res.data != "Success") {
        if (res.data.length < 100){
          wx.showModal({
            title: '出错',
            content: res.data,
          })
        } else {
          wx.showModal({
            title: '出错',
            content: 'oops，出错了，请联系管理员',
          })
        }
      } else {
        wx.showToast({
          title: 'Checked out',
          icon: 'success',
          duration: 2000
        })
      }
    }, fail: function (res) {
      wx.showToast({
        title: '出错',
        duration: 2000
      })
    }
  }
}

function checkLocation() {
  var isODE = false;
  var tolerance = 0.001;
  wx.getLocation({
    success: function (res) {
      var latitude = res.latitude
      var longitude = res.longitude
      if(odeLatitude > latitude - tolerance && odeLatitude < latitude + tolerance && odeLong > longitude - tolerance && odeLong < longitude + tolerance) {
        isOde = true;
      }
    },
    altitude: false
  })
  return isODE;
}

Page({
  data: {
    userInfo: "",
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    title:"UWCTA 自习打卡",
    description: "请注意这是测试版，check in 和check out的时候名字必须完全match，邮箱为optional 可以填也可以不填，之后源表格就会变成只读状态，打卡只可以从这个小程序进行"
  },
  bindFormSubmit:function(e){
    if(checkLocation()) {
      wx.request(checkIn(e));
    }else {
      wx.showModal({
        title: '提示',
        content: '您目前不在ODE',
        success: function (res) {
        }
      })
    }
  },
  bindFormSubmit2: function (e) {
    if (checkLocation()) {
      wx.request(checkOut(e));
    } else {
      wx.showModal({
        title: '提示',
        content: '您目前不在ODE',
        success: function (res) {
        }
      })
    }
  },
  onLoad: function () {
    wx.showToast({
      title: 'loading',
      icon:'loading',
    })
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