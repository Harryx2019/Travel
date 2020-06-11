// miniprogram/pages/my/my.js
const app = getApp();
const db = wx.cloud.database();
const myNavigate = db.collection('myNavigate');
const userList = db.collection('user');
const teamList = db.collection('team');
const applyTeamList = db.collection('applyTeam');
const guideList = db.collection('guide');
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

        if (res.data.length == 0) {
          user.nickName = userInfo.nickName;
          user.avatarUrl = userInfo.avatarUrl;

          if (userInfo.gender == 1) {
            user.sex = 'male';
          } else {
            user.sex = 'female';
          }
          user.province = userInfo.province;
          user.city = userInfo.city;
          user.isQulified = 0;
          this.setData({
            user: user,
            isLogin: true
          });
          app.globalData.isLogin = true;
          app.globalData.user = user;

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
        } else {
          user = res.data[0];
          this.setData({
            user: user,
            isLogin: true
          });
        }
      }
    })
  },

  navigateTo: function (e) {
    let user = this.data.user;
    //首先判断用户是否登录
    if (this.data.isLogin == false) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
    } else if (user.isQulified == 0) {
      //判断用户是否进行学校认证
      wx.showModal({
        title: '尚未进行学校认证',
        content: '请前往认证页面进行学校认证，需要提供您的个人信息及学生证照片，是否前往认证？',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../qualifySchool/qualifySchool?_id=' + user._id,
            })
          }
        }
      })
    } else if (user.isQulified == 2) {
      wx.showToast({
        title: '学校认证信息已提交，请耐心等待审核！',
        icon: 'none',
        duration: 2000
      })
    } else if (user.isQulified == 1) {
      let that = this;
      let page = e.currentTarget.dataset.page;
      if (page == 'mySchool') {
        app.globalData.mySchoolProvince = this.data.user.province;
        wx.switchTab({
          url: '../square/square'
        })
      } else if (page == 'myZone') {
        wx.navigateTo({
          url: '../myStrategy/myStrategy?author=' + this.data.user.nickName
        })
      } else if (page == 'myStrategy') {
        wx.navigateTo({
          url: '../myStrategy/myStrategy?author=' + this.data.user.nickName+'&my='+true
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
                      //用户申请的小队
                      applyTeamList.where({
                        applyNickName: userInfo.nickName
                      }).get().then(res => {
                        let myApplyTeam = res.data;
                        if (myApplyTeam.length == 0) {
                          wx.showToast({
                            title: '您目前尚未创建小队或者加入小队，是否创建或加入小队？',
                            icon: 'none',
                            duration: 2000
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
                                  url: '../team/team?province=' + that.data.user.province + '&city=' + that.data.user.city,
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
        let that = this;
        //查询用户是否创建小队
        teamList.where({
          teamHeader: this.data.user.nickName
        }).get().then(res => {
          if (res.data.length == 0) {
            wx.showModal({
              title: '创建小队',
              content: '您暂未创建小队哦，是否立即创建小队？',
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../createTeam/createTeam?nickName=' + that.data.user.nickName,
                  })
                }
              }
            })
          } else {
            wx.navigateTo({
              url: '../manageTeam/manageTeam',
            })
          }
        })
      } else if (page == 'manageGuide') {
        let that = this;
        //查询用户是否注册导游
        guideList.where({
          guideNickName: this.data.user.nickName
        }).get().then(res => {
          if (res.data.length == 0) {
            wx.showModal({
              title: '注册导游',
              content: '你还不是导游哦，是否申请成为导游？',
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../applyGuide/applyGuide?nickName=' + that.data.user.nickName,
                  })
                }
              }
            })
          } else {
            let guideStatus = res.data[0].guideStatus;
            if (guideStatus == 0) {
              wx.showToast({
                title: '您已提交导游申请，请耐心等待审核',
                icon: 'none',
                duration: 2000
              })
            } else {
              wx.navigateTo({
                url: '../manageGuide/manageGuide',
              })
            }
          }
        })
      } else if (page == 'publicStrategy') {
        wx.navigateTo({
          url: '../publicStrategy/publicStrategy?author=' + this.data.user.nickName+'&my='+true
        })
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let isLogin = app.globalData.isLogin;
    if (isLogin) {
      userList.where({
        nickName: app.globalData.user.nickName
      }).get({
        success: res => {
          let user = res.data[0];
          this.setData({
            user: user,
            isLogin: true
          });
        }
      })
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