// miniprogram/pages/qualifySchool/qualifySchool.js
const app = getApp();
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk = new QQMapWX({
  key: 'VVWBZ-AJA3I-3T2GW-5ZLKT-MPXCE-OVB2D'
});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,
    windowHeight: app.globalData.windowHeight,

    userUploadImg:"",
    isUpload: false
  },

  addPic: function(e){
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

  formSubmit: function (e) {
    let userInfo=e.detail.value;
    let flag=false;
    for(let i in userInfo){
      if(userInfo[i]==''){
        flag=true;
        break;
      }
    }
    if(this.data.isUpload==false){
      flag=true;
    }

    if(flag){
      wx.showToast({
        icon: 'none',
        title: '请完善所有信息'
      });
      return;
    }
    
    qqmapsdk.geocoder({
      address: e.detail.value.schoolName,
      success:function(res){
        let result=res.result;
        let position=result.address_components;
        
        let schoolName=result.title;
        let schoolCity=position.city;
        let schoolProvince=position.province;
        let schoolDistrict=position.district;
        
        userInfo.schoolProvince=schoolProvince;
        userInfo.schoolCity=schoolCity;
        userInfo.schoolDistrict=schoolDistrict;
        userInfo.schoolName=schoolName;
      }
    });
    wx.showToast({
      icon: 'loading',
      title: '提交中',
      duration: 2000
    });
    let suffix = /\.\w+$/.exec(this.data.userUploadImg)[0];//正则表达式返回文件的扩展名
    wx.cloud.uploadFile({
      cloudPath : "userUpload/studentCard/" + userInfo.userName + suffix,
      filePath: this.data.userUploadImg,
      success : res=>{
        userInfo.identityCard=res.fileID;
        wx.cloud.callFunction({
          name:'updateUser',
          data:{
            _id: this.data._id,
            userName: userInfo.userName,
            schoolName: userInfo.schoolName,
            schoolProvince: userInfo.schoolProvince, 
            schoolCity: userInfo.schoolCity,
            schoolDistrict :userInfo.schoolDistrict,
            studentId: userInfo.studentId,
            institute: userInfo.institute,
            grade: userInfo.grade,
            identityCard: userInfo.identityCard,
          },
          success: function(res){
            console.log(res);
            wx.showToast({
              title: '提交成功!',
              icon: 'success',
              duration: 2000,
              complete: function(){
                wx.navigateBack({
                  delta: 1
                })
              }
            });
          }
        })
      }
    })
  },
  navigateBack: function(){
    wx.navigateBack({
      delta: 1,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      _id: options._id
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