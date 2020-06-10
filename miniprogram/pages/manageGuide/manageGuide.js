// miniprogram/pages/manageGuide/manageGuide.js
const app = getApp();
const db = wx.cloud.database();
const userList = db.collection('user');
const teamList = db.collection('team');
const guideList = db.collection('guide');
const applyGuideList = db.collection('applyGuide');
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
    windowHeight: app.globalData.windowHeight,

    guide: {}, //我的导游信息
    applyList: [],

    team: {},
    guideTeam: false,
  },
  navigateBack: function () {
    wx.navigateBack({
      delta: 1,
    })
  },
  navigateTo: function (e) {
    let id = e.currentTarget.dataset.id;
    let _id = this.data.applyList[id].team._id;
    wx.navigateTo({
      url: '../teamDetail/teamDetail?id=' + _id,
    })
  },
  navigateToTeam :function(){
    let _id=this.data.team._id;
    wx.navigateTo({
      url: '../teamDetail/teamDetail?id=' + _id,
    })
  },
  accept: function (e) {
    let id = e.currentTarget.dataset.applyid;
    let _id = this.data.applyList[id]._id;
    let team = this.data.applyList[id].team;
    let that = this;
    wx.showModal({
      title: '同意导游申请',
      content: '确认同意接受小队"' + team.teamName + '"的聘请吗？',
      success(res) {
        if (res.confirm) {
          wx.showToast({
            title: '正在提交',
            icon: 'loading',
            duration: 2000
          })
          wx.cloud.callFunction({
            name: "acceptGuideApply",
            data: {
              _id: _id
            },
            success: function (res) {
              console.log(res);
              wx.cloud.callFunction({
                name: "updateGuideForApplyGuide",
                data: {
                  _id: that.data.guide._id,
                  teamId: team.id
                },
                success: function (res) {
                  console.log(res);
                  wx.cloud.callFunction({
                    name: "updateTeamForAddGuide",
                    data: {
                      _id: team._id,
                      guide: that.data.guide.guideName,
                    },
                    success: function (res) {
                      console.log(res);
                      wx.showToast({
                        title: '已同意',
                        icon: 'success',
                        duration: 2000
                      });
                      // 刷新页面
                      that.getApplyList();
                      that.getGuideTeam();
                    }
                  })
                }
              })
            }
          });
        }
      }
    })
  },
  refuse: function(e){
    let id = e.currentTarget.dataset.applyid;
    let _id = this.data.applyList[id]._id;
    let team = this.data.applyList[id].team;
    let that = this;
    wx.showModal({
      title: '拒绝导游申请',
      content: '确认拒绝接受小队"' + team.teamName + '"的聘请吗？',
      success(res) {
        if (res.confirm) {
          wx.showToast({
            title: '正在提交',
            icon: 'loading',
            duration: 2000
          })
          wx.cloud.callFunction({
            name: "refuseGuideApply",
            data: {
              _id: _id
            },
            success: function (res) {
              console.log(res);
              wx.showToast({
                title: '已拒绝',
                icon: 'success',
                duration: 2000
              })
              // 刷新页面
              that.getApplyList();
            }
          });
        }
      }
    })
  },
  getApplyList: function() {
    //获取申请列表
    applyGuideList.where({
      applyGuide: this.data.guide.guideId
    }).get().then(res => {
      if (res.data.length == 0) {
        this.setData({
          applyList: []
        })
      } else {
        let applyList = res.data;
        let length = applyList.length;
        for (let i = 0; i < length; i++) {
          if (applyList[i].applyStatus == 0) {
            teamList.where({
              id: applyList[i].applyTeam
            }).get().then(res => {
              let team = res.data[0];
              userList.where({
                nickName: team.teamHeader
              }).get().then(res => {
                team.teamPhone = res.data[0].phone;
                team.teamQQ = res.data[0].qq;
                applyList[i].team = team;
                this.setData({
                  applyList: applyList
                })
              });
            })
          }else{
            this.setData({
              applyList: []
            })
          }
        }
      }
    })
  },
  getGuideTeam: function(){
    teamList.where({
      teamGuide: this.data.guide.guideName
    }).get().then(res=>{
      let team={};
      if(res.data.length==0){
        this.setData({
          team: team,
          guideTeam: false
        })
      }else{
        team=res.data[0];
        userList.where({
          nickName: team.teamHeader
        }).get().then(res => {
          team.teamPhone = res.data[0].phone;
          team.teamQQ = res.data[0].qq;
          this.setData({
            team: team,
            guideTeam: true
          })
        });
      }
    })
  },
  cancel: function(){
    let that=this;
    let team=this.data.team;
    wx.showModal({
      title:'取消带领小队',
      content:'确认取消带领小队"'+team.teamName+'"吗？',
      success(res){
        if(res.confirm){
          wx.showToast({
            title: '正在提交',
            icon:'loading',
            duration:2000
          });
          wx.cloud.callFunction({
            name:"updateTeamForAddGuide",
            data:{
              _id: team._id,
              guide:""
            },
            success:function(res){
              console.log(res);
            }
          });
          wx.cloud.callFunction({
            name:"updateGuideForApplyGuide",
            data:{
              _id:that.data.guide._id,
              teamId:""
            },
            success:function(res){
              console.log(res);
              wx.showToast({
                title: '已取消',
                icon:'success',
                duration:2000
              });
              that.getGuideTeam();
            }
          })
        }
      }
    })
  },
  removeGuide :function(){
    let that=this;
    let guide=this.data.guide;
    let team=this.data.team;
    wx.showModal({
      title:'注销导游',
      content:'是否确认注销"'+guide.guideName+'"的导游身份？',
      success(res){
        if(res.confirm){
          wx.showToast({
            title: '正在注销',
            icon:'loading',
            duration:2000
          });
          wx.cloud.callFunction({
            name:"updateTeamForAddGuide",
            data:{
              _id: team._id,
              guide:""
            },
            success:function(res){
              console.log(res);
            }
          });
          wx.cloud.callFunction({
            name:"updateGuideForApplyGuide",
            data:{
              _id:that.data.guide._id,
              teamId:""
            },
            success:function(res){
              console.log(res);
            }
          });
          wx.cloud.callFunction({
            name:"removeGuide",
            data:{
              _id:guide._id
            },
            success:function(res){
              console.log(res);
              wx.showToast({
                title: '已注销',
                icon:'success',
                duration:2000
              });
              that.navigateBack();
            }
          })
        }
      }
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
    //获取用户的导游信息
    guideList.where({
      guideNickName: user.nickName
    }).get().then(res => {
      this.setData({
        guide: res.data[0]
      });
      this.getApplyList();
      this.getGuideTeam();
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