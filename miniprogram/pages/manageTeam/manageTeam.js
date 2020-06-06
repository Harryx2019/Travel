// miniprogram/pages/manegeTeam/manegeTeam.js
const app = getApp();
const db = wx.cloud.database();
const userList = db.collection('user');
const teamList = db.collection('team');
const applyTeamList = db.collection('applyTeam');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigateBackgroundColor: "none",

    user: {},
    team: {},
    applyList: [],
    memberList:[],

    navBarHeight: app.globalData.navBarHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,
    windowWidth: app.globalData.windowWidth,
    windowHeight: app.globalData.windowHeight,

    showAdd: false,
    searchMemberList:[]
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
  addTeamMember: function(){
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

  searchMember: function(e){
    let name=e.detail.value;
    userList.where({
      nickName: name
    }).get().then(res=>{
      this.setData({
        searchMemberList: res.data
      })
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
      teamHeader: '起点'
    }).get().then(res => {
      this.setData({
        team: res.data[0]
      })
      //获取申请列表
      applyTeamList.where({
        applyTeamId: res.data[0].id
      }).get().then(res=>{
        let applyList=res.data;
        let length=applyList.length;
        for(let i=0;i<length;i++){
          let nickName=applyList[i].applyNickName;
          userList.where({
            nickName: nickName
          }).get().then(res=>{
            applyList[i].applyPhone=res.data[0].phone;
            applyList[i].applyQQ=res.data[0].qq;
            this.setData({
              applyList: applyList
            })
          })
        }
      })

      //获取小队成员信息
      let teamMember=res.data[0].teamMemberList;
      let memberNum=teamMember.length;
      let memberList=[];
      for(let i=0;i<memberNum;i++){
        userList.where({
          nickName: teamMember[i]
        }).get().then(res=>{
          memberList.push(res.data[0]);
          this.setData({
            memberList: memberList
          })
        })
      }
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