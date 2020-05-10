// miniprogram/pages/view/view.js
const app = getApp();
const db = wx.cloud.database();
const viewList = db.collection('view');
var page = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    menuBottom: app.globalData.menuBottom,
    menuHeight: app.globalData.menuHeight,

    windowHeight: app.globalData.windowHeight,
    backUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/back.png",
    selectIcon: "cloud://test-wusir.7465-test-wusir-1302022901/icon/select.png",
    siftIcon: "cloud://test-wusir.7465-test-wusir-1302022901/icon/sift.png",

    hideSortFlag: true,
    sortType: ['综合排序', '评价优先', '高价优先', '低价优先', '销量优先'],
    chooseSortType: "综合排序",
    animationData: {}, //动画
    sortByStar: 0, //按评价优先排序

    hideFlag: true,
    menuTitle: "热门景点",
    chooseItem: 0,
    itemList: [
      ['全部景点', '其他景点', '自然风光', '公园游乐场', '名胜古迹', '演出演艺', '观光街区'],
      ['随订随用', '可定今日', '可定明日'],
      ['限时立减', '可用优惠券', '侣行优惠']
    ],
    menuContentHeight: "",
    chooseViewType: "游玩景点",
    chooseTimeType: "预定时限",

    //景点数据
    starIcon: "cloud://test-wusir.7465-test-wusir-1302022901/icon/star.png",
    grayStar: "cloud://test-wusir.7465-test-wusir-1302022901/icon/grayStar.png",
    viewList: [],
    city: '北京',
    flag: 0//当前城市所有数据已经遍历
  },

  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    })
  },
  //显示下拉菜单
  selectMenu: function(e) {
    var flag = e.currentTarget.dataset.flag;
    var that = this;
    if (flag == 'hideFlag') {
      that.setData({
        menuTitle: e.currentTarget.dataset.title,
        chooseItem: e.currentTarget.dataset.chooseitem,
        hideFlag: false
      });
    } else {
      that.setData({
        hideSortFlag: false
      });
    }
    // 创建动画实例
    var animation = wx.createAnimation({
      duration: 400, //动画的持续时间
      timingFunction: 'ease' //动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    });
    this.animation = animation; //将animation变量赋值给当前动画
    var time1 = setTimeout(function() {
      that.slideIn(); //调用动画--滑入
      clearTimeout(time1);
      time1 = null;
    }, 100)
  },

  //隐藏下拉菜单
  hideMenu: function(e) {
    var flag = e.currentTarget.dataset.flag;
    var that = this;
    var animation = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease'
    });
    this.animation = animation;
    that.slideOut(); //调用动画--滑出
    var time1 = setTimeout(function() {
      if (flag == 'hideFlag') {
        that.setData({
          hideFlag: true
        });
      } else {
        that.setData({
          hideSortFlag: true
        });
      }
      clearTimeout(time1);
      time1 = null;
    }, 220) //先执行下滑动画，再隐藏模块
  },
  // 更改排序选择
  changeSort: function(e) {
    page=0;//重新刷新页面
    this.hideMenu(e);
    var flag = e.currentTarget.dataset.flag;
    if (flag == 'hideSortFlag') { //排序选择
      let sortType = e.currentTarget.dataset.sorttype;
      this.setData({
        chooseSortType: sortType,
        flag: 0
      });
      if (sortType == '评价优先') {
        viewList.orderBy('star', 'desc').limit(5).where({
          city: this.data.city
        }).get({
          success: res => {
            this.setData({
              sortByStar: 1,
              viewList: res.data
            })
          }
        })
      }
    } else {
      var chooseItem = this.data.chooseItem;
      if (chooseItem == 0) {
        this.setData({
          chooseViewType: e.currentTarget.dataset.type,
        })
      } else if (chooseItem == 1) {
        this.setData({
          chooseTimeType: e.currentTarget.dataset.type,
        })
      } else if (chooseItem == 2) {

      }
    }
  },

  // 动画--滑入
  slideIn: function() {
    this.animation.translateY(0).step();
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      animationData: this.animation.export()
    })
  },
  // 动画--滑出
  slideOut: function() {
    this.animation.translateY(-300).step();
    this.setData({
      animationData: this.animation.export()
    })
  },

  //搜索结果
  changeView: function(e) {
    page=0;//重新刷新页面
    //获取初始景点信息
    const city = e.detail.value;
    this.setData({
      city: city,
      inputValue: "",
      flag: 0
    })
    viewList.limit(5).where({
        city: city
      })
      .get({
        success: res => {
          let length = res.data.length;
          this.setData({
            viewList: res.data
          })
          if (length == 0) {
            this.setData({
              flag: 1
            })
          }
        }
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    page=0;
    // 获取组件高度
    var query = wx.createSelectorQuery();
    query.select('.menuContent').boundingClientRect();
    query.exec((res) => {
      this.setData({
        menuContentHeight: res[0].height
      })
    });

    //获取初始景点信息
    let city = '北京'; //页面跳转携带城市数据
    if (options.city != undefined) {
      city = options.city.split('市')[0]
    }
    this.setData({
      city: city,
      flag: 0
    })
    viewList.limit(5).where({
        city: city
      })
      .get({
        success: res => {
          let length = res.data.length;
          if (length != 0) {
            this.setData({
              viewList: res.data
            })
          } else {
            this.setData({
              flag: 1
            })
          }
        }
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    page++;
    let city = this.data.city;
    if (this.data.sortByStar != 1) {
      viewList.skip(5 * page).limit(5).where({
          city: city
        }).get({
          success: res => {
            let old_data = this.data.viewList;
            let new_data = res.data;
            if (new_data.length == 0) {
              this.setData({
                flag: 1
              })
            } else {
              this.setData({
                viewList: old_data.concat(new_data)
              })
            }
          }
        });
    } else { //根据评价排序
      viewList.orderBy('star', 'desc').skip(5 * page).limit(5).where({
        city: city
      }).get({
        success: res => {
          let old_data = this.data.viewList;
          let new_data = res.data;
          if (new_data.length == 0) {
            this.setData({
              flag: 1
            })
          } else {
            this.setData({
              viewList: old_data.concat(new_data)
            })
          }
        }
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})