// miniprogram/pages/index/index.js
const app = getApp();
const db = wx.cloud.database();
const indexNavigate = db.collection('indexNavigate');
const indexDestination = db.collection('indexDestination');
const indexStrategy = db.collection('strategy');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    swiperImg: [
      "https://images.pexels.com/photos/130111/pexels-photo-130111.jpeg?auto=compress&amp;cs=tinysrgb&amp;h=750&amp;w=1260",
      "https://images.pexels.com/photos/2085998/pexels-photo-2085998.jpeg?auto=compress&amp;cs=tinysrgb&amp;h=750&amp;w=1260",
      "https://images.pexels.com/photos/1292843/pexels-photo-1292843.jpeg?auto=compress&amp;cs=tinysrgb&amp;h=750&amp;w=1260"
    ],

    //搜索框参数
    navBarHeight: app.globalData.navBarHeight,
    menuTop: app.globalData.navBarHeight - app.globalData.menuBottom - app.globalData.menuHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,
    searchBackgroundColor: "none",
    inputBackgroundColor: "rgb(255,255,255,0.5)",
    searchUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/search.png",

    //首页导航栏数组
    navigateList: [],

    //热门目的地数组
    destinationList: [],

    // 攻略游记数组
    viewIcon: "cloud://test-wusir.7465-test-wusir-1302022901/icon/view.png",
    likeIcon: "cloud://test-wusir.7465-test-wusir-1302022901/icon/like.png",
    strategyList: []

  },

  navigateTo: function (e) {
    let page = e.currentTarget.dataset.page;
    let city = e.currentTarget.dataset.city;
    let province= e.currentTarget.dataset.province;
    wx.navigateTo({
      url: '../' + page + '/' + page + '?province=' + province+ '&city=' + city
    })
  },

  onPageScroll: function (res) {
    if (res.scrollTop >= 130) {
      this.setData({
        searchBackgroundColor: "white",
        inputBackgroundColor: "rgb(245,245,245)"
      })
    }
    else {
      this.setData({
        searchBackgroundColor: "none",
        inputBackgroundColor: "rgb(255,255,255,0.5)"
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    indexNavigate.get({
      success: res => {
        this.setData({
          navigateList: res.data
        })
      }
    });

    indexDestination.limit(4).get({
      success: res => {
        this.setData({
          destinationList: res.data
        })
      }
    });

    indexStrategy.limit(5).get({
      success: res => {
        this.setData({
          strategyList: res.data
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