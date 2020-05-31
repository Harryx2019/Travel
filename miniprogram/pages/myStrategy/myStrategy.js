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
    emptyStrategy:false,
    emptyLikeStrategy : false
  },

  changePage: function (e) {
    let page;
    if(e=='myStore'){
      page='store';
    }else{
      page = e.currentTarget.dataset.page;
    }
    if (page == 'store') {
      if (this.data.myLikeStrategy.length == 0) {
        //获取用户收藏游记
        let myLikeStrategy = {};
        let likeStrategyList = this.data.author.likeStrategyList;
        let length = likeStrategyList.length;
        if(length==0){
          this.setData({
            showAll: true,
            emptyLikeStrategy:true
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
      this.setData({
        strategy: false,
        store: true
      })
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let author = {};
    author.name = options.author;
    //获取用户游记
    strategyList.where({
      author: author.name
    }).get({
      success: res => {
        let myStrategy = res.data;
        let length = myStrategy.length;
        if(length==0){
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
        author.sex = user.sex;
        author.authorImg = user.avatarUrl;
        author.school = user.schoolName;
        author.coverImg = user.coverImg;
        author.viewNum = user.viewNum;
        author.followList = user.followList;
        author.followNum = user.followList.length;
        author.likeStrategyList = user.likeStrategyList;
        this.setData({
          author: author
        });
        if(options.myStore=='true'){
          this.changePage('myStore');
        }
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
            }
            else{
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