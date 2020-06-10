// miniprogram/pages/index/index.js
const app = getApp();
const db = wx.cloud.database();
const userList = db.collection('user');
const indexNavigate = db.collection('indexNavigate');
const indexDestination = db.collection('indexDestination');
const indexStrategy = db.collection('strategy');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    isLogin: false,
    swiperImg: [
      "cloud://test-wusir.7465-test-wusir-1302022901/image/indexSwiper1.jpeg",
      "cloud://test-wusir.7465-test-wusir-1302022901/image/indexSwiper2.png",
      "cloud://test-wusir.7465-test-wusir-1302022901/image/indexSwiper3.jpg"
    ],

    //搜索框参数
    navBarHeight: app.globalData.navBarHeight,
    menuTop: app.globalData.navBarHeight - app.globalData.menuBottom - app.globalData.menuHeight,
    menuHeight: app.globalData.menuHeight,
    menuWidth: app.globalData.menuWidth,
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
          isLogin: true,
          isQulified: 0
        });
        app.globalData.isLogin = true;
        app.globalData.user = user;
      }
    })
  },

  navigateTo: function (e) {
    let page = e.currentTarget.dataset.page;
    let isQulified = this.data.isQulified;
    let city = e.currentTarget.dataset.city;
    let province = e.currentTarget.dataset.province;
    let district = e.currentTarget.dataset.district;
    if (page == 'team' || page == 'guide') {
      let that=this;
      //小队页面和导游页面需要登录并且进行学校认证
      if (this.data.isLogin == false) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
      } else if (isQulified == 0) {
        //判断用户是否进行学校认证
        wx.showModal({
          title: '尚未进行学校认证',
          content: '请前往认证页面进行学校认证，需要提供您的个人信息及学生证照片，是否前往认证？',
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../qualifySchool/qualifySchool?_id=' + that.data.user._id,
              })
            }
          }
        })
      } else if (isQulified == 2) {
        wx.showToast({
          title: '学校认证信息已提交，请耐心等待审核！',
          icon: 'none',
          duration: 2000
        })
      } else if (isQulified == 1) {
        wx.navigateTo({
          url: '../' + page + '/' + page + '?province=' + province + '&city=' + city + '&district' + district
        })
      }
    } else {
      wx.navigateTo({
        url: '../' + page + '/' + page + '?province=' + province + '&city=' + city + '&district' + district
      })
    }
  },

  // 跳转攻略详情页
  navigateToDetail: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../strategyDetail/strategyDetail?id=' + id
    })
  },

  navigateToMyStrategy: function (e) {
    let author = e.currentTarget.dataset.author;
    wx.navigateTo({
      url: '../myStrategy/myStrategy?author=' + author,
    })
  },

  onPageScroll: function (res) {
    if (res.scrollTop >= 130) {
      this.setData({
        searchBackgroundColor: "white",
        inputBackgroundColor: "rgb(245,245,245)"
      })
    } else {
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
    //获取用户信息
    let that = this;
    wx.getSetting({
      success(res) {
        var statu = res.authSetting;
        if (statu['scope.userInfo']) {
          let user = app.globalData.user;
          that.setData({
            user: user
          })
          userList.where({
            nickName: user.nickName
          }).get().then(res => {
            that.setData({
              user: res.data[0],
              isLogin: true,
              isQulified: res.data[0].isQulified
            });
          })
          app.globalData.isLogin = true;
        }
      }
    });
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 3000
    })
    // 获取用户位置信息
    var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
    var qqmapsdk = new QQMapWX({
      key: 'VVWBZ-AJA3I-3T2GW-5ZLKT-MPXCE-OVB2D'
    });
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function (res) {
            var province = res.result.address_component.province;
            var city = res.result.address_component.city;
            var district = res.result.address_component.district;

            that.setData({
              province: province,
              city: city,
              district: district
            })
          }
        })
      },
    });

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

    indexStrategy.skip(5).limit(5).get({
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