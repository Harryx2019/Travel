// miniprogram/pages/startegyDetail/strategyDetail.js
const app = getApp();
const db = wx.cloud.database();
const strategyList = db.collection('strategy');
const userList = db.collection('user');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    user: {},
    navBarHeight: app.globalData.navBarHeight,
    menuWidth: app.globalData.menuWidth,
    menuBottom: app.globalData.menuBottom,
    strategy: {},

    like: false,
    follow: false,
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
  navigateTo: function (e) {
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
  follow: function () {
    let user = this.data.user.nickName
    let userId = "";
    let author = this.data.strategy[0].author
    let authorId = "";

    if (this.data.follow == false) {
      if (this.data.isLogin == false) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      this.setData({
        follow: true
      });
      userList.where({
        nickName: user
      }).get().then(res => {
        userId = res.data[0]._id;
        userList.where({
          nickName: author
        }).get().then(res => {
          authorId = res.data[0]._id;
          wx.cloud.callFunction({
            name: 'updateUserOfFollow',
            data: {
              _id: userId,
              nickName: author
            },
            success: function (res) {
              console.log(res);
            }
          });
          wx.cloud.callFunction({
            name: 'updateUserOfBeFollowed',
            data: {
              _id: authorId,
              nickName: user
            },
            success: function (res) {
              console.log(res);
            }
          })
        });
      });
    } else {
      let followList=[];
      let beFollowedList=[];
      this.setData({
        follow: false
      });
      userList.where({
        nickName: user
      }).get().then(res => {
        userId = res.data[0]._id;
        followList=res.data[0].followList;
        let followNum=followList.length;
        let i;
        if(followNum==1){
          followList=[];
        }else{
          for(i=0;i<followNum-1;i++){
            if(followList[i]==author){
              break;
            }
          }
          for(;i<followNum-1;i++){
            followList[i]=followList[i+1];
          }
          followList.pop();
        }
        userList.where({
          nickName: author
        }).get().then(res => {
          authorId = res.data[0]._id;
          beFollowedList=res.data[0].beFollowedList;
          let beFollowNum=beFollowedList.length;
          let i;
          if(beFollowNum==1){
            beFollowedList=[];
          }else{
            for(i=0;i<beFollowNum-1;i++){
              if(beFollowedList[i]==user){
                break;
              }
            }
            for(;i<beFollowNum-1;i++){
              beFollowedList[i]=beFollowedList[i+1];
            }
            beFollowedList.pop();
          }

          wx.cloud.callFunction({
            name:'updateUserOfUnFollow',
            data:{
              _id: userId,
              followList: followList
            },
            success: function(res){
              console.log(res);
            }
          });
          wx.cloud.callFunction({
            name:'updateUserOfUnBeFollowed',
            data:{
              _id: authorId,
              beFollowedList: beFollowedList
            },
            success: function(res){
              console.log(res);
            }
          });
        });
      });
    }
  },
  like: function () {
    if (this.data.isLogin == false) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    let that = this;
    let id = this.data.strategy[0]._id
    if (this.data.like == false) {
      that.setData({
        like: true
      })
      wx.cloud.callFunction({
        name: "strategyLike",
        data: {
          _id: id,
          user: this.data.user.nickName
        },
        success: function (res) {
          console.log(res);
          strategyList.limit(1).where({
            _id: id
          }).get().then(res => {
            that.setData({
              strategy: res.data
            })
          })
        }
      });
      userList.where({
        nickName: this.data.user.nickName
      }).get().then(res => {
        wx.cloud.callFunction({
          name: 'updateUserOfStrategyLike',
          data: {
            _id: res.data[0]._id,
            strategyId: this.data.strategy[0].id
          },
          success: function (res) {
            console.log(res);
          }
        })
      })
    } else {
      that.setData({
        like: false
      })
      let likeList = this.data.strategy[0].likeNum;
      let length = likeList.length;
      if (length == 1) {
        likeList = [];
      } else {
        let i;
        for (i = 0; i < length - 1; i++) {
          if (likeList[i] == this.data.user.nickName) {
            break;
          }
        }
        for (; i < length - 1; i++) {
          likeList[i] = likeList[i + 1];
        }
        likeList.pop();
      }
      wx.cloud.callFunction({
        name: 'strategyUnlike',
        data: {
          _id: id,
          likeList: likeList
        },
        success: function (res) {
          console.log(res);
          strategyList.limit(1).where({
            _id: id
          }).get({
            success: res => {
              that.setData({
                strategy: res.data
              })
            }
          })
        }
      })

      //更改用户收藏列表
      userList.where({
        nickName: this.data.user.nickName
      }).get().then(res => {
        let likeStrategyList = res.data[0].likeStrategyList;
        let length = likeStrategyList.length;
        if (length == 1) {
          likeStrategyList = [];
        } else {
          let i;
          for (i = 0; i < length - 1; i++) {
            if (likeStrategyList[i] == this.data.strategy[0].id) {
              break;
            }
          }
          for (; i < length - 1; i++) {
            likeStrategyList[i] = likeStrategyList[i + 1];
          }
          likeStrategyList.pop();
        }
        wx.cloud.callFunction({
          name: "updateUserOfStrategyUnlike",
          data: {
            _id: res.data[0]._id,
            likeStrategyList: likeStrategyList
          },
          success: function (res) {
            console.log(res);
          }
        })
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id;
    let isLogin = app.globalData.isLogin;
    let user = {};
    if (isLogin) {
      user = app.globalData.user
      this.setData({
        isLogin: true,
        user: user
      })
    }
    //获取攻略id号
    strategyList.limit(1).where({
      _id: id
    }).get({
      success: res => {
        let strategy = res.data[0];
        //判断用户是否收藏
        let likeList = res.data[0].likeNum;
        let length = likeList.length;
        for (let i = 0; i < length; i++) {
          if (likeList[i] == user.nickName) {
            this.setData({
              like: true
            })
          }
        }
        //判断用户是否关注
        userList.where({
          nickName: user.nickName
        }).get().then(res => {
          let followList = res.data[0].followList;
          let length = followList.length;
          for (let i = 0; i < length; i++) {
            if (followList[i] == strategy.author) {
              this.setData({
                follow: true
              })
            }
          }
        })
        this.setData({
          strategy: res.data
        })
        wx.cloud.callFunction({
          name: 'strategyView',
          data: {
            _id: id,
            viewNum: res.data[0].viewNum + 1
          },
          success: function (res) {
            console.log(res);
          }
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