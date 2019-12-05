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

const timeGap = 5000

function showModal(s) {
  wx.showModal({
    title: '提示',
    content: s,
    success: function (res) {
    }
  })
}

function addCheckinData(name, email,admin) {
  db.collection(dbName).add({
    data: {
      name: name,
      email: email,
      date: new Date().toLocaleDateString(),
      checkInTime: new Date().toString(),
      checkOutTime: "",
      studyTime: 30,
      checkInAdmin: admin,
      checkOutAdmin: ""
    },
    success: function (res) {
      showModal("Check in succeeded")
    },
    fail: function(res) {
      showModal("Check in failed")
    }
  })
}

function submitCheckOut(name, admin) {
  db.collection(dbName).where({
    name: name,
    checkOutTime: ""
  }).get({
    success: function (res) {
      if (res.data.length === 0) {
        showModal(name + ' not check in');
      } else {
        var lastCheckIn = res.data[res.data.length - 1].checkInTime
        var lastCheckInDate = new Date(lastCheckIn)
        var id = res.data[res.data.length - 1]._id
        // 如果上次没checkout并且上一次是今天checkin 或 昨天checkin但是今天还没过六点
        if (res.data[res.data.length - 1].checkOutTime === "" &&
          (lastCheckInDate.toDateString() === new Date().toDateString()
            || (lastCheckInDate.getMonth() === new Date().getMonth() &&
              new Date().getHours() <= 6 && lastCheckInDate.getHours() >= 6))) {
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
  var start = new Date(checkInTime)
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
        showModal(name + " Check out succeeded")
      },
      fail: function (res) {
        showModal(name + " Check out failed")
      }
    })
}

function submitCheckIn(name, email, admin) {
  db.collection(dbName).where({
    name: name,
    date: new Date().toLocaleDateString(),
    checkOutTime: ""
  }).get({
    success: function (res) {
      if (res.data.length == 0) {
        addCheckinData(name, email, admin)
      } else {
        showModal('Already Check in')
      }
    },
    fail: function (res) {
      showModal(res.errMsg)
    }
  })
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

Page({
  data: {
    userInfo: "",
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    title: "UWCTA 自习打卡",
    description: "请注意这是测试版，check in 和check out的时候名字必须完全match，邮箱为optional 可以填也可以不填，之后源表格就会变成只读状态，打卡只可以从这个小程序进行",
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