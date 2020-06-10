// miniprogram/pages/myTeam/myTeam.js
const app = getApp();
const db = wx.cloud.database();
const userList = db.collection('user');
const team = db.collection('team');
const applyList = db.collection('applyTeam');
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

    applyTeam: false,
    applyList: [],

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
  joinTeam: function () {
    wx.navigateTo({
      url: '../team/team?province=' + this.data.user.province + '&city=' + this.data.user.city,
    })
  },
  createTeam: function () {
    wx.navigateTo({
      url: '../createTeam/createTeam?nickName=' + this.data.user.nickName,
    })
  },
  manageTeam: function () {
    wx.navigateTo({
      url: '../manageTeam/manageTeam',
    })
  },
  confirmApply: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let applyList = this.data.applyList;
    let teamInfo = applyList[id];
    if (teamInfo.applyStatus == 1) {
      wx.showModal({
        title: '申请成功',
        content: '你已成功申请加入小队"' + teamInfo.teamName + '"',
        showCancel: false,
        success(res) {
          wx.cloud.callFunction({
            name: "confirmApply",
            data: {
              _id: teamInfo._id
            },
            success: function (res) {
              console.log(res);
              let teamNum = applyList.length;
              if (teamNum == 1) {
                applyList = [];
                that.setData({
                  applyTeam: false
                })
              } else {
                for (let i = id; i < teamNum - 1; i++) {
                  applyList[i] = applyList[i + 1];
                }
                applyList.pop();
              }
              that.setData({
                applyList: applyList
              })
            }
          })
        }
      })
    } else {
      wx.showModal({
        title: '申请失败',
        content: '你的申请被拒绝，看看其他小队吧！',
        showCancel: false,
        success(res) {
          wx.cloud.callFunction({
            name: "confirmApply",
            data: {
              _id: teamInfo._id
            },
            success: function (res) {
              console.log(res);
              let teamNum = applyList.length;
              if (teamNum == 1) {
                applyList = [];
                that.setData({
                  applyTeam: false
                })
              } else {
                for (let i = id; i < teamNum - 1; i++) {
                  applyList[i] = applyList[i + 1];
                }
                applyList.pop();
              }
              that.setData({
                applyList: applyList
              })
            }
          })
        }
      })
    }
  },
  quitTeam: function () {
    let that = this;
    wx.showModal({
      title: "退出小队",
      content: '你确认要退出小队"' + that.data.myJoinTeam.teamName + '"吗？',
      success(res) {
        if (res.confirm) {
          wx.showToast({
            title: '正在退出小队',
            icon: 'loading',
            duration: 2000
          });
          wx.cloud.callFunction({
            name: "updateUserOfAddMember",
            data: {
              _memberId: that.data.user._id,
              teamId: ""
            },
            success: function (res) {
              console.log(res);
            }
          });
          let teamMemberList = that.data.myJoinTeam.teamMemberList;
          let length = teamMemberList.length;
          if (length == 0) {
            teamMemberList = [];
          } else {
            let i=0;
            for (i = 0; i < length; i++) {
              if (teamMemberList[i] == that.data.user.nickName) {
                break;
              }
            }
            for (; i < length - 1; i++) {
              teamMemberList[i] = teamMemberList[i + 1];
            }
            teamMemberList.pop();
            wx.cloud.callFunction({
              name: "removeMember",
              data: {
                _teamId: that.data.myJoinTeam._id,
                teamMemberList: teamMemberList
              },
              success: function (res) {
                console.log(res);
                wx.showToast({
                  title: '退出小队成功',
                  icon: 'success',
                  duration: 2000
                });
                wx.navigateTo({
                  url: '../my/my'
                })
              }
            })
          }
        }
      }
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
            if (res.data.length != 0) {
              let team = res.data[0];
              let teamMemberList = [];
              let teamHeader = {};
              teamHeader.nickName = res.data[0].teamHeader;
              userList.where({
                nickName: res.data[0].teamHeader
              }).get().then(res => {
                teamHeader.avatarUrl = res.data[0].avatarUrl;
                teamMemberList.push(teamHeader);

                let teamMember = team.teamMemberList;
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
      if (res.data.length != 0) {
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
        } else if (stetus == 3) {
          teamStatus.value = "正在旅行";
          teamStatus.color = "rgb(126,193,230)";
        } else {
          teamStatus.value = "已招满";
          teamStatus.color = "rgb(234,140,46)";
        }
        this.setData({
          myCreateTeam: res.data[0],
          createTeam: true,
          myCreateTeamStatus: teamStatus
        })
      }
    });
    //获取用户申请的小队
    applyList.where({
      applyNickName: options.nickName
    }).get().then(res => {
      let applyTeamList = res.data;
      let length = applyTeamList.length;
      for (let i = 0; i < length; i++) {
        team.where({
          id: applyTeamList[i].applyTeamId
        }).get().then(res => {
          applyTeamList[i].teamHeadImg = res.data[0].teamHeadImg;
          applyTeamList[i].teamName = res.data[0].teamName;
          applyTeamList[i].teamSchool = res.data[0].teamSchool;
          applyTeamList[i].teamHeader = res.data[0].teamHeader;
          userList.where({
            nickName: res.data[0].teamHeader
          }).get().then(res => {
            applyTeamList[i].teamHeaderImg = res.data[0].avatarUrl;
            this.setData({
              applyList: applyTeamList,
              applyTeam: true
            })
          })
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