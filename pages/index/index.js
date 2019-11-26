//index.js
//获取应用实例
const app = getApp()

const odeLatitude = 47.656;
const odeLong = -122.310;
const tolerance = 0.001;
const dbName = 'check_in_check_out'
wx.cloud.init()
const db = wx.cloud.database()
const _ = db.command
var query = wx.createSelectorQuery();

// not used
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

// not used
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

function notOde() {
  wx.showModal({
    title: '提示',
    content: '您目前不在ODE',
    success: function (res) {
    }
  })
}

function nameCannotBlank() {
  wx.showModal({
    title: '提示',
    content: 'Name cannot be Blank',
    success: function (res) {
    }
  })
}

function cannotGetLocation() {
  wx.showModal({
    title: '提示',
    content: 'Cannot get your location',
    success: function (res) {
    }
  })
}

function addCheckinData(e) {
  db.collection(dbName).add({
    data: {
      name: e.detail.value.name.toLowerCase(),
      email: e.detail.value.email,
      date: new Date().toLocaleDateString(),
      checkInTime: new Date().toString(),
      checkOutTime: "",
      studyTime: 30
    },
    success: function (res) {
      wx.showToast({
        title: 'Checked In',
        icon: 'success',
        duration: 2000
      })
    }
  })
}

function addCheckoutData(e,id,checkInTime) {
  var start = new Date(checkInTime)
  var end = new Date()
  var study = Math.floor((end - start)/60000)
  db.collection(dbName).doc(id).
  update({
    data:{
      checkOutTime: end,
      studyTime: study
    },
    success: function (res) {
      wx.showToast({
        title: 'Checked Out',
        icon: 'success',
        duration: 2000
      })
    }
  })
}

function submitCheckIn(e) {
  db.collection(dbName).where({
    name: e.detail.value.name.toLowerCase(),
    date: new Date().toLocaleDateString(),
    checkOutTime: ""
  }).get({
    success: function (res) {
      if(res.data.length == 0) {
        addCheckinData(e)
      }else {
        wx.showModal({
          title: '提示',
          content: 'Already checked in'
        })
      }
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: res.errMsg
      })
    }
  })
}

function submitCheckOut(e) {
  db.collection(dbName).where({
    name: e.detail.value.name.toLowerCase(),
    date: new Date().toLocaleDateString(),
    checkOutTime: ""
  }).get({
    success: function (res) {
      if (res.data.length == 0){
        wx.showModal({
          title: '提示',
          content: 'Already checked out or not check in'
        })
      }else {
        var id = res.data[res.data.length - 1]._id
        var checkInTime = res.data[res.data.length - 1].checkInTime
        addCheckoutData(e,id,checkInTime);
      }
    },
    fail: function(res) {
      wx.showModal({
        title: '提示',
        content: res.errMsg
      })
    }
  })
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
    var isODE = wx.getLocation({
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        if (odeLatitude > latitude - tolerance && odeLatitude < latitude + tolerance && odeLong > longitude - tolerance && odeLong < longitude + tolerance) {
          if (e.detail.value.name == "") {
            nameCannotBlank()
          } else {
            submitCheckIn(e)
            // wx.request(checkIn(e))
          }
        } else {
          notOde()
        }
      },
      altitude: false,
      fail: function(res) {
        cannotGetLocation();
      }
    })
  },
  bindFormSubmit2: function (e) {
    var isODE = wx.getLocation({
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        if (odeLatitude > latitude - tolerance && odeLatitude < latitude + tolerance && odeLong > longitude - tolerance && odeLong < longitude + tolerance) {
          if (e.detail.value.name == "") {
            nameCannotBlank()
          } else {
            submitCheckOut(e)
            // wx.request(checkOut(e))
          }
        }else {
          notOde()
        }
      },
      altitude: false,
      fail: function (res) {
        cannotGetLocation();
      }
    })
  },
  switchTo: function() {
    wx.navigateTo({
      url: '../record/record',
    })
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
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})