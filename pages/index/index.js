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

function nameCannotBlank(s) {
  wx.showModal({
    title: '提示',
    content: s,
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

function addCheckinData(name, email) {
  db.collection(dbName).add({
    data: {
      name: name,
      email: email,
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

function addCheckoutData(id,checkInTime) {
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

function submitCheckIn(name, email) {
  db.collection(dbName).where({
    name: name,
    date: new Date().toLocaleDateString(),
    checkOutTime: ""
  }).get({
    success: function (res) {
      if(res.data.length == 0) {
        addCheckinData(name, email)
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

function submitCheckOut(name) {
  db.collection(dbName).where({
    name: name,
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
        addCheckoutData(id,checkInTime);
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

function submitSelfCheckIn(name) {
  db.collection(dbName).where({
    nickname: name,
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

function addSelfCheckinData(name, email) {
  db.collection(dbName).add({
    data: {
      nickname: name,
      email: email,
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

function submitSelfCheckOut(name) {
  db.collection(dbName).where({
    nickname: name,
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

Page({
  data: {
    userInfo: "",
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    title:"UWCTA 自习打卡",
    description: "请注意这是测试版，check in 和check out的时候名字必须完全match，邮箱为optional 可以填也可以不填，之后源表格就会变成只读状态，打卡只可以从这个小程序进行",
    currentTab: 0,
    pass:false,
    passwords:""
  },
  selfCheckIn:function(e) {
    var name = app.globalData.userInfo.nickname
    wx.getLocation({
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        if (odeLatitude > latitude - tolerance && odeLatitude < latitude + tolerance && odeLong > longitude - tolerance && odeLong < longitude + tolerance) {
          if (name == "") {
            nameCannotBlank("Name cannot be Blank")
          } else {
            submitSelfCheckIn(name)
            // wx.request(checkOut(e))
          }
        } else {
          notOde()
        }
      },
      altitude: false,
      fail: function (res) {
        cannotGetLocation();
      }
    })
  },
  selfCheckOut: function (e) {
    var name = app.globalData.userInfo.nickname
    wx.getLocation({
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        if (odeLatitude > latitude - tolerance && odeLatitude < latitude + tolerance && odeLong > longitude - tolerance && odeLong < longitude + tolerance) {
          if (name == "") {
            nameCannotBlank("Name cannot be Blank")
          } else {
            submitSelfCheckOut(name)
            // wx.request(checkOut(e))
          }
        } else {
          notOde()
        }
      },
      altitude: false,
      fail: function (res) {
        cannotGetLocation();
      }
    })
  },
  submitPass:function(e) {
    this.setData({
      pass:this.data.passwords == correct
    })
  }, 
  getPassword: function (e) {
    this.setData({
      passwords: e.detail.value
    })
  },
  clickTab: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
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
      }
    })
  },
  bindFormSubmit:function(e){
    wx.getLocation({
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        if (odeLatitude > latitude - tolerance && odeLatitude < latitude + tolerance && odeLong > longitude - tolerance && odeLong < longitude + tolerance) {
          if (e.detail.value.name == "") {
            nameCannotBlank()
          } else {
            submitCheckIn(e.detail.value.name.toLowerCase(), e.detail.value.email)
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
    wx.getLocation({
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        if (odeLatitude > latitude - tolerance && odeLatitude < latitude + tolerance && odeLong > longitude - tolerance && odeLong < longitude + tolerance) {
          if (e.detail.value.name == "") {
            nameCannotBlank()
          } else {
            submitCheckOut(e.detail.value.name.toLowerCase())
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