// miniprogram/pages/publicStrategy/publicStrategy.js
const app = getApp();
const db = wx.cloud.database();
const userList = db.collection('user');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    author: {},

    background: "cloud://test-wusir.7465-test-wusir-1302022901/image/publicStrategyImg.jpg",
    navBarHeight: app.globalData.navBarHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,
    windowHeight: app.globalData.windowHeight,

    setoutDate: '2019/06/01',
    userUploadImg: "",
    isUpload: false,
  },
  navigateBack: function(){
    wx.navigateBack({
      delta: 1,
    })
  },
  bindDateChange: function (e) {
    let setoutDate=e.detail.value;
    setoutDate=setoutDate.split("-");
    setoutDate=setoutDate[0]+'/'+setoutDate[1]+'/'+setoutDate[2];
    this.setData({
      setoutDate: setoutDate
    })
  },
  addPic: function () {
    wx.chooseImage({
      count: 1,
      sizeType: 'original',
      sourceType: ['album', 'camera'],
      complete: (res) => {
        let tempFilePaths = res.tempFilePaths[0];
        this.setData({
          userUploadImg: tempFilePaths,
          isUpload: true
        });
        wx.showToast({
          title: '上传成功',
        })
      },
    })
  },
  formSubmit:function(e){
    let that=this;
    let strategy=e.detail.value;
    let flag = false;
    for (let i in strategy) {
      if (strategy[i] == '') {
        flag = true;
        break;
      }
    }
    if (this.data.isUpload == false) {
      flag = true;
    }

    if (flag) {
      wx.showToast({
        icon: 'none',
        title: '请完善所有信息'
      });
      return;
    }

    wx.showToast({
      icon: 'loading',
      title: '提交中',
      duration: 2000
    });
    let suffix = /\.\w+$/.exec(this.data.userUploadImg)[0]; //正则表达式返回文件的扩展名
    wx.cloud.uploadFile({
      cloudPath: "userUpload/strategyCover/" + this.data.author.nickName+"-"+strategy.title +  suffix,
      filePath: this.data.userUploadImg,
      success: res => {
        strategy.coverImg = res.fileID;
        strategy.avarageCost = strategy.avarageCost+'RMB';
        strategy.travelDays= strategy.travelDays+' 天';

        let date=new Date();
        let publishDate=date.toLocaleDateString();

        wx.cloud.callFunction({
          name:"updateUserOfAddStrategy",
          data:{
            coverImg: strategy.coverImg,
            _id:this.data.author._id
          },
          success: function(res){
            console.log(res);
          }
        });
        wx.cloud.callFunction({
          name: 'addStrategy',
          data: {
            author:this.data.author.nickName,//作者
            authorImg:this.data.author.avatarUrl,//作者头像
            avarageCost:strategy.avarageCost,//平均消费
            content:strategy.content,//游记
            coverImg:strategy.coverImg,//游记封面
            destination:strategy.destination,//目的地
            province:this.data.author.province,//作者省份
            city:this.data.author.city,//作者城市
            publishDate:publishDate,//发布日期
            setoutDate:this.data.setoutDate,//出发时间
            title:strategy.title,//游记题目
            travelDays:strategy.travelDays,//旅行天数
            university:this.data.author.schoolName,//作者学校
          },
          success: function (res) {
            console.log(res);
            wx.showToast({
              title: '提交成功!',
              icon: 'success',
              duration: 2000,
              complete: function () {//待改进 创建小队成功后进入小队管理页面
                wx.navigateTo({
                  url: '../myStrategy/myStrategy?author='+that.data.author.nickName+'&my='+true,
                })
              }
            });
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userList.where({
      nickName: options.author
    }).get().then(res=>{
      this.setData({
        author: res.data[0]
      })
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