// miniprogram/pages/my/my.js
const app = getApp();
const db = wx.cloud.database();
const myNavigate = db.collection('myNavigate');
const userList = db.collection('user');
const teamList = db.collection('team');
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

  qualifySchool: function (userInfo) {
    let isQulified = userInfo.isQulified;
    if (isQulified == 0) {
      wx.showModal({
        title: '尚未进行学校认证',
        content: '请前往认证页面进行学校认证，需要提供您的个人信息及学生证照片，是否前往认证？',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../qualifySchool/qualifySchool?_id=' + userInfo._id,
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
    } else {
      app.globalData.mySchoolProvince = this.data.user.province;
      wx.switchTab({
        url: '../square/square'
      })
    }
  },
  navigateTo: function (e) {
    let page = e.currentTarget.dataset.page;
    if (page == 'mySchool') {
      userList.where({
        nickName: this.data.user.nickName
      }).get({
        success: res => {
          let userInfo = res.data[0];
          this.qualifySchool(userInfo);
        }
      })
    } else if (page == 'myStrategy') {
      wx.navigateTo({
        url: '../myStrategy/myStrategy?author=' + this.data.user.nickName
      })
    } else if (page == 'myStore') {
      wx.navigateTo({
        url: '../myStrategy/myStrategy?author=' + this.data.user.nickName + '&myStore=' + 'true'
      })
    } else if (page == 'myTeam') {
      //我加入的小队
      userList.where({
        nickName: this.data.user.nickName
      }).get({
        success: res => {
          let userInfo = res.data[0];
          if (userInfo.isQulified != 1) {
            this.qualifySchool(userInfo);
          } else {
            let myJoinTeam = userInfo.joinTeamId;
            if (myJoinTeam == "") {
              //我创建的小队
              teamList.where({
                teamHeader: userInfo.nickName
              }).get({
                success: res => {
                  let myCreateTeam = res.data;
                  if (myCreateTeam.length == 0) {
                    wx.showToast({
                      title: '您目前尚未创建小队或者加入小队，是否创建或加入小队？',
                      icon: 'none',
                      duration: 5000
                    })
                    wx.showActionSheet({
                      itemList: ['加入小队', '创建小队'],
                      success(res) {
                        if (res.tapIndex == 1) {
                          wx.navigateTo({
                            url: '../createTeam/createTeam?nickName=' + userInfo.nickName,
                          })
                        } else {
                          wx.navigateTo({
                            url: '../team/team?province=' + this.data.user.province + '&city=' + this.data.user.city,
                          })
                        }
                      },
                      fail(res) {
                        console.log(res.errMsg)
                      }
                    })
                  } else {
                    wx.navigateTo({
                      url: '../myTeam/myTeam?nickName=' + userInfo.nickName,
                    })
                  }
                }
              })
            } else {
              wx.navigateTo({
                url: '../myTeam/myTeam?nickName=' + userInfo.nickName,
              })
            }
          }
        }
      })
    } else if (page == 'manageTeam') {
      wx.navigateTo({
        url: '../manageTeam/manageTeam',
      })
    }
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