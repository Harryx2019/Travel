// miniprogram/pages/applyGuide/applyGuide.js
const app = getApp();
const db=wx.cloud.database();
const userList=db.collection('user');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,
    windowHeight: app.globalData.windowHeight,

    user:{},

    userUploadImg1: "",
    isUpload1: false,
    userUploadImg2: "",
    isUpload2: false
  },
  navigateBack: function () {
    wx.navigateBack({
      delta: 1,
    })
  },
  addPic: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.chooseImage({
      count: 1,
      sizeType: 'original',
      sourceType: ['album', 'camera'],
      complete: (res) => {
        let tempFilePaths = res.tempFilePaths[0];
        if (id == 1) {
          this.setData({
            userUploadImg1: tempFilePaths,
            isUpload1: true
          });
        } else {
          this.setData({
            userUploadImg2: tempFilePaths,
            isUpload2: true
          });
        }
        wx.showToast({
          title: '上传成功',
          icon: 'success'
        });
      },
    })
  },
  formSubmit: function (e) {
    let guideInfo = e.detail.value;
    let flag = false;
    for (let i in guideInfo) {
      if (guideInfo[i] == '') {
        flag = true;
        break;
      }
    }
    if (this.data.isUpload1 == false || this.data.isUpload1 == false) {
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
    let suffix1 = /\.\w+$/.exec(this.data.userUploadImg1)[0]; //正则表达式返回文件的扩展名
    let suffix2 = /\.\w+$/.exec(this.data.userUploadImg2)[0];
    wx.cloud.uploadFile({
      cloudPath: "userUpload/guideCard/" + guideInfo.userName + "1" + suffix1,
      filePath: this.data.userUploadImg1,
      success: res => {
        guideInfo.identityCard1 = res.fileID;
        wx.cloud.uploadFile({
          cloudPath: "userUpload/guideCard/" + guideInfo.userName + "2" + suffix2,
          filePath: this.data.userUploadImg2,
          success: res => {
            guideInfo.identityCard2 = res.fileID;
            wx.cloud.callFunction({
              name: 'addguide',
              data: {
                guideName: guideInfo.userName, //申请人姓名
                nickName: this.data.user.nickName, //申请人微信名
                avatarUrl: this.data.user.avatarUrl, //申请人头像
                sex: guideInfo.sex, //申请人性别
                phone: guideInfo.phone, //申请人电话
                qq: guideInfo.qq, //申请人QQ
                guideDescription: guideInfo.description, //申请人简介
                school: guideInfo.schoolName, //申请人学校
                province: this.data.user.province, //申请人所在省份
                city: this.data.user.city, //申请人所在城市
                identityCard1: guideInfo.identityCard1, //导游证件信息
                identityCard2: guideInfo.identityCard2,
              },
              success: function (res) {
                console.log(res);
                wx.showToast({
                  title: '提交成功!',
                  icon: 'success',
                  duration: 2000,
                });
                wx.navigateBack({
                  delta: 1,
                })
              }
            })
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
      nickName: options.nickName
    }).get().then(res=>{
      this.setData({
        user: res.data[0]
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