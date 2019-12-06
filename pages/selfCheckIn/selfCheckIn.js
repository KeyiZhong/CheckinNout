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

const timeGap = 3000

const MILL_IN_A_DAY = 86400000

function showModal(s) {
  wx.showModal({
    title: '提示',
    content: s,
    success: function (res) {
    }
  })
}

function submitSelfCheckIn(name, that) {
  db.collection(dbName).where({
    name: name,
    checkOutTime: ""
  }).get({
    success: function (res) {
      if(res.data.length > 0) {
        var lastCheckIn = res.data[res.data.length - 1].checkInTime
        var lastCheckInDate = res.data[res.data.length - 1].date
        if (checkInTimeLegal(lastCheckIn, lastCheckInDate)) {
          addSelfCheckinData(name, that)
        } else {
          wx.showModal({
            title: '提示',
            content: name + ' already checked in'
          })
        }
      }else {
        addSelfCheckinData(name, that)
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

function addSelfCheckinData(name, that) {
  db.collection(dbName).add({
    data: {
      name: name,
      date: new Date().toShortFormat(),
      checkInTime: new Date(),
      checkOutTime: "",
      studyTime: 30
    },
    success: function (res) {
      showModal(name + " check in succeeded")
      that.setData({
        today:true
      })
    },
    fail: function (res) {
      showModal(name + " check in failed")
    }
  })
}

function submitSelfCheckOut(name) {
  db.collection(dbName).where({
    name: name
  }).get({
    success: function (res) {
      if(res.data.length === 0) {
        showModal(name + ' not check in');
      }else {
        var lastCheckIn = res.data[res.data.length - 1].checkInTime
        var lastCheckInDate = res.data[res.data.length - 1].date
        var checkOutTime = res.data[res.data.length - 1].checkOutTime
        var id = res.data[res.data.length - 1]._id
        // 如果上次没checkout并且上一次是今天checkin 或 昨天checkin但是今天还没过六点
        if (checkOutTimeLegal(checkOutTime, lastCheckIn, lastCheckInDate)) {
          addCheckoutData(name, id, lastCheckIn);
        }else {
          showModal(name + ' already checked out or not check in');
        }
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

function addCheckoutData(name, id, checkInTime) {
  var start = checkInTime
  var end = new Date()
  var study = Math.floor((end - start) / 60000)
  db.collection(dbName).doc(id).
    update({
      data: {
        checkOutTime: end,
        studyTime: study
      },
      success: function (res) {
        showModal(name + " check out succeeded")
      },
      fail: function (res) {
        showModal(name + " check out failed")
      }
    })
}

// 如果现在在六点以后且上次没checkout的时间在六点以前，或者如果现在在六点以前且上次没checkout的时间在昨天六点以前
function checkInTimeLegal(lastCheckIn, lastCheckInDate) {
  return ((new Date().getHours() >= 6 && lastCheckIn.getHours() <= 6) || (new Date().getHours() <= 6 && lastCheckIn.getHours() <= 6 && new Date(new Date().toDateString()) - new Date(lastCheckInDate) >= MILL_IN_A_DAY))
}

// 如果上次没checkout并且上一次是今天checkin 或 昨天checkin但是今天还没过六点
function checkOutTimeLegal(checkOutTime, lastCheckIn, lastCheckInDate) {
  return checkOutTime === "" &&
    (lastCheckInDate === new Date().toShortFormat() || (new Date(new Date().toDateString()) - new Date(lastCheckInDate) === MILL_IN_A_DAY && new Date().getHours() <= 6 && lastCheckIn.getHours() >= 6))
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
          submitSelfCheckIn(name,that)
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
    title: "UWCTA 自习打卡",
    today: false
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
        let that = this
        db.collection(dbName).where({
          name: res.userInfo.nickName,
          date: new Date().toLocaleDateString()
        }).get({
          success: function (res) {
            that.setData({
              today: true
            })
          }
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