// miniprogram/pages/strategy/strategy.js
const app = getApp();
const db = wx.cloud.database();
const swiperList = db.collection('indexDestination');
const guide = db.collection('guide');
const indexStrategy = db.collection('strategy');
var page=0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    menuTop: app.globalData.navBarHeight - app.globalData.menuBottom - app.globalData.menuHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,
    searchBackgroundColor: "none",
    inputBackgroundColor: "rgb(255,255,255,0.5)",
    inputValue :"",

    strategyBgc: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1588572661620&di=0901ca7d0e06d3eb74da086c9079de2a&imgtype=0&src=http%3A%2F%2Fpic.90sjimg.com%2Fdesign%2F01%2F32%2F99%2F52%2F59682441decb1.png%2521%2Ffwfh%2F804x602%2Fquality%2F90%2Funsharp%2Ftrue%2Fcompress%2Ftrue",
    searchUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/search.png",
    backUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/back.png",

    // 地区
    region: ['北京市', '北京市', '东城区'],
    selectUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/select.png",

    //天气
    tempreture: "",
    weatherImg: "",

    //轮播图
    swiperList: [],
    swiperCity: "",

    // 推荐导游
    moreSrc: "cloud://test-wusir.7465-test-wusir-1302022901/icon/more.png",
    recommendGuide: [],

    //热门景点
    starIcon: "cloud://test-wusir.7465-test-wusir-1302022901/icon/star.png",
    recommendView: [{
        viewName: "丽江古城",
        viewImg: "http://b1-q.mafengwo.net/s5/M00/BF/3B/wKgB3FFuGt2AaZkbAAa9V_96uas42.jpeg",
        viewDes: "丽江地区位于云南省西北部云贵高原与青藏高原的连接部位，曾是是丝绸之路和茶马古道的中转站，历史非常悠久，因为独特人文和自然景观，成为近国内人气非常高的旅行胜地。\n丽江古城又叫大研古镇，是中国为数不多的少数民族古城，被评为“世界文化遗产”：这里有浓郁的民族风情，小桥流水式的布局，错落有致的民居建筑，还有散漫的生活节奏丰富的夜生活。\n不少旅行者以为丽江古城就是丽江，其实不然。除了古城，丽江地区面积远大于丽江古城，这里有很多值得游览的地方——比如神秘的“东方女儿国”泸沽湖，安静闲适的束河古镇，巍峨雄伟的玉龙雪山和山清水秀的拉市海等地。",
        location: "云南·丽江",
        star: 5
      },
      {
        viewName: "丽江古城",
        viewImg: "http://b1-q.mafengwo.net/s5/M00/BF/3B/wKgB3FFuGt2AaZkbAAa9V_96uas42.jpeg",
        viewDes: "丽江地区位于云南省西北部云贵高原与青藏高原的连接部位，曾是是丝绸之路和茶马古道的中转站，历史非常悠久，因为独特人文和自然景观，成为近国内人气非常高的旅行胜地。\n丽江古城又叫大研古镇，是中国为数不多的少数民族古城，被评为“世界文化遗产”：这里有浓郁的民族风情，小桥流水式的布局，错落有致的民居建筑，还有散漫的生活节奏丰富的夜生活。\n不少旅行者以为丽江古城就是丽江，其实不然。除了古城，丽江地区面积远大于丽江古城，这里有很多值得游览的地方——比如神秘的“东方女儿国”泸沽湖，安静闲适的束河古镇，巍峨雄伟的玉龙雪山和山清水秀的拉市海等地。",
        location: "云南·丽江",
        star: 5
      }
    ],

    // 热门攻略
    viewIcon: "cloud://test-wusir.7465-test-wusir-1302022901/icon/view.png",
    likeIcon: "cloud://test-wusir.7465-test-wusir-1302022901/icon/like.png",
    strategyList: [],
    //判断攻略是否遍历完
    flag : 0
  },

  navigateTo: function(e) {
    let page = e.currentTarget.dataset.page;
    let city = e.currentTarget.dataset.city;
    wx.navigateTo({
      url: '../' + page + '/' + page + '?city=' + city
    })
  },

  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  changeRegion: function(e) {
    let region = e.detail.value;
    this.setData({
      region: region
    });
    this.getWeather();
    //更改攻略
    let chooseCity = e.detail.value[0];
    if (chooseCity[2] == '市') {
      chooseCity = chooseCity.split("市");
    } else {
      chooseCity = chooseCity.split("省");
    }
    let city = chooseCity[0];
    indexStrategy.limit(5).where({
        city: city
      })
      .get({
        success: res => {
          this.setData({
            strategyList: res.data
          })
        }
      });
  },

  changeSwiperCity: function(e) {
    this.setData({
      swiperCity: this.data.swiperList[e.detail.current].city
    })
  },

  // 点击轮播图更新页面
  changeStrategy: function(e) {
    let inputValue=e.detail.value;
    let province="";
    let city="";
    if (inputValue!=undefined){
      province=inputValue;
      city=inputValue;
      this.setData({
        inputValue: ""
      })
    }
    else{
      province = e.currentTarget.dataset.province;
      city = e.currentTarget.dataset.city;
    }
    
    this.setData({
      region: [province, city, ""]
    });
    this.getWeather();
    indexStrategy.limit(5).where({
        city: province
      })
      .get({
        success: res => {
          this.setData({
            strategyList: res.data
          })
        }
      });
  },

  //获取天气
  getWeather: function() {
    let that = this;
    wx.request({
      url: 'https://free-api.heweather.net/s6/weather/now?',
      data: {
        location: that.data.region[1],
        key: '5bc9c69fd43145eaa55735df36e0cc4f'
      },
      success: function(res) {
        let status = res.data.HeWeather6[0].status;
        if (status != "ok") {
          that.setData({
            region: ['北京市', '北京市', '东城区']
          });
          that.getWeather();
        } else {
          that.setData({
            tempreture: res.data.HeWeather6[0].now.tmp,
            weatherImg: "cloud://test-wusir.7465-test-wusir-1302022901/weather/" + res.data.HeWeather6[0].now.cond_code + ".png",
          })
        }
      }
    })
  },

  onPageScroll: function(res) {
    if (res.scrollTop >= 265) {
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //province,city为攻略加载参数，不要加市
    let province = "北京";
    if (options.province != undefined) {
      province = options.province;
    }
    let city = "北京";
    if (options.city != undefined) {
      city = options.city;
    }

    // 修改region数据
    let region = [province, city, ""]
    this.setData({
      region: region
    });
    // 加载天气(city)、攻略(province)
    this.getWeather();
    indexStrategy.limit(5).where({
        city: province
      })
      .get({
        success: res => {
          this.setData({
            strategyList: res.data
          })
        }
      });

    swiperList.limit(5).get({
      success: res => {
        this.setData({
          swiperList: res.data,
          swiperCity: res.data[0].city
        })
      }
    });
    guide.limit(3).get({
      success: res => {
        this.setData({
          recommendGuide: res.data
        })
      }
    });
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
    let province=this.data.region[0];
    indexStrategy.skip(5*page).limit(5).where({
      city: province
    })
      .get({
        success: res => {
          let old_data=this.data.strategyList;
          let new_data=res.data;
          if(new_data.length==0){
            this.setData({
              flag: 1
            })
          }
          else{
            this.setData({
              strategyList: old_data.concat(new_data)
            })
          }
        }
      });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})