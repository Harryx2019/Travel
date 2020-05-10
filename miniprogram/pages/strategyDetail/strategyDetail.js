// miniprogram/pages/startegyDetail/strategyDetail.js
const app = getApp();
const db = wx.cloud.database();
const strategyList = db.collection('strategy')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    strategy: {}
  },

  navigateTo: function(e) {
    let city = e.currentTarget.dataset.city;
    wx.navigateTo({
      url: '../strategy/strategy?city=' + city + '&province=' + city
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取攻略id号
    let id = options.id;
    strategyList.limit(1).where({
      _id: id
    }).get({
      success: res => {
        this.setData({
          strategy: res.data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})