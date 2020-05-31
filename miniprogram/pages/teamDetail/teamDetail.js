// miniprogram/pages/teamDetail/teamDetail.js
const app = getApp();
const db = wx.cloud.database();
const userList = db.collection('user');
const teamList = db.collection('team');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,
    menuWidth: app.globalData.menuWidth,

    team : {},
    user: {},
  },
  navigateBack: function () {
    wx.navigateBack({
      delta: 1,
    })
  },
  navigateTo: function (e) {
    let author = e.currentTarget.dataset.nickname;
    wx.navigateTo({
      url: '../myStrategy/myStrategy?author=' + author,
    })
  },
  navigateToMyStrategy: function (e) {
    let author = e.currentTarget.dataset.author;
    wx.navigateTo({
      url: '../myStrategy/myStrategy?author=' + author,
    })
  },
  applyForTeam :function(){
    let userNickName=this.data.user.nickName;
    let teamMemberInfo=this.data.team.teamMemberInfo;
    let length=teamMemberInfo.length;
    for(let i=0;i<length;i++){
      if(teamMemberInfo[i].nickName==userNickName){
        wx.showToast({
          title: '您已加入该小队',
          icon: 'none'
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      user: app.globalData.user,
    })
    //获取小队信息
    teamList.where({
      _id: options.id
    }).get().then(res => {
      let team = res.data[0];
      let memberList = team.teamMemberList;
      let memberNum = memberList.length;
      if (memberNum == 4) {
        team.teamStatus = 4;
      }

      let teamMemberInfo = [];
      let teamHeader = {};
      userList.where({
        nickName: team.teamHeader
      }).get().then(res => {
        teamHeader.nickName = team.teamHeader;
        teamHeader.avatarUrl = res.data[0].avatarUrl;
        teamMemberInfo.push(teamHeader);
        for (let j = 0; j < memberNum; j++) {
          userList.where({
            nickName: memberList[j]
          }).get().then(res => {
            let avatarUrl = res.data[0].avatarUrl;
            let member = {};
            member.nickName = memberList[j];
            member.avatarUrl = avatarUrl;
            teamMemberInfo.push(member);

            team.teamMemberInfo = teamMemberInfo;
            this.setData({
              team: team
            })
          })
        }
      })

      let status = team.teamStatus;
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
      } else if (stetus == 3) {
        teamStatus.value = "正在旅行";
        teamStatus.color = "rgb(126,193,230)";
      } else {
        teamStatus.value = "已招满";
        teamStatus.color = "rgb(234,140,46)";
      }
      team.teamStatusInfo = teamStatus;
    });
    //获取用户信息

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