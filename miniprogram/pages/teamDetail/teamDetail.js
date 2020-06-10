// miniprogram/pages/teamDetail/teamDetail.js
const app = getApp();
const db = wx.cloud.database();
const userList = db.collection('user');
const teamList = db.collection('team');
const applyTeamList = db.collection("applyTeam");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,
    menuWidth: app.globalData.menuWidth,

    windowHeight: app.globalData.windowHeight,

    team: {},
    user: {},

    showForm: false
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
  applyForTeam: function () {
    //首先验证该用户是否加入其他小队或创建小队
    userList.where({
      nickName: this.data.user.nickName
    }).get().then(res => {
      if (res.data[0].joinTeamId != "") {
        wx.showToast({
          title: '您已加入小队',
          icon: 'none'
        });
        return;
      }
      teamList.where({
        teamHeader: this.data.user.nickName
      }).get().then(res => {
        if (res.data.length != 0) {
          wx.showToast({
            title: '您已拥有小队',
            icon: 'none'
          })
          return;
        }
        //验证用户是否已加入该小队
        let userNickName = this.data.user.nickName;
        let teamMemberInfo = this.data.team.teamMemberInfo;
        let length = teamMemberInfo.length;
        for (let i = 0; i < length; i++) {
          if (teamMemberInfo[i].nickName == userNickName) {
            wx.showToast({
              title: '您已加入该小队',
              icon: 'none'
            })
            return;
          }
        }
        //验证用户是否向该小队发布申请
        applyTeamList.where({
          applyNickName: this.data.user.nickName
        }).get().then(res => {
          let applyTeamList = res.data;
          let length = applyTeamList.length;
          for (let i = 0; i < length; i++) {
            if (applyTeamList[i].applyTeamId == this.data.team.id) {
              wx.showToast({
                title: '您已向该小队提交申请，请等待队长同意',
                icon: 'none'
              })
              return;
            }
          }
          this.setData({
            showForm: true
          })
        })
      });
    });
  },
  hideForm: function () {
    this.setData({
      showForm: false
    })
  },
  formSubmit: function (e) {
    let applyInfo = e.detail.value;
    let flag = false;
    for (let i in applyInfo) {
      if (applyInfo[i] == '') {
        flag = true;
        break;
      }
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
    userList.where({
      nickName: this.data.user.nickName
    }).get().then(res => {
      let userInfo = res.data[0];
      let _id = userInfo._id;
      wx.cloud.callFunction({
        name: "updateUserOfApply",
        data: {
          _id: _id,
          phone: applyInfo.phone,
          qq: applyInfo.qq
        },
        success: function (res) {
          console.log(res);
        }
      });

      //申请表新增记录
      let that = this;
      wx.cloud.callFunction({
        name: "addApply",
        data: {
          userName: applyInfo.userName, //申请人姓名
          nickName: this.data.user.nickName, //申请人微信名
          avatarUrl: this.data.user.avatarUrl, //申请人头像
          sex: applyInfo.sex, //申请人性别
          teamId: this.data.team.id, //申请小队编号
          personalDescription: applyInfo.personalDescription, //申请人简介
          school: applyInfo.school, //申请人学校
          institute: applyInfo.institute, //申请人学院
          grade: applyInfo.grade, //申请人年级
          province: this.data.user.province, //申请人所在省份
          city: this.data.user.city //申请人所在城市
        },
        success: function (res) {
          console.log(res);
          wx.showToast({
            title: '提交成功!',
            icon: 'success',
            duration: 2000,
            complete: function () {
              that.setData({
                showForm: false
              })
            }
          });
        }
      });


    })
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
      } else if (status == 3) {
        teamStatus.value = "正在旅行";
        teamStatus.color = "rgb(126,193,230)";
      } else {
        teamStatus.value = "已招满";
        teamStatus.color = "rgb(234,140,46)";
      }
      team.teamStatusInfo = teamStatus;

      let teamMemberInfo = [];
      let teamHeader = {};
      userList.where({
        nickName: team.teamHeader
      }).get().then(res => {
        teamHeader.nickName = team.teamHeader;
        teamHeader.avatarUrl = res.data[0].avatarUrl;
        teamMemberInfo.push(teamHeader);
        team.teamMemberInfo = teamMemberInfo;
        this.setData({
          team: team
        })

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