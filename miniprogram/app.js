//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {
      navBarHeight: 0, // 导航栏高度
      menuRight: 0, // 胶囊距右方间距（方保持左、右间距一致）
      menuBottom: 0, // 胶囊距底部间距（保持底部间距一致）
      menuHeight: 0, // 胶囊高度（自定义内容可与胶囊高度保证一致）,

      windowHeight: 0,//屏幕高度
    }

    const that=this;
    //获取系统信息
    const systemInfo=wx.getSystemInfoSync();
    //胶囊按钮位置信息
    const menuButtonInfo=wx.getMenuButtonBoundingClientRect();
    // 导航栏高度 = 状态栏到胶囊的间距（胶囊距上距离-状态栏高度） * 2 + 胶囊高度 + 状态栏高度
    that.globalData.navBarHeight=(menuButtonInfo.top - systemInfo.statusBarHeight)*2+menuButtonInfo.height+systemInfo.statusBarHeight;
    that.globalData.menuRight=systemInfo.screenWidth-menuButtonInfo.right;
    that.globalData.menuBottom=menuButtonInfo.top-systemInfo.statusBarHeight;
    that.globalData.menuHeight=menuButtonInfo.height;

    that.globalData.windowHeight=systemInfo.windowHeight;
  }
})
