// components/search/search.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    menuBottom: app.globalData.menuBottom,
    menuHeight: app.globalData.menuHeight,

    backUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/back.png",
    searchUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/search.png",
    inputValue: ""
  },

  /**
   * 组件的方法列表
   */
  methods: {
    navigateBack :function(){
      wx.navigateBack({
        delta: 1
      })
    },
    
    navigateTo: function (e) {
      this.setData({
        inputValue: ""
      });
      let city = e.detail.value;
      wx.navigateTo({
        url: '../strategy/strategy?city=' + city +'&province=' + city
      })
    },
  }
})
