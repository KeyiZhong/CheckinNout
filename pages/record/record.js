// pages/record/record.js
const dbName = 'check_in_check_out'
wx.cloud.init()
const db = wx.cloud.database()
const _ = db.command
const $ = db.command.aggregate

Page({

  /**
   * Page initial data
   */
  data: {
    title:"Total time",
    description: "输入名字已查看此人总共的学习时间"
  },
  check: function(e) {
    var searchName=e.detail.value.name
    db.collection(dbName).where({
      name:searchName
    }).get({
      success: function(res) {
        var total = 0
        for(var i = 0; i < res.data.length; i++) {
          total += res.data[i].studyTime
        }
        wx.showModal({
          title: 'Total study time',
          content: total + " minutes",
        })
      }
    })
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})