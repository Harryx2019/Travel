// miniprogram/pages/createTeam/createTeam.js
const app = getApp();
const db = wx.cloud.database();
const userList = db.collection('user');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName: "",

    background: "cloud://test-wusir.7465-test-wusir-1302022901/image/createTeamBack.jpg",
    navBarHeight: app.globalData.navBarHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,
    windowHeight: app.globalData.windowHeight,

    teamSetOutDate: '2020-06-01',
    userUploadImg: "",
    isUpload: false,
  },
  navigateBack: function(){
    wx.navigateBack({
      delta: 1,
    })
  },

  addPic: function (e) {
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

  bindDateChange: function (e) {
    this.setData({
      teamSetOutDate: e.detail.value
    })
  },
  formSubmit: function (e) {
    let teamInfo = e.detail.value;
    let flag = false;
    for (let i in teamInfo) {
      if (teamInfo[i] == '') {
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

    let teamHeader;
    userList.where({
      nickName: this.data.nickName
    }).get({
      success: res => {
        teamHeader = res.data[0];

        teamInfo.teamHeader = teamHeader.nickName;
        teamInfo.teamProvince = teamHeader.province;
        teamInfo.teamCity = teamHeader.city;
        teamInfo.teamSchool = teamHeader.schoolName;
      }
    })
    teamInfo.teamSetOutDate = this.data.teamSetOutDate;
    teamInfo.teamTravelDate=parseInt(teamInfo.teamTravelDate);
    teamInfo.teamMemberNum=parseInt(teamInfo.teamMemberNum);
    teamInfo.teamStatus=parseInt(teamInfo.teamStatus);
    wx.showToast({
      icon: 'loading',
      title: '提交中',
      duration: 2000
    });
    let suffix = /\.\w+$/.exec(this.data.userUploadImg)[0]; //正则表达式返回文件的扩展名
    wx.cloud.uploadFile({
      cloudPath: "userUpload/teamHeadImg/" + teamInfo.teamName + suffix,
      filePath: this.data.userUploadImg,
      success: res => {
        teamInfo.teamHeadImg = res.fileID;
        console.log(teamInfo);
        wx.cloud.callFunction({
          name: 'addTeam',
          data: {
            teamName: teamInfo.teamName, //名称
            teamHeadImg: teamInfo.teamHeadImg, //头像
            teamCoverImg: teamInfo.teamHeadImg, //封面
            teamHeader: teamInfo.teamHeader, //队长
            teamDescription: teamInfo.teamDescription, //简介
            teamNotice: teamInfo.teamNotice, //公告
            teamProvince: teamInfo.teamProvince, //省份
            teamCity: teamInfo.teamCity, //城市
            teamSchool: teamInfo.teamSchool, //学校
            teamDestination:teamInfo.teamDestination, //目的地
            teamSetOutDate: teamInfo.teamSetOutDate, //出发日期
            teamTravelDate: teamInfo.teamTravelDate, //旅行天数
            teamMemberNum: teamInfo.teamMemberNum, //人数
            teamStatus: teamInfo.teamStatus, //小队状态
          },
          success: function (res) {
            console.log(res);
            wx.showToast({
              title: '提交成功!',
              icon: 'success',
              duration: 2000,
              complete: function () {//待改进 创建小队成功后进入小队管理页面
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      nickName: options.nickName
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