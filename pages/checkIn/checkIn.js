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
const correct = "xbgscta"

const MILL_IN_A_DAY = 86400000

const timeGap = 5000

function showModal(s) {
  wx.showModal({
    title: '提示',
    content: s,
    success: function (res) {
    }
  })
}

function submitCheckIn(name, email, admin) {
  db.collection(dbName).where({
    name: name,
    checkOutTime: ""
  }).get({
    success: function (res) {
      if(res.data.length > 0) {
        var lastCheckIn = res.data[res.data.length - 1].checkInTime
        var lastCheckInDate = res.data[res.data.length - 1].date
        if (checkInTimeLegal(lastCheckIn, lastCheckInDate)) {
          addCheckinData(name, email, admin)
        } else {
          showModal(name + ' already Check in')
        }
      }else {
        addCheckinData(name, email, admin)
      }
    },
    fail: function (res) {
      showModal(res.errMsg)
    }
  })
}

function addCheckinData(name, email, admin) {
  db.collection(dbName).add({
    data: {
      name: name,
      email: email,
      date: new Date().toShortFormat(),
      checkInTime: new Date(),
      checkOutTime: "",
      studyTime: 30,
      checkInAdmin: admin,
      checkOutAdmin: ""
    },
    success: function (res) {
      showModal(name + " check in succeeded")
    },
    fail: function (res) {
      showModal(name + " check in failed")
    }
  })
}

function submitCheckOut(name, admin) {
  db.collection(dbName).where({
    name: name
  }).get({
    success: function (res) {
      if (res.data.length === 0) {
        showModal(name + ' not check in');
      } else {
        var lastCheckIn = res.data[res.data.length - 1].checkInTime
        var lastCheckInDate = res.data[res.data.length - 1].date
        var checkOutTime = res.data[res.data.length - 1].checkOutTime
        var id = res.data[res.data.length - 1]._id
        if (checkOutTimeLegal(checkOutTime, lastCheckIn, lastCheckInDate)) {
          addCheckoutData(name, id, lastCheckIn, admin);
        } else {
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

function addCheckoutData(name, id, checkInTime, admin) {
  var start = checkInTime
  var end = new Date()
  var study = Math.floor((end - start) / 60000)
  db.collection(dbName).doc(id).
    update({
      data: {
        checkOutTime: end,
        studyTime: study,
        checkOutAdmin: admin
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
  return (new Date().getHours() >= 6 && lastCheckIn.getHours() <= 6) || (new Date().getHours() <= 6 && lastCheckIn.getHours() <= 6 && new Date(new Date().toDateString()) - new Date(lastCheckInDate) >= MILL_IN_A_DAY)
}

// 如果上次没checkout并且上一次是今天checkin 或 昨天checkin但是今天还没过六点
function checkOutTimeLegal(checkOutTime, lastCheckIn, lastCheckInDate) {
  return checkOutTime === "" &&
    (lastCheckIn.toShortFormat() === new Date().toShortFormat() || (new Date(new Date().toDateString()) - new Date(lastCheckInDate) === MILL_IN_A_DAY && new Date().getHours() <= 6 && lastCheckIn.getHours() >= 6))
}

function throttle(func, gapTime) {
  let last = null;
  return function () {
    let now = +new Date()
    if (now - last >= gapTime || !last) {
      func(this);
      last = now;
    }
  }
}

var checkIn = function (that) {
  var name = that.data.name.toLowerCase()
  var email = that.data.name.email
  var nickname = that.data.userInfo.nickName
  if (!nickname) {
    nickname = ""
  }
  wx.getLocation({
    success: function (res) {
      var latitude = res.latitude
      var longitude = res.longitude
      if (odeLatitude > latitude - tolerance && odeLatitude < latitude + tolerance && odeLong > longitude - tolerance && odeLong < longitude + tolerance) {
        if (name == "") {
          showModal("Name Cannot Be Blank")
        } else {
          submitCheckIn(name, email, nickname)
          // wx.request(checkIn(e))
        }
      } else {
        showModal('您目前不在ODE')
      }
    },
    altitude: false,
    fail: function (res) {
      showModal('Cannot get your location');
    }
  })
}

var checkOut = function (that) {
  var name = that.data.name.toLowerCase()
  var nickname = that.data.userInfo.nickName
  if (!nickname) {
    nickname = ""
  }
  wx.getLocation({
    success: function (res) {
      var latitude = res.latitude
      var longitude = res.longitude
      if (odeLatitude > latitude - tolerance && odeLatitude < latitude + tolerance && odeLong > longitude - tolerance && odeLong < longitude + tolerance) {
        if (name == "") {
          showModal("Name Cannot Be Blank")
        } else {
          submitCheckOut(name, nickname)
          // wx.request(checkOut(e))
        }
      } else {
        showModal('您目前不在ODE')
      }
    },
    altitude: false,
    fail: function (res) {
      showModal('Cannot get your location');
    }
  })
}

Date.prototype.toShortFormat = function () {

  var day = this.getDate();
  var month = this.getMonth() + 1;
  var year = this.getFullYear();

  return "" + month + "-" + day + "-" + year;
}

Page({
  data: {
    userInfo: "",
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    title: "UWCTA 自习打卡",
    description: "打卡规则：请注意这是测试版，check in 和check out的时候名字必须完全match，邮箱为optional 可以填也可以不填，早上六点为一天开始",
    pass: false,
    passwords: "",
    name: "",
    email: ""
  },
  submitPass: function (e) {
    this.setData({
      pass: this.data.passwords === correct
    })
    if (!this.data.pass) {
      showModal("Wrong password")
    }
  },
  getPassword: function (e) {
    this.setData({
      passwords: e.detail.value
    })
  },
  getName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  getEmail: function (e) {
    this.setData({
      email: e.detail.value
    })
  },
  checkIn: throttle(checkIn, timeGap),
  checkOut: throttle(checkOut, timeGap),
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