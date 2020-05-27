// miniprogram/pages/startegyDetail/strategyDetail.js
const app = getApp();
const db = wx.cloud.database();
const strategyList = db.collection('strategy')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin:false,
    user: {},
    navBarHeight: app.globalData.navBarHeight,
    menuWidth: app.globalData.menuWidth,
    menuBottom: app.globalData.menuBottom,
    strategy: {}
  },
  getUserInfo: function (e) {
    let userList = db.collection('user');
    userList.where({
      nickName: e.detail.userInfo.nickName
    }).get({
      success: res => {
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
        if (res.data.length == 0) {
          wx.cloud.callFunction({
            name: 'addUser',
            data: {
              nickName: user.nickName,
              avatarUrl: user.avatarUrl,
              sex: user.sex,
              province: user.province,
              city: user.city
            },
            success: function (res) {
              console.log(res);
            }
          })
        }
        this.setData({
          user: user,
          isLogin: true
        });
        app.globalData.isLogin = true;
        app.globalData.user = user;
      }
    })
  },
  navigateTo: function(e) {
    let city = e.currentTarget.dataset.city;
    wx.navigateTo({
      url: '../strategy/strategy?city=' + city + '&province=' + city
    })
  },
  navigateToMyStrategy: function (e) {
    let author = e.currentTarget.dataset.author;
    wx.navigateTo({
      url: '../myStrategy/myStrategy?author=' + author
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let isLogin = app.globalData.isLogin;
    if (isLogin) {
      this.setData({
        isLogin: true,
        user: app.globalData.user
      })
    }
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