// miniprogram/pages/square/square.js
const app = getApp();
const db = wx.cloud.database();
const hotDestination = db.collection('indexDestination');
const strategyList = db.collection('strategy');
var page1 = 0; //推荐页面加载页面数
var page2 = 0; //同城页面加载页面数
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin:false,
    user:{},

    recommend: true,
    school: false,

    //从用户信息获取待改进
    city: "北京",

    navBarHeight: app.globalData.navBarHeight,
    menuBottom: app.globalData.menuBottom,
    menuHeight: app.globalData.menuHeight,

    hotDestination: [],

    strategyList: [],
    like: "cloud://test-wusir.7465-test-wusir-1302022901/icon/greyLike.png",
    comment: "cloud://test-wusir.7465-test-wusir-1302022901/icon/comment.png",

    peopleList: [],
    strategyListOfSame: [],

    showAll1: false,
    showAll2: false
  },
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
  navigateTo: function(e) {
    let province = e.currentTarget.dataset.province;
    let city = e.currentTarget.dataset.city;
    wx.navigateTo({
      url: '../strategy/strategy?province=' + province + '&city=' + city,
    })
  },
  navigateToDetail :function(e){
    let id=e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../strategyDetail/strategyDetail?id='+id
    })
  },
  navigateToMyStrategy :function(e){
    let author=e.currentTarget.dataset.author;
    wx.navigateTo({
      url: '../myStrategy/myStrategy?author='+author
    })
  },

  changePage: function(e) {
    let page = e.currentTarget.dataset.page;
    if (page == '同城') {
      this.setData({
        recommend: false,
        school: true
      });
      //只有在第一次加载同城页面才会获取数组信息
      if (this.data.strategyListOfSame.length == 0) {
        strategyList.limit(5).where({
          city: this.data.city
        }).get({
          success: res => {
            let strategyTempList = res.data;
            let length=strategyTempList.length;
            if(length==0){
              this.setData({
                showAll2: true
              })
            }
            else{
              for (let i = 0; i < length; i++) {
                //点赞人数
                let list = [];
                let k = Math.ceil(Math.random() * 10);
                strategyList.skip(k * 5).limit(12).get({
                  success: res => {
                    for (let j = 0; j < 12; j++) {
                      list.push(res.data[j].author);
                    }
                  }
                });
                strategyTempList[i].likeList = list;

                let contentLength = strategyTempList[i].content.length;
                if (contentLength > 100) {
                  strategyTempList[i].showTotalBtn = true;
                  strategyTempList[i].ellipsis = true;
                  strategyTempList[i].totalBtnText = '全文';
                }
              }
              this.setData({
                strategyListOfSame: strategyTempList
              })
            }
          }
        });
      }
    } else {
      this.setData({
        recommend: true,
        school: false
      })
    }
  },
  showTotal: function(e) {
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    let isLogin = app.globalData.isLogin;
    if (isLogin) {
      this.setData({
        user: app.globalData.user,
        isLogin: true
      })
    }
    //热门目的地
    hotDestination.limit(4).get({
      success: res => {
        this.setData({
          hotDestination: res.data
        })
      }
    });
    //今日红人榜
    strategyList.limit(10).get({
      success: res => {
        let peopleList = [];
        for (let i = 0; i < 10; i++) {
          let list = {};
          list.id = res.data[i]._id;
          list.author = res.data[i].author;
          list.authorImg = res.data[i].authorImg;
          peopleList.push(list);
        };
        this.setData({
          peopleList: peopleList
        })
      }
    });

    strategyList.limit(5).get({
      success: res => {
        let strategyTempList = res.data;
        for (let i = 0; i < 5; i++) {
          //点赞人数
          let list = [];
          let k = Math.ceil(Math.random() * 10);
          strategyList.skip(k * 5).limit(12).get({
            success: res => {
              for (let j = 0; j < 12; j++) {
                list.push(res.data[j].author);
              }
            }
          });
          strategyTempList[i].likeList = list;

          let contentLength = strategyTempList[i].content.length;
          if (contentLength > 100) {
            strategyTempList[i].showTotalBtn = true;
            strategyTempList[i].ellipsis = true;
            strategyTempList[i].totalBtnText = '全文';
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
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var page;
    if (this.data.recommend == true) {
      page1++;
      page=page1;
      strategyList.skip(5 * page).limit(5).get({
        success: res => {
          let oldData = this.data.strategyList;
          let strategyTempList = res.data;
          if (strategyTempList.length == 0) {
            this.setData({
              showAll1: true
            })
          } else {
            for (let i = 0; i < 5; i++) {
              //点赞人数
              let list = [];
              let k = Math.ceil(Math.random() * 10);
              strategyList.skip(k * 5).limit(12).get({
                success: res => {
                  for (let j = 0; j < 12; j++) {
                    list.push(res.data[j].author);
                  }
                }
              });
              strategyTempList[i].likeList = list;

              let contentLength = strategyTempList[i].content.length;
              if (contentLength > 100) {
                strategyTempList[i].showTotalBtn = true;
                strategyTempList[i].ellipsis = true;
                strategyTempList[i].totalBtnText = '全文';
              }
            }
            this.setData({
              strategyList: oldData.concat(strategyTempList)
            })
          }
        }
      })
    }
    else{
      page2++;
      page=page2;
      strategyList.skip(5 * page).limit(5).where({
        city: this.data.city
      }).get({
        success: res => {
          let oldData = this.data.strategyListOfSame;
          let strategyTempList = res.data;
          if (strategyTempList.length == 0) {
            this.setData({
              showAll2: true
            })
          } else {
            for (let i = 0; i < 5; i++) {
              //点赞人数
              let list = [];
              let k = Math.ceil(Math.random() * 10);
              strategyList.skip(k * 5).limit(12).get({
                success: res => {
                  for (let j = 0; j < 12; j++) {
                    list.push(res.data[j].author);
                  }
                }
              });
              strategyTempList[i].likeList = list;

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
  onShareAppMessage: function() {

  }
})