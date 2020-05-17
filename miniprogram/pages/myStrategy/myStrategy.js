// miniprogram/pages/myStrategy/myStrategy.js
const app = getApp();
const db=wx.cloud.database();
const strategyList=db.collection('strategy');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    navBarBgc: 'none',
    navBarColor:'white',

    strategy:true,
    store:false,

    myStrategy:[],
    myLikeStrategy :[],
    author:{}
  },

  changePage: function(e){
    console.log(e);
    let page=e.currentTarget.dataset.page;
    if(page=='store'){
      this.setData({
        strategy:false,
        store:true
      })
    }else{
      this.setData({
        strategy: true,
        store: false
      })
    }
  },
  navigateBack : function(){
    wx.navigateBack({
      delta:1
    })
  },
  navigateToDetail :function(e){
    console.log(e);
    let id=e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../strategyDetail/strategyDetail?id='+id
    })
  },

  onPageScroll: function (res) {
    if (res.scrollTop >= 130) {
      this.setData({
        navBarBgc: "white",
        navBarColor :"black"
      })
    }
    else {
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
    let author=options.author;
    //获取用户游记
    strategyList.where({
      author:author
    }).get({
      success: res=>{
        let myStrategy=res.data;
        let length = myStrategy.length;
        for(let i=0;i<length;i++){
          let date=myStrategy[i].publishDate;
          date=date.split('/');
          myStrategy[i].publishYear = date[0];
          myStrategy[i].publishMonth = date[1];
          myStrategy[i].publishDay = date[2];
        }

        //获取用户信息
        let author={};
        author.name = myStrategy[0].author;
        author.authorImg = myStrategy[0].authorImg; 
        author.school = myStrategy[0].university;
        author.coverImg = myStrategy[0].coverImg;
        author.viewNum = myStrategy[0].viewNum
        let followNum = myStrategy[0].likeNum - 200;
        if(followNum<0){
          author.followNum=0;
        }else{
          author.followNum=followNum;
        }
        let i=Math.random()*10;
        if(i>5){
          author.sex='male';
        }
        else{
          author.sex='female';
        }


        this.setData({
          myStrategy: myStrategy,
          author : author
        })
      }
    });

    //获取用户收藏游记
    strategyList.limit(1).get({
      success: res=>{
        let myStrategy = res.data;
        let length = myStrategy.length;
        for (let i = 0; i < length; i++) {
          let date = myStrategy[i].publishDate;
          date = date.split('/');
          myStrategy[i].publishYear = date[0];
          myStrategy[i].publishMonth = date[1];
          myStrategy[i].publishDay = date[2];
        }
        this.setData({
          myLikeStrategy: myStrategy
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