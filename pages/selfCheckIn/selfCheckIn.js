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

const timeGap = 5000


function showModal(s) {
  wx.showModal({
    title: '提示',
    content: s,
    success: function (res) {
    }
  })
}

function addCheckoutData(id, checkInTime) {
  var start = new Date(checkInTime)
  var end = new Date()
  var study = Math.floor((end - start) / 60000)
  db.collection(dbName).doc(id).
    update({
      data: {
        checkOutTime: end,
        studyTime: study
      },
      success: function (res) {
        showModal(name + " Check out succeeded")
      },
      fail: function (res) {
        showModal(name + " Check out failed")
      }
    })
}

function submitSelfCheckIn(name) {
  db.collection(dbName).where({
    name: name,
    date: new Date().toLocaleDateString(),
    checkOutTime: ""
  }).get({
    success: function (res) {
      if (res.data.length == 0) {
        addSelfCheckinData(name)
      } else {
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

function addSelfCheckinData(name) {
  db.collection(dbName).add({
    data: {
      name: name,
      date: new Date().toLocaleDateString(),
      checkInTime: new Date().toString(),
      checkOutTime: "",
      studyTime: 30
    },
    success: function (res) {
      showModal(name + " Check in succeeded")
    },
    fail: function (res) {
      showModal(name + " Check in failed")
    }
  })
}

function submitSelfCheckOut(name) {
  db.collection(dbName).where({
    name: name,
    date: new Date().toLocaleDateString(),
    checkOutTime: ""
  }).get({
    success: function (res) {
      if (res.data.length == 0) {
        wx.showModal({
          title: '提示',
          content: 'Already checked out or not check in'
        })
      } else {
        var id = res.data[res.data.length - 1]._id
        var checkInTime = res.data[res.data.length - 1].checkInTime
        addCheckoutData(id, checkInTime);
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

function throttle(func, gapTime) {
  let last = null;
  return function() {
    let now = +new Date()
    if(now - last >= gapTime || !last) {
      func(this);
      last = now;
    }
  }
}

var selfCheckIn = function(that) {
  var name = that.data.userNickName
  wx.getLocation({
    success: function (res) {
      var latitude = res.latitude
      var longitude = res.longitude
      if (odeLatitude > latitude - tolerance && odeLatitude < latitude + tolerance && odeLong > longitude - tolerance && odeLong < longitude + tolerance) {
        if (name == "") {
          showModal("Please wait a moment and try again")
        } else {
          submitSelfCheckIn(name)
          // wx.request(checkOut(e))
        }
      } else {
        showModal("您目前不在ODE")
      }
    },
    altitude: false,
    fail: function (res) {
      showModal("Cannot get your location")
    }
  })
}

var selfCheckOut = function (that) {
  var name = that.data.userNickName
  wx.getLocation({
    success: function (res) {
      var latitude = res.latitude
      var longitude = res.longitude
      if (odeLatitude > latitude - tolerance && odeLatitude < latitude + tolerance && odeLong > longitude - tolerance && odeLong < longitude + tolerance) {
        if (name == "") {
          showModal("Name cannot be Blank")
        } else {
          submitSelfCheckOut(name)
          // wx.request(checkOut(e))
        }
      } else {
        showModal("您目前不在ODE")
      }
    },
    altitude: false,
    fail: function (res) {
      showModal("Cannot get your location")
    }
  })
}

Page({
  data: {
    userInfo: "",
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userNickName:"",
    title: "UWCTA 自习打卡"
  },
  selfCheckIn: throttle(selfCheckIn,timeGap),
  selfCheckOut: throttle(selfCheckOut, timeGap),
  onLoad: function () {
    wx.showToast({
      title: 'loading',
      icon: 'loading',
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        userNickName: app.globalData.userInfo.nickName
      })
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          userNickName: res.userInfo.nickName
        })
      }
    } else {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
            userNickName: res.userInfo.nickName
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
      userNickName: e.detail.userInfo.nickName
    })
  }
})