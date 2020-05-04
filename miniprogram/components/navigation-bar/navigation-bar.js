const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // defaultData（父页面传递的数据-就是引用组件的页面）
    defaultData: {
      type: Object,
      value: {
        title: "我是默认标题"
      },
      observer: function(newVal, oldVal) {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    menuRight: app.globalData.menuRight,
    menuBottom: app.globalData.menuBottom,
    menuHeight: app.globalData.menuHeight,

    iconUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/search.png",
    iconWidth: app.globalData.menuHeight-10,
    iconLeft: app.globalData.menuRight+10,
    iconBottom: app.globalData.menuBottom+5
  },

  /**
   * 组件的方法列表
   */
  methods: {
    
  }
})