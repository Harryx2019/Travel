// miniprogram/pages/search/search.js
const db=wx.cloud.database();
const searchDestination=db.collection('indexDestination');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bgcUrl:"http://b1-q.mafengwo.net/s7/M00/8A/4D/wKgB6lS4tbaAXdU4AC1nXOLC8vQ72.jpeg?imageMogr2%2Fthumbnail%2F%21640x400r%2Fgravity%2FCenter%2Fcrop%2F%21640x400%2Fquality%2F90",
    searchUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/search.png",

    // 推荐城市
    destinationList :[]
  },

  searchTo:function(e){
    let city=e.detail.value;
    wx.navigateTo({
      url: '../strategy/strategy?city='+city
    })
  },
  navigateTo:function(e){
    let city=e.currentTarget.dataset.city;
    let province=e.currentTarget.dataset.province;
    wx.navigateTo({
      url: '../strategy/strategy?city=' + city+'&province='+province
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    searchDestination.skip(2).get({
      success:res=>{
        this.setData({
          destinationList: res.data
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