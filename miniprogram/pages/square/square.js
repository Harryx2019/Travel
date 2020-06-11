// miniprogram/pages/square/square.js
const app = getApp();
const db = wx.cloud.database();
const hotDestination = db.collection('indexDestination');
const strategyList = db.collection('strategy');
const userList = db.collection('user');
var page1 = 0; //推荐页面加载页面数
var page2 = 0; //同城页面加载页面数
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    user: {},

    recommend: true,
    school: false,

    //从用户信息获取待改进
    province: "北京",

    navBarHeight: app.globalData.navBarHeight,
    menuBottom: app.globalData.menuBottom,
    menuHeight: app.globalData.menuHeight,

    hotDestination: [],

    strategyList: [],
    like: "cloud://test-wusir.7465-test-wusir-1302022901/icon/greyLike.png",
    beLike: 'cloud://test-wusir.7465-test-wusir-1302022901/icon/like.png',
    comment: "cloud://test-wusir.7465-test-wusir-1302022901/icon/comment.png",

    peopleList: [],
    strategyListOfSame: [],

    showAll1: false,
    showAll2: false,
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
    let province = e.currentTarget.dataset.province;
    let city = e.currentTarget.dataset.city;
    wx.navigateTo({
      url: '../strategy/strategy?province=' + province + '&city=' + city,
    })
  },
  navigateToDetail: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../strategyDetail/strategyDetail?id=' + id
    })
  },
  navigateToMyStrategy: function (e) {
    let author = e.currentTarget.dataset.author;
    wx.navigateTo({
      url: '../myStrategy/myStrategy?author=' + author
    })
  },

  changePage: function (e) {
    let page = '';
    if (e == 'mySchool') {
      page = '同城'
    } else {
      page = e.currentTarget.dataset.page;
    }

    if (page == '同城') {
      let that = this;
      let isQulified = this.data.isQulified;
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
        this.setData({
          recommend: false,
          school: true
        });
        //只有在第一次加载同城页面才会获取数组信息
        if (this.data.strategyListOfSame.length == 0) {
          let userFollowList = this.data.userFollowList;
          let userLikeList = this.data.userLikeList;

          strategyList.orderBy('id', 'desc').limit(5).where({
            province: this.data.province
          }).get({
            success: res => {
              let strategyTempList = res.data;
              let length = strategyTempList.length;
              if (length == 0) {
                this.setData({
                  showAll2: true
                })
              } else {
                for (let i = 0; i < length; i++) {
                  let contentLength = strategyTempList[i].content.length;
                  if (contentLength > 100) {
                    strategyTempList[i].showTotalBtn = true;
                    strategyTempList[i].ellipsis = true;
                    strategyTempList[i].totalBtnText = '全文';
                    let likeNum = strategyTempList[i].likeNum;
                    likeNum = likeNum.reverse();
                    strategyTempList[i].likeNum = likeNum;

                    let author = strategyTempList[i].author;
                    let id = strategyTempList[i].id;
                    strategyTempList[i].beFollow = false;
                    strategyTempList[i].beLike = false;
                    for (let j in userFollowList) {
                      if (author == userFollowList[j]) {
                        strategyTempList[i].beFollow = true;
                      }
                    }
                    for (let j in userLikeList) {
                      if (id == userLikeList[j]) {
                        strategyTempList[i].beLike = true;
                      }
                    }
                  }
                }
                this.setData({
                  strategyListOfSame: strategyTempList
                })
              }
            }
          });
        }
      }
    } else {
      this.setData({
        recommend: true,
        school: false
      })
    }
  },
  showTotal: function (e) {
    var id = e.currentTarget.dataset.id;
    var flag = e.currentTarget.dataset.ellipsis;

    var strategyList;
    var listName = '';
    if (this.data.recommend == true) {
      strategyList = this.data.strategyList;
      listName = 'strategyList';
    } else {
      strategyList = this.data.strategyListOfSame;
      listName = 'strategyListOfSame';
    }
    var length = strategyList.length;
    for (var i = 0; i < length; i++) {
      if (strategyList[i].id == id) {
        let ellipsis = listName + '[' + i + '].ellipsis';
        let totalBtnText = listName + '[' + i + '].totalBtnText';
        if (flag) {
          this.setData({
            [ellipsis]: false,
            [totalBtnText]: '收起'
          })
        } else {
          this.setData({
            [ellipsis]: true,
            [totalBtnText]: '全文'
          })
        }
        break;
      }
    }
  },
  follow: function (e) {
    if (this.data.isLogin == false) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    let i = e.currentTarget.dataset.id;
    let strategy = {};
    if(this.data.recommend){
      strategy = this.data.strategyList[i];
    }else if(this.data.school){
      strategy = this.data.strategyListOfSame[i];
    }
    let user = this.data.user.nickName
    let userId = "";
    let author = strategy.author
    let authorId = "";

    if (strategy.beFollow == false) {
      let strategyBeFollow = "";
      if(this.data.recommend){
        strategyBeFollow = "strategyList[" + i + "].beFollow"
      }else if(this.data.school){
        strategyBeFollow = "strategyListOfSame[" + i + "].beFollow"
      }
      this.setData({
        [strategyBeFollow]: true
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
      let followList = [];
      let beFollowedList = [];
      let strategyBeFollow = "";
      if(this.data.recommend){
        strategyBeFollow = "strategyList[" + i + "].beFollow"
      }else if(this.data.school){
        strategyBeFollow = "strategyListOfSame[" + i + "].beFollow"
      }
      this.setData({
        [strategyBeFollow]: false
      });
      userList.where({
        nickName: user
      }).get().then(res => {
        userId = res.data[0]._id;
        followList = res.data[0].followList;
        let followNum = followList.length;
        let i;
        if (followNum == 1) {
          followList = [];
        } else {
          for (i = 0; i < followNum - 1; i++) {
            if (followList[i] == author) {
              break;
            }
          }
          for (; i < followNum - 1; i++) {
            followList[i] = followList[i + 1];
          }
          followList.pop();
        }
        userList.where({
          nickName: author
        }).get().then(res => {
          authorId = res.data[0]._id;
          beFollowedList = res.data[0].beFollowedList;
          let beFollowNum = beFollowedList.length;
          let i;
          if (beFollowNum == 1) {
            beFollowedList = [];
          } else {
            for (i = 0; i < beFollowNum - 1; i++) {
              if (beFollowedList[i] == user) {
                break;
              }
            }
            for (; i < beFollowNum - 1; i++) {
              beFollowedList[i] = beFollowedList[i + 1];
            }
            beFollowedList.pop();
          }

          wx.cloud.callFunction({
            name: 'updateUserOfUnFollow',
            data: {
              _id: userId,
              followList: followList
            },
            success: function (res) {
              console.log(res);
            }
          });
          wx.cloud.callFunction({
            name: 'updateUserOfUnBeFollowed',
            data: {
              _id: authorId,
              beFollowedList: beFollowedList
            },
            success: function (res) {
              console.log(res);
            }
          });
        });
      });
    }
  },
  like: function (e) {
    if (this.data.isLogin == false) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    let i = e.currentTarget.dataset.id;
    let strategy = {};
    if(this.data.recommend){
      strategy = this.data.strategyList[i];
    }else if(this.data.school){
      strategy = this.data.strategyListOfSame[i];
    }
    let _id = strategy._id;
    let id = strategy.id;
    if (strategy.beLike == false) {
      let strategyBeLike='';
      let strategyLikeNum='';
      if(this.data.recommend){
        strategyBeLike = "strategyList[" + i + "].beLike";
        strategyLikeNum = "strategyList[" + i + "].likeNum";
      }else if(this.data.school){
        strategyBeLike = "strategyListOfSame[" + i + "].beLike";
        strategyLikeNum = "strategyListOfSame[" + i + "].likeNum";
      }
      let likeNum = strategy.likeNum;
      likeNum.unshift(this.data.user.nickName);
      this.setData({
        [strategyBeLike]: true,
        [strategyLikeNum]: likeNum
      });
      wx.cloud.callFunction({
        name: "strategyLike",
        data: {
          _id: _id,
          user: this.data.user.nickName
        },
        success: function (res) {
          console.log(res);
        }
      });
      userList.where({
        nickName: this.data.user.nickName
      }).get().then(res => {
        wx.cloud.callFunction({
          name: 'updateUserOfStrategyLike',
          data: {
            _id: res.data[0]._id,
            strategyId: id
          },
          success: function (res) {
            console.log(res);
          }
        })
      })
    } else {
      let strategyBeLike='';
      let strategyLikeNum='';
      if(this.data.recommend){
        strategyBeLike = "strategyList[" + i + "].beLike";
        strategyLikeNum = "strategyList[" + i + "].likeNum";
      }else if(this.data.school){
        strategyBeLike = "strategyListOfSame[" + i + "].beLike";
        strategyLikeNum = "strategyListOfSame[" + i + "].likeNum";
      }

      let likeList = strategy.likeNum;
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
      this.setData({
        [strategyBeLike]: false,
        [strategyLikeNum]: likeList
      });
      wx.cloud.callFunction({
        name: 'strategyUnlike',
        data: {
          _id: _id,
          likeList: likeList
        },
        success: function (res) {
          console.log(res);
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
            if (likeStrategyList[i] == strategy.id) {
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
    let mySchoolProvince = app.globalData.mySchoolProvince;
    if (mySchoolProvince != undefined) {
      this.setData({
        province: mySchoolProvince
      });
      this.changePage('mySchool');
    }
    let isLogin = app.globalData.isLogin;
    let user = app.globalData.user;
    if (isLogin) {
      userList.where({
        nickName: user.nickName
      }).get().then(res => {
        this.setData({
          user: res.data[0],
          isLogin: true,
          province: res.data[0].province,
          isQulified: res.data[0].isQulified
        })
      })
    } else {
      wx.showToast({
        title: '未登录,请先登录',
        icon: 'none',
        duration: 2000,
        complete: function () {
          wx.switchTab({
            url: '../my/my'
          })
        }
      })
    }
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 2000
    })

    let userFollowList = [];
    let userLikeList = [];
    //用户关注的作者、收藏的攻略
    userList.where({
      nickName: user.nickName
    }).get().then(res => {
      userLikeList = res.data[0].likeStrategyList;
      userFollowList = res.data[0].followList;
      this.setData({
        userLikeList: userLikeList,
        userFollowList: userFollowList
      })
    });
    //热门目的地
    hotDestination.limit(4).get({
      success: res => {
        this.setData({
          hotDestination: res.data
        })
      }
    });
    //今日红人榜
    userList.limit(10).get({
      success: res => {
        let peopleList = [];
        for (let i = 0; i < 10; i++) {
          let list = {};
          list.id = res.data[i]._id;
          list.author = res.data[i].nickName;
          list.authorImg = res.data[i].avatarUrl;
          peopleList.push(list);
        };
        this.setData({
          peopleList: peopleList
        })
      }
    });

    strategyList.orderBy('id', 'desc').limit(5).get({
      success: res => {
        let strategyTempList = res.data;
        for (let i = 0; i < 5; i++) {
          let contentLength = strategyTempList[i].content.length;
          if (contentLength > 100) {
            strategyTempList[i].showTotalBtn = true;
            strategyTempList[i].ellipsis = true;
            strategyTempList[i].totalBtnText = '全文';
          }
          let likeNum = strategyTempList[i].likeNum;
          likeNum = likeNum.reverse();
          strategyTempList[i].likeNum = likeNum;

          let author = strategyTempList[i].author;
          let id = strategyTempList[i].id;
          strategyTempList[i].beFollow = false;
          strategyTempList[i].beLike = false;
          for (let j in userFollowList) {
            if (author == userFollowList[j]) {
              strategyTempList[i].beFollow = true;
            }
          }
          for (let j in userLikeList) {
            if (id == userLikeList[j]) {
              strategyTempList[i].beLike = true;
            }
          }
        }
        this.setData({
          strategyList: strategyTempList
        })
      }
    });
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
    var page;
    if (this.data.recommend == true) {
      page1++;
      page = page1;
      strategyList.orderBy('id', 'desc').skip(5 * page).limit(5).get({
        success: res => {
          let oldData = this.data.strategyList;
          let strategyTempList = res.data;
          if (strategyTempList.length == 0) {
            this.setData({
              showAll1: true
            })
          } else {
            for (let i = 0; i < 5; i++) {
              let contentLength = strategyTempList[i].content.length;
              if (contentLength > 100) {
                strategyTempList[i].showTotalBtn = true;
                strategyTempList[i].ellipsis = true;
                strategyTempList[i].totalBtnText = '全文';
              }
              let likeNum = strategyTempList[i].likeNum;
              likeNum = likeNum.reverse();
              strategyTempList[i].likeNum = likeNum;
            }
            this.setData({
              strategyList: oldData.concat(strategyTempList)
            })
          }
        }
      })
    } else {
      page2++;
      page = page2;
      strategyList.orderBy('id', 'desc').skip(5 * page).limit(5).where({
        province: this.data.province
      }).get({
        success: res => {
          let oldData = this.data.strategyListOfSame;
          let strategyTempList = res.data;
          let length = strategyTempList.length;
          if (length == 0) {
            this.setData({
              showAll2: true
            })
          } else {
            for (let i = 0; i < length; i++) {
              let contentLength = strategyTempList[i].content.length;
              if (contentLength > 100) {
                strategyTempList[i].showTotalBtn = true;
                strategyTempList[i].ellipsis = true;
                strategyTempList[i].totalBtnText = '全文';
              }
            }
            this.setData({
              strategyListOfSame: oldData.concat(strategyTempList)
            })
          }
        }
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})