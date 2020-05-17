// miniprogram/pages/viewDetail/viewDetail.js
const app = getApp();
const db = wx.cloud.database();
const viewList = db.collection('view');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,

    view: {},
    viewDes: [],
    starIcon: "cloud://test-wusir.7465-test-wusir-1302022901/icon/star.png",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let id = options.id;
    viewList.limit(1).where({
      _id: id
    }).get({
      success: res => {
        let content = res.data[0].viewDes.split('·');
        if (content[0] == '') {
          content.shift();
        }
        this.setData({
          view: res.data,
          viewDes: content
        });
      }
    });
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