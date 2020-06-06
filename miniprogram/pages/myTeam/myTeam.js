// miniprogram/pages/myTeam/myTeam.js
const app = getApp();
const db = wx.cloud.database();
const userList = db.collection('user');
const team = db.collection('team');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigateBackgroundColor: "none",
    navBarHeight: app.globalData.navBarHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,
    windowWidth: app.globalData.windowWidth,

    user: {},

    createTeam: false,
    myCreateTeam: {},
    myCreateTeamMember: [],
    teamFull: false,
    myCreateTeamStatus: {},

    joinTeam: false,
    myJoinTeam: {},
    myJoinTeamMember: [],
    myJoinTeamStatus: {},
  },
  navigateBack: function () {
    wx.navigateBack({
      delta: 1,
    })
  },
  onPageScroll: function (res) {
    if (res.scrollTop >= 265) {
      this.setData({
        navigateBackgroundColor: "white"
      })
    } else {
      this.setData({
        navigateBackgroundColor: "none"
      })
    }
  },
  navigateTo: function (e) {
    let author = e.currentTarget.dataset.nickname;
    wx.navigateTo({
      url: '../myStrategy/myStrategy?author=' + author,
    })
  },
  joinTeam: function(){
    wx.navigateTo({
      url: '../team/team?province='+this.data.user.province+'&city='+this.data.user.city,
    })
  },
  createTeam: function(){
    wx.navigateTo({
      url: '../createTeam/createTeam?nickName='+this.data.user.nickName,
    })
  },
  manageTeam: function(){
    wx.navigateTo({
      url: '../manageTeam/manageTeam',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userList.where({
      nickName: options.nickName
    }).get({
      success: res => {
        this.setData({
          user: res.data[0]
        })
        //获取用户加入的小队
        let myJoinTeam = res.data[0].joinTeamId;
        team.where({
          id: myJoinTeam
        }).get({
          success: res => {
            if (res.data[0].length != 0) {
              let teamMemberList = [];
              let teamMember = res.data[0].teamMemberList;
              let length = teamMember.length;
              for (let i = 0; i < length; i++) {
                let member = {};
                member.nickName = teamMember[i];
                userList.where({
                  nickName: teamMember[i]
                }).get({
                  success: res => {
                    member.avatarUrl = res.data[0].avatarUrl
                    teamMemberList.push(member);
                    this.setData({
                      myJoinTeamMember: teamMemberList
                    })
                  }
                })
              }
              let status = res.data[0].teamStatus;
              let teamStatus = {};
              if (status == 0) {
                teamStatus.value = "暂不招募";
                teamStatus.color = "rgb(245,245,245)";
              } else if (status == 1) {
                teamStatus.value = "招募中";
                teamStatus.color = "red";
              } else if (status == 2) {
                teamStatus.value = "即刻出发";
                teamStatus.color = "rgb(188,241,138)";
              } else if (stetus ==3){
                teamStatus.value = "正在旅行";
                teamStatus.color = "rgb(126,193,230)";
              } else{
                teamStatus.value = "已招满";
                teamStatus.color = "rgb(234,140,46)";
              }
              this.setData({
                myJoinTeam: res.data[0],
                joinTeam: true,
                myJoinTeamStatus: teamStatus
              })
            }
          }
        })
      }
    })
    //获取用户创建的小队
    team.where({
      teamHeader: options.nickName
    }).get().then(res => {
      if (res.data[0].length != 0) {
        let teamMemberList = [];
        let teamMember = res.data[0].teamMemberList;
        let length = teamMember.length;
        if (length == res.data[0].teamMemberNum) {
          this.setData({
            teamFull: true
          })
        }
        for (let i = 0; i < length; i++) {
          let member = {};
          member.nickName = teamMember[i];
          userList.where({
            nickName: teamMember[i]
          }).get({
            success: res => {
              member.avatarUrl = res.data[0].avatarUrl
              teamMemberList.push(member);
              this.setData({
                myCreateTeamMember: teamMemberList
              })
            }
          })
        }
        let status = res.data[0].teamStatus;
        let teamStatus = {};
        if (status == 0) {
          teamStatus.value = "暂不招募";
          teamStatus.color = "rgb(245,245,245)";
        } else if (status == 1) {
          teamStatus.value = "招募中";
          teamStatus.color = "red";
        } else if (status == 2) {
          teamStatus.value = "即刻出发";
          teamStatus.color = "rgb(188,241,138)";
        } else if (stetus ==3){
          teamStatus.value = "正在旅行";
          teamStatus.color = "rgb(126,193,230)";
        } else{
          teamStatus.value = "已招满";
          teamStatus.color = "rgb(234,140,46)";
        }
        this.setData({
          myCreateTeam: res.data[0],
          createTeam: true,
          myCreateTeamStatus: teamStatus
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