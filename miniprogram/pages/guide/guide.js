// miniprogram/pages/guide/guide.js
const app = getApp();
const db = wx.cloud.database();
const userList = db.collection('user');
const teamList = db.collection('team');
const guideList = db.collection('guide');
const applyList = db.collection('applyGuide');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    isLogin: false,

    swiperList: ["cloud://test-wusir.7465-test-wusir-1302022901/image/teamBacktwo.png",
      "cloud://test-wusir.7465-test-wusir-1302022901/image/teamBack.png"
    ],

    searchBackgroundColor: "none",
    inputBackgroundColor: "rgb(255,255,255,0.5)",
    searchUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/search.png",
    backUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/back.png",
    navBarHeight: app.globalData.navBarHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,
    menuWidth: app.globalData.menuWidth,

    // 选择导游所在地
    region: [],
    selectUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/select.png",

    guideEmpty: false,
    guideList: [],

  },
  getUserInfo: function (e) {
    let userList = db.collection('user');
    userList.where({
      nickName: e.detail.userInfo.nickName
    }).get({
      success: res => {
        let userInfo = e.detail.userInfo;
        let user = {};
        user.nickName = userInfo.nickName;
        user.avatarUrl = userInfo.avatarUrl;

        if (userInfo.gender == 1) {
          user.sex = 'male';
        } else {
          user.sex = 'female';
        }
        user.province = userInfo.province;
        user.city = userInfo.city;
        if (res.data.length == 0) {
          wx.cloud.callFunction({
            name: 'addUser',
            data: {
              nickName: user.nickName,
              avatarUrl: user.avatarUrl,
              sex: user.sex,
              province: user.province,
              city: user.city
            },
            success: function (res) {
              console.log(res);
            }
          })
        }
        this.setData({
          user: user,
          isLogin: true
        });
        app.globalData.isLogin = true;
        app.globalData.user = user;
      }
    })
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
  onPageScroll: function (res) {
    if (res.scrollTop >= 26) {
      this.setData({
        searchBackgroundColor: "white",
        inputBackgroundColor: "rgb(245,245,245)"
      })
    } else {
      this.setData({
        searchBackgroundColor: "none",
        inputBackgroundColor: "rgb(255,255,255,0.5)"
      })
    }
  },
  changeRegion: function (e) {
    this.setData({
      region: e.detail.value
    });
    //处理省份字符串
    let province = e.detail.value[0];
    if (province[2] == '市') {
      province = province.split("市");
    } else {
      province = province.split("省");
    }
    this.getGuideList(province[0]);
  },
  getGuideList: function (province) {
    guideList.where({
      guideProvince: province
    }).limit(5).get({
      success: res => {
        if (res.data.length == 0) {
          this.setData({
            guideList: [],
            guideEmpty: true
          })
        } else {
          let guideList=[];
          let guideTempList=res.data;
          let length=guideTempList.length;
          for(let i=0;i<length;i++){
            if(guideTempList[i].guideStatus==1){
              guideList.push(guideTempList[i]);
            }
          }
          this.setData({
            guideList: guideList,
            guideEmpty: false
          })
        }
      }
    })
  },
  applyGuide: function (e) {
    //首先判断用户是否有自己的小队，只有队长可以聘请导游
    teamList.where({
      teamHeader: this.data.user.nickName
    }).get().then(res => {
      if (res.data.length == 0) {
        wx.showToast({
          title: '您暂未拥有小队',
          icon: 'none',
          duration: 2000
        })
      } else {
        let team = res.data[0];
        //查询该小队是否已经拥有导游
        if (team.teamGuide != "") {
          wx.showToast({
            title: '您的小队已经聘请导游啦！',
            icon: 'none',
            duration: 2000
          })
        } else {
          let id = e.currentTarget.dataset.id;
          let guide = this.data.guideList[id];
          applyList.where({
            applyTeam: team.id,
            applyGuide: guide.id
          }).get().then(res => {
            if (res.data.length != 0) {
              //查询小队是否已经向导游提交聘请信息
              if (res.data[0].applyStatus == 0) {
                wx.showToast({
                  title: '您已向该导游提交聘请啦，请耐心等候',
                  icon: 'none'
                })
              }
            } else {
              wx.showModal({
                title: '聘请导游',
                content: '是否确认为小队"' + team.teamName + '"聘请"' + guide.guideName + '"为导游？',
                success(res) {
                  if (res.confirm) {
                    wx.showToast({
                      title: '正在提交申请',
                      icon: 'loading',
                      duration: 2000
                    })
                    wx.cloud.callFunction({
                      name: "addApplyGuide",
                      data: {
                        guideId: guide.id,
                        teamId: team.id
                      },
                      success: function (res) {
                        console.log(res);
                        wx.showToast({
                          title: '申请成功',
                          icon: 'success',
                          duration: 2000
                        })
                      }
                    })
                  }
                }
              })
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
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 2000
    })
    let isLogin = app.globalData.isLogin;
    if (isLogin) {
      this.setData({
        user: app.globalData.user,
        isLogin: true
      });
    }

    //province,city为小队加载参数，不要加市
    let province = "北京";
    if (options.province != undefined) {
      province = options.province;
      if (province[2] == '市') {
        province = province.split("市");
      } else {
        province = province.split("省");
      }
      province = province[0];
      this.getGuideList(province);
    }
    this.getGuideList(province);
    let city = "北京";
    if (options.city != undefined) {
      city = options.city;
    }
    let district = "东城区";
    if (options.district != undefined) {
      distinct = options.district;
    }
    // 修改region数据
    let region = [province, city, district];
    this.setData({
      region: region
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