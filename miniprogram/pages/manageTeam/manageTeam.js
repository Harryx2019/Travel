// miniprogram/pages/manegeTeam/manegeTeam.js
const app = getApp();
const db = wx.cloud.database();
const userList = db.collection('user');
const teamList = db.collection('team');
const applyTeamList = db.collection('applyTeam');
const applyGuideList = db.collection('applyGuide');
const guideList = db.collection('guide');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigateBackgroundColor: "none",

    user: {},
    team: {},
    applyList: [],
    memberList: [],

    navBarHeight: app.globalData.navBarHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,
    windowWidth: app.globalData.windowWidth,
    windowHeight: app.globalData.windowHeight,

    showAdd: false,
    searchMemberList: [],
    emptySearch: false,

    applyGuideList: [],
    guide: {},
    applyGuide: false,
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
  //同意入队申请
  accept: function (e) {
    let that = this;
    let applyId = e.currentTarget.dataset.applyid;
    let applyInfo = this.data.applyList[applyId];
    let _id = applyInfo._id;
    let applicant = applyInfo.applyNickName;
    wx.showModal({
      title: '同意入队申请',
      content: '是否确认同意"' + applicant + '"入队？',
      success(res) {
        wx.showToast({
          title: '正在同意申请',
          icon: 'loading',
          duration: 2000
        });
        wx.cloud.callFunction({
          name: "acceptApply",
          data: {
            _id: _id
          },
          success: function (res) {
            console.log(res);
            wx.cloud.callFunction({
              name: "addTeamMember",
              data: {
                _teamId: that.data.team._id,
                member: applicant
              },
              success: function (res) {
                console.log(res);
                let _memberId = "";
                userList.where({
                  nickName: applicant
                }).get().then(res => {
                  _memberId = res.data[0]._id;
                  wx.cloud.callFunction({
                    name: "updateUserOfAddMember",
                    data: {
                      _memberId: _memberId,
                      teamId: that.data.team.id
                    },
                    success: function (res) {
                      console.log(res);
                      wx.showToast({
                        title: '已同意',
                        icon: 'success',
                        duration: 2000
                      });
                      that.updateApplyList();
                      that.updateTeamMember();
                    }
                  })
                })
              }
            })
          }
        });
      }
    })
  },
  //拒绝入队申请
  refuse: function (e) {
    let that = this;
    let applyId = e.currentTarget.dataset.applyid;
    let applyInfo = this.data.applyList[applyId];
    let _id = applyInfo._id;
    let applicant = applyInfo.applyNickName;
    wx.showModal({
      title: '拒绝入队申请',
      content: '是否确认拒绝"' + applicant + '"入队？',
      success(res) {
        wx.cloud.callFunction({
          name: "refuseApply",
          data: {
            _id: _id
          },
          success: function (res) {
            console.log(res);
            wx.showToast({
              title: '已拒绝',
              icon: 'success',
              duration: 2000
            });
            that.updateApplyList();
          }
        })
      }
    })
  },

  //更新小队成员信息
  updateTeamMember() {
    let that = this;
    teamList.where({
      teamHeader: that.data.user.nickName
    }).get().then(res => {
      that.setData({
        team: res.data[0]
      })
      let teamMember = res.data[0].teamMemberList;
      let memberNum = teamMember.length;
      let memberList = [];
      for (let i = 0; i < memberNum; i++) {
        userList.where({
          nickName: teamMember[i]
        }).get().then(res => {
          memberList.push(res.data[0]);
          that.setData({
            memberList: memberList
          })
        })
      }
    });
  },

  //更新小队申请列表
  updateApplyList: function () {
    let that = this;
    applyTeamList.where({
      applyTeamId: that.data.team.id
    }).get().then(res => {
      let applyTeamList = [];
      let applyList = res.data;
      let length = applyList.length;
      that.setData({
        applyList: []
      });
      for (let i = 0; i < length; i++) {
        if (applyList[i].applyStatus == 0) {
          let nickName = applyList[i].applyNickName;
          userList.where({
            nickName: nickName
          }).get().then(res => {
            applyList[i].applyPhone = res.data[0].phone;
            applyList[i].applyQQ = res.data[0].qq;
            applyTeamList.push(applyList[i]);
            that.setData({
              applyList: applyTeamList
            })
          })
        }
      }
    })
  },

  addTeamMember: function () {
    //添加小队成员
    this.setData({
      showAdd: true
    })
  },
  hideForm: function () {
    this.setData({
      showAdd: false
    })
  },

  searchMember: function (e) {
    this.setData({
      searchMemberList: [],
      emptySearch: false
    })
    let name = e.detail.value;
    userList.where({
      nickName: name
    }).get().then(res => {
      if (res.data.length == 0) {
        this.setData({
          emptySearch: true
        })
      } else {
        this.setData({
          searchMemberList: res.data,
          emptySearch: false
        })
      }
    })
  },
  addMember: function (e) {
    let member = e.currentTarget.dataset.member;
    //判断小队成员是否已在小队
    let flag = 1;
    let teamMemberList = this.data.team.teamMemberList;
    if (member == this.data.team.teamHeader) {
      flag = 0;
    } else {
      for (let i = 0; i < teamMemberList.length; i++) {
        if (member == teamMemberList[i]) {
          flag = 0;
          break;
        }
      }
    }
    if (flag == 0) {
      wx.showToast({
        title: '该成员已在小队',
        icon: 'none'
      });
      return;
    }

    //判断小队是否已满
    if (teamMemberList.length == this.data.team.teamMemberNum) {
      wx.showToast({
        title: '小队已满',
        icon: 'none'
      });
      return;
    }

    //添加成员入队
    let that = this;
    wx.showModal({
      title: '添加成员入队',
      content: '是否确认添加"' + member + '"入队？',
      success(res) {
        if (res.confirm) {
          wx.showToast({
            title: '正在添加',
            icon: 'loading',
            duration: 2000
          })
          let _memberId = "";
          let searchMemberList = that.data.searchMemberList;
          for (let i = 0; i < searchMemberList.length; i++) {
            if (searchMemberList[i].nickName == member) {
              _memberId = searchMemberList[i]._id;
            }
          }
          wx.cloud.callFunction({
            name: "addTeamMember",
            data: {
              _teamId: that.data.team._id,
              member: member
            },
            success: function (res) {
              console.log(res);
              wx.cloud.callFunction({
                name: "updateUserOfAddMember",
                data: {
                  _memberId: _memberId,
                  teamId: that.data.team.id
                },
                success: function (res) {
                  console.log(res);
                  wx.showToast({
                    title: '添加成功',
                    icon: 'success',
                    duration: 2000
                  });
                  //更新页面
                  teamList.where({
                    teamHeader: that.data.user.nickName
                  }).get().then(res => {
                    that.setData({
                      team: res.data[0]
                    })
                    //获取小队成员信息
                    let teamMember = res.data[0].teamMemberList;
                    let memberNum = teamMember.length;
                    let memberList = [];
                    for (let i = 0; i < memberNum; i++) {
                      userList.where({
                        nickName: teamMember[i]
                      }).get().then(res => {
                        memberList.push(res.data[0]);
                        that.setData({
                          memberList: memberList
                        })
                      })
                    }
                  });
                  that.setData({
                    showAdd: false
                  })
                }
              })
            }
          })
        }
      }
    })
  },

  removeMember: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let member = this.data.memberList[id];
    let _memberId = member._id;
    wx.showModal({
      title: '删除成员',
      content: '确认要删除成员"' + member.userName + '"吗？',
      success(res) {
        if (res.confirm) {
          let teamMemberList = that.data.team.teamMemberList;
          let memberList = that.data.memberList;
          let length = teamMemberList.length;
          if (length == 0) {
            teamMemberList = [];
            memberList = [];
          } else {
            for (let i = id; i < length - 1; i++) {
              teamMemberList[i] = teamMemberList[i + 1];
              memberList[i] = memberList[i + 1];
            }
            teamMemberList.pop();
            memberList.pop();
          }
          that.setData({
            memberList: memberList
          })
          wx.cloud.callFunction({
            name: "removeMember",
            data: {
              _teamId: that.data.team._id,
              teamMemberList: teamMemberList
            },
            success: function (res) {
              console.log(res);
            }
          });
          wx.cloud.callFunction({
            name: "updateUserOfAddMember",
            data: {
              _memberId: _memberId,
              teamId: ""
            },
            success: function (res) {
              console.log(res);
            }
          })
        }
      }
    })
  },

  removeTeam: function () {
    let that = this;
    wx.showModal({
      title: '解散小队',
      content: '确认要解散小队"' + that.data.team.teamName + '"吗？',
      success(res) {
        if (res.confirm) {
          wx.showToast({
            title: '正在解散小队',
            icon: 'loading',
            duration: 2000
          })
          wx.cloud.callFunction({
            name: "removeTeam",
            data: {
              _id: that.data.team._id
            },
            success: function (res) {
              console.log(res);
            }
          });

          let memberList = that.data.memberList;
          let length = memberList.length;
          for (let i = 0; i < length; i++) {
            wx.cloud.callFunction({
              name: "updateUserOfAddMember",
              data: {
                _memberId: memberList[i]._id,
                teamId: ""
              },
              success: function (res) {
                console.log(res);
                wx.showToast({
                  title: '解散小队成功',
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
  //获取导游申请列表
  getApplyGuide: function () {
    applyGuideList.where({
      applyTeam: this.data.team.id
    }).get().then(res => {
      let applyGuideList = res.data;
      let length = applyGuideList.length;
      if (length == 0) {
        this.setData({
          applyGuideList: []
        })
      } else {
        for (let i = 0; i < length; i++) {
          guideList.where({
            id: applyGuideList[i].applyGuide
          }).get().then(res => {
            applyGuideList[i].guide = res.data[0];
            this.setData({
              applyGuideList: applyGuideList
            })
          })
        }
      }
    })
  },
  //获取导游信息
  getGuideInfo: function () {
    let teamGuide = this.data.team.teamGuide;
    if (teamGuide == "") {
      this.setData({
        guide: {},
        applyGuide: false
      })
    } else {
      guideList.where({
        guideName: this.data.team.teamGuide
      }).get().then(res => {
        this.setData({
          guide: res.data[0],
          applyGuide: true
        })
      })
    }

  },
  //确认申请信息
  confirmApply: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let applyList = this.data.applyGuideList;
    let guideInfo = applyList[id];
    if (guideInfo.applyStatus == 1) {
      wx.showModal({
        title: '申请成功',
        content: '你已成功聘请"' + guideInfo.guide.guideName + '"成为小队导游',
        showCancel: false,
        success(res) {
          wx.cloud.callFunction({
            name: "confirmApplyOfGuide",
            data: {
              _id: guideInfo._id
            },
            success: function (res) {
              console.log(res);
              that.getApplyGuide();
            }
          })
        }
      })
    } else {
      wx.showModal({
        title: '申请失败',
        content: '你的申请被拒绝，看看其他导游吧！',
        showCancel: false,
        success(res) {
          wx.cloud.callFunction({
            name: "confirmApplyOfGuide",
            data: {
              _id: guideInfo._id
            },
            success: function (res) {
              console.log(res);
              that.getApplyGuide();
            }
          })
        }
      })
    }
  },
  removeGuide: function (e) {
    let that = this;
    let team = this.data.team;
    wx.showModal({
      title: '解除导游关系',
      content: '确认解除与"' + team.teamGuide + '"的导游关系吗？',
      success(res) {
        if (res.confirm) {
          wx.showToast({
            title: '正在提交',
            icon: 'loading',
            duration: 2000
          });
          wx.cloud.callFunction({
            name: "updateTeamForAddGuide",
            data: {
              _id: team._id,
              guide: ""
            },
            success: function (res) {
              console.log(res);
            }
          });
          wx.cloud.callFunction({
            name: "updateGuideForApplyGuide",
            data: {
              _id: that.data.guide._id,
              teamId: ""
            },
            success: function (res) {
              console.log(res);
              wx.showToast({
                title: '已解除',
                icon: 'success',
                duration: 2000
              });
              that.setData({
                guide: {},
                applyGuide: false,
                [team.teamGuide]:""
              })
            }
          })
        }
      }
    })
  },
  applyGuide:function(){
    wx.navigateTo({
      url: '../guide/guide?province='+this.data.user.province + '&city=' + this.data.user.city,
    })
  },
  navigateTo:function(e){
    let author=e.currentTarget.dataset.author;
    wx.navigateTo({
      url: '../myStrategy/myStrategy?author='+author,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let user = app.globalData.user;
    this.setData({
      user: user,
      isLogin: true
    });

    //获取用户的的小队
    teamList.where({
      teamHeader: user.nickName
    }).get().then(res => {
      this.setData({
        team: res.data[0]
      })
      //获取申请列表
      applyTeamList.where({
        applyTeamId: res.data[0].id
      }).get().then(res => {
        let applyTeamList = [];
        let applyList = res.data;
        let length = applyList.length;
        for (let i = 0; i < length; i++) {
          if (applyList[i].applyStatus == 0) {
            let nickName = applyList[i].applyNickName;
            userList.where({
              nickName: nickName
            }).get().then(res => {
              applyList[i].applyPhone = res.data[0].phone;
              applyList[i].applyQQ = res.data[0].qq;
              applyTeamList.push(applyList[i]);
              this.setData({
                applyList: applyTeamList
              })
            })
          }
        }
      })

      //获取小队成员信息
      let teamMember = res.data[0].teamMemberList;
      let memberNum = teamMember.length;
      let memberList = [];
      for (let i = 0; i < memberNum; i++) {
        userList.where({
          nickName: teamMember[i]
        }).get().then(res => {
          memberList.push(res.data[0]);
          this.setData({
            memberList: memberList
          })
        })
      };

      this.getApplyGuide();
      this.getGuideInfo();
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})