// miniprogram/pages/team/team.js
const app = getApp();
const db = wx.cloud.database();
const userList = db.collection('user');
const team = db.collection('team');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    isLogin: false,

    swiperList: ["cloud://test-wusir.7465-test-wusir-1302022901/image/teamBack.png",
      "cloud://test-wusir.7465-test-wusir-1302022901/image/teamBacktwo.png"
    ],

    searchBackgroundColor: "none",
    inputBackgroundColor: "rgb(255,255,255,0.5)",
    searchUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/search.png",
    backUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/back.png",
    navBarHeight: app.globalData.navBarHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,
    menuWidth: app.globalData.menuWidth,

    // 选择小队所在地
    region: [],
    selectUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/select.png",

    teamList: [],

    chooseSortType: "筛选",
    animationData: {}, //动画
    hideFlag: false,

    teamEmpty: false,
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
    console.log(e);
    let author = e.currentTarget.dataset.nickname;
    wx.navigateTo({
      url: '../myStrategy/myStrategy?author=' + author,
    })
  },
  navigateToDetail: function (e) {
    let id = e.currentTarget.dataset.id;
    console.log(id);
    wx.navigateTo({
      url: '../teamDetail/teamDetail?id=' + id,
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
    this.getTeamList(province[0]);
  },
  showSort: function () {
    var that = this;
    that.setData({
      hideFlag: false
    });
    // 创建动画实例
    var animation = wx.createAnimation({
      duration: 400, //动画的持续时间
      timingFunction: 'ease' //动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    });
    this.animation = animation; //将animation变量赋值给当前动画
    var time1 = setTimeout(function () {
      that.slideIn(); //调用动画--滑入
      clearTimeout(time1);
      time1 = null;
    }, 100)
  },
  //隐藏下拉菜单
  hideSort: function (e) {
    this.changeSort(e);
    var that = this;
    var animation = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease'
    });
    this.animation = animation;
    var time1 = setTimeout(function () {
      that.slideOut(); //调用动画--滑出
      clearTimeout(time1);
      time1 = null;
    }, 220) //先执行下滑动画，再隐藏模块
  },
  // 动画--滑入
  slideIn: function () {
    this.animation.translateY(30).step();
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      animationData: this.animation.export()
    })
  },
  // 动画--滑出
  slideOut: function () {
    this.animation.translateY(-80).step();
    this.setData({
      animationData: this.animation.export()
    })
  },
  changeSort: function (e) {
    let status = e.currentTarget.dataset.status;
    if (status == 1) {
      this.setData({
        chooseSortType: "招募中"
      })
    } else if (status == 2) {
      this.setData({
        chooseSortType: "即刻出发"
      })
    } else {
      this.setData({
        chooseSortType: "正在旅行"
      })
    }
  },
  getTeamList: function (province) {
    //获取小队列表
    team.where({
      teamProvince: province
    }).limit(5).get({
      success: res => {
        let teamList = res.data;
        let length = teamList.length;
        if (length == 0) {
          this.setData({
            teamEmpty: true
          })
        } else {
          for (let i = 0; i < length; i++) {
            let status = teamList[i].teamStatus;
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
            teamList[i].teamStatusInfo = teamStatus;

            let memberList = teamList[i].teamMemberList;
            let memberNum = memberList.length;
            if (memberNum == 4) {
              teamList[i].teamStatus = 4;
            }

            let teamMemberInfo = [];
            let teamHeader = {};
            userList.where({
              nickName: teamList[i].teamHeader
            }).get().then(res => {
              teamHeader.nickName = teamList[i].teamHeader;
              teamHeader.avatarUrl = res.data[0].avatarUrl;
              teamMemberInfo.push(teamHeader);
              teamList[i].teamMemberInfo = teamMemberInfo;
              this.setData({
                teamList: teamList,
                teamEmpty: false
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

                  teamList[i].teamMemberInfo = teamMemberInfo;
                  this.setData({
                    teamList: teamList,
                    teamEmpty: false
                  })
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
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 3000
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
      this.getTeamList(province);
    }
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