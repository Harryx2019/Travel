// miniprogram/pages/myStrategy/myStrategy.js
const app = getApp();
const db = wx.cloud.database();
const strategyList = db.collection('strategy');
const userList = db.collection('user');
var page = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    navBarBgc: 'none',
    navBarColor: 'white',

    strategy: true,
    store: false,

    myStrategy: [],
    myLikeStrategy: [],
    author: {},

    showAll: false,
    emptyStrategy: false,
    emptyLikeStrategy: false,

    follow: false,
  },

  changePage: function (e) {
    let page;
    if (e == 'myStore') {
      page = 'store';
    } else {
      page = e.currentTarget.dataset.page;
    }
    if (page == 'store') {
      this.setData({
        strategy: false,
        store: true
      })
      if (this.data.myLikeStrategy.length == 0) {
        //获取用户收藏游记
        let myLikeStrategy = {};
        let likeStrategyList = this.data.author.likeStrategyList;
        let length = likeStrategyList.length;
        if (length == 0) {
          this.setData({
            showAll: true,
            emptyLikeStrategy: true
          })
        }
        if (length > 5) {
          length = 5;
        }
        for (let i = 0; i < length; i++) {
          strategyList.where({
            id: likeStrategyList[i]
          }).get({
            success: res => {
              let strategy = res.data[0];
              myLikeStrategy[i] = strategy;

              let date = strategy.publishDate;
              date = date.split('/');
              myLikeStrategy[i].publishYear = date[0];
              myLikeStrategy[i].publishMonth = date[1];
              myLikeStrategy[i].publishDay = date[2];

              this.setData({
                myLikeStrategy: myLikeStrategy
              })
            }
          })
        }
      }
    } else {
      this.setData({
        strategy: true,
        store: false
      })
    }
  },
  navigateBack: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  navigateToDetail: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../strategyDetail/strategyDetail?id=' + id
    })
  },

  onPageScroll: function (res) {
    if (res.scrollTop >= 130) {
      this.setData({
        navBarBgc: "white",
        navBarColor: "black"
      })
    } else {
      this.setData({
        navBarBgc: "none",
        navBarColor: "white"
      })
    }
  },
  removeStratge: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let strategy = this.data.myStrategy[id];
    wx.showModal({
      title: '删除游记',
      content: '确认删除"' + strategy.title + '"吗？',
      success(res) {
        if (res.confirm) {
          wx.showToast({
            title: '正在删除',
            icon: 'loading',
          });
          if (id == 0) {
            let coverImg = "";
            if (that.data.myStrategy.length == 1) {
              coverImg = "cloud://test-wusir.7465-test-wusir-1302022901/image/myBackground.jpg";
            } else {
              coverImg = that.data.myStrategy[1].coverImg;
            }
            wx.cloud.callFunction({
              name: "updateUserOfAddStrategy",
              data: {
                coverImg: coverImg,
                _id: that.data.author._id
              },
              success: function (res) {
                console.log(res);
              }
            });
          }
          wx.cloud.callFunction({
            name: 'removeStrategy',
            data: {
              _id: strategy._id
            },
            success: function (res) {
              console.log(res);
              //获取用户游记
              strategyList.where({
                author: that.data.author.name
              }).orderBy('id', 'desc').get({
                success: res => {
                  let myStrategy = res.data;
                  let length = myStrategy.length;
                  if (length == 0) {
                    that.setData({
                      emptyStrategy: true
                    })
                  }
                  for (let i = 0; i < length; i++) {
                    let date = myStrategy[i].publishDate;
                    date = date.split('/');
                    myStrategy[i].publishYear = date[0];
                    myStrategy[i].publishMonth = date[1];
                    myStrategy[i].publishDay = date[2];
                  }
                  that.setData({
                    myStrategy: myStrategy
                  })
                  wx.showToast({
                    title: '删除成功',
                    icon: 'loading',
                    duration: 2000
                  });
                }
              });
            }
          });
        }
      }
    })
  },
  join : function(){
    //首先判断该用户是否创建小队
    let teamList=db.collection('team');
    teamList.where({
      teamHeader: this.data.author.name
    }).get().then(res=>{
      if(res.data.length==0){
        wx.showToast({
          title: '该用户暂未创建小队',
          icon:'none'
        });
      }else{
        let team=res.data[0];
        wx.navigateTo({
          url: '../teamDetail/teamDetail?id='+team._id,
        })
      }
    })
  },
  follow: function () {
    let user = this.data.user.nickName
    let userId = "";
    let author = this.data.author.name
    let authorId = "";

    if (this.data.follow == false) {
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.my == "true") {
      this.setData({
        my: true
      })
    }
    let userInfo=app.globalData.user;
    this.setData({
      user: userInfo,
    })

    let author = {};
    author.name = options.author;
    //获取用户游记
    strategyList.where({
      author: author.name
    }).orderBy('id', 'desc').get({
      success: res => {
        let myStrategy = res.data;
        let length = myStrategy.length;
        if (length == 0) {
          this.setData({
            emptyStrategy: true
          })
        }
        for (let i = 0; i < length; i++) {
          let date = myStrategy[i].publishDate;
          date = date.split('/');
          myStrategy[i].publishYear = date[0];
          myStrategy[i].publishMonth = date[1];
          myStrategy[i].publishDay = date[2];
        }
        this.setData({
          myStrategy: myStrategy
        })
      }
    });

    //获取用户信息
    userList.where({
      nickName: author.name
    }).get({
      success: res => {
        let user = res.data[0];
        author._id=user._id;
        author.sex = user.sex;
        author.authorImg = user.avatarUrl;
        author.school = user.schoolName;
        author.coverImg = user.coverImg;
        author.viewNum = user.viewNum;
        author.beFollowedList = user.beFollowedList;
        author.followNum = user.beFollowedList.length;
        author.likeStrategyList = user.likeStrategyList;
        //判断用户是否关注该作者
        let beFollowedList=user.beFollowedList;
        let followNum = beFollowedList.length;
        for(let i=0;i<followNum;i++){
          if(beFollowedList[i]==userInfo.nickName){
            this.setData({
              follow: true
            })
          }
        }
        this.setData({
          author: author
        });
        if (options.myStore == 'true') {
          this.changePage('myStore');
        }
        wx.cloud.callFunction({
          name: 'myView',
          data: {
            _id: user._id,
            viewNum: user.viewNum + 1
          },
          success: function (res) {
            console.log(res);
          }
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
    if (!this.data.showAll) {
      page++;
      //获取用户收藏游记
      let likeStrategyList = this.data.author.likeStrategyList;
      let length = likeStrategyList.length;

      let length2 = this.data.myLikeStrategy.length;
      if (length > 5 * (page + 1)) {
        length = 5 * (page + 1);
      }
      for (let i = 5 * page; i < length; i++) {
        strategyList.where({
          id: likeStrategyList[i]
        }).get({
          success: res => {
            let oldData = this.data.myLikeStrategy;
            let newData = res.data;
            if (newData.length != 0) {
              newData = newData[0];
              let date = newData.publishDate;
              date = date.split('/');
              newData.publishYear = date[0];
              newData.publishMonth = date[1];
              newData.publishDay = date[2];

              oldData[i] = newData;

              this.setData({
                myLikeStrategy: oldData
              })
            } else {
              console.log(1);
              this.setData({
                showAll: true
              })
            }
          }
        })
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})