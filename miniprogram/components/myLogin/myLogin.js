// components/myLogin/myLogin.js
const app=getApp();
Component({
  attached:function(){
    console.log(this.dataset);
    let isLogin=this.dataset.islogin;
    let user=this.dataset.user
    this.setData({
      isLogin: isLogin,
      user:user
    })
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isLogin: false,
    user: app.globalData.user,

    navBarHeight: app.globalData.navBarHeight,
    menuWidth: app.globalData.menuWidth,
    menuBottom: app.globalData.menuBottom,
  },

  /**
   * 组件的方法列表
   */
  methods: {
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

    navigateToMyStrategy: function (e) {
      let author = e.currentTarget.dataset.author;
      wx.navigateTo({
        url: '../myStrategy/myStrategy?author=' + author,
      })
    }
  }
})
