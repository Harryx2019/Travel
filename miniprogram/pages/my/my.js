// miniprogram/pages/my/my.js
const app = getApp();
const db = wx.cloud.database();
const myNavigate = db.collection('myNavigate');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,

    user: {},
    isLogin: false,

    navigateList: {}
  },

  getUserInfo: function (e) {
    let userInfo = e.detail.userInfo;
    let user = {};
    user.nickName = userInfo.nickName;
    user.avatarUrl = userInfo.avatarUrl;

    if (userInfo.gender == 1) {
      user.sex = 'male';
    } else {
      user.sex = 'female';
    }
    user.province = userInfo.province;
    user.city = userInfo.city;
    this.setData({
      user: user,
      isLogin: true
    });
    app.globalData.isLogin = true;
    app.globalData.user = user;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let isLogin = app.globalData.isLogin;
    if (isLogin) {
      let user = app.globalData.user;
      this.setData({
        user: user,
        isLogin: true
      });
    }

    myNavigate.get({
      success: res => {
        this.setData({
          navigateList: res.data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})