// miniprogram/pages/strategy/strategy.js
const app=getApp();
const db=wx.cloud.database();
const swiperList=db.collection('indexDestination');
const guide=db.collection('guide');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    menuTop: app.globalData.navBarHeight - app.globalData.menuBottom - app.globalData.menuHeight,
    menuHeight: app.globalData.menuHeight,
    menuBottom: app.globalData.menuBottom,
    searchBackgroundColor:"none",
    inputBackgroundColor: "rgb(255,255,255,0.5)",
    
    strategyBgc: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1588572661620&di=0901ca7d0e06d3eb74da086c9079de2a&imgtype=0&src=http%3A%2F%2Fpic.90sjimg.com%2Fdesign%2F01%2F32%2F99%2F52%2F59682441decb1.png%2521%2Ffwfh%2F804x602%2Fquality%2F90%2Funsharp%2Ftrue%2Fcompress%2Ftrue",
    searchUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/search.png",
    backUrl:"cloud://test-wusir.7465-test-wusir-1302022901/icon/back.png",

    // 地区
    region: ['北京市', '北京市', '东城区'],
    selectUrl: "cloud://test-wusir.7465-test-wusir-1302022901/icon/select.png",

    //天气
    tempreture:"",
    weatherImg: "",

    //轮播图
    swiperList :[],
    swiperCity: "",

    // 推荐导游
    moreSrc: "cloud://test-wusir.7465-test-wusir-1302022901/icon/more.png",
    recommendGuide :[],

    //热门景点
    starIcon: "cloud://test-wusir.7465-test-wusir-1302022901/icon/star.png",
    recommendView: [
      {
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
    strategyList: [
      {
        id: "8871054",
        title: "古城游记",
        author: "酸柠萌yu",
        school: "济南大学",
        authorImg: "https://b1-q.mafengwo.net/s15/M00/05/29/CoUBGV2TCeiAe4GLAABzooBi_TY73.jpeg?imageMogr2%2Fthumbnail%2F%21200x200r%2Fgravity%2FCenter%2Fcrop%2F%21200x200%2Fquality%2F90",
        publishDate: "2018/8/2",
        destination: "台儿庄",
        travelDays: "1天",
        averageCost: "500",
        coverImg: "http://n2-q.mafengwo.net/s11/M00/75/30/wKgBEFrIGLuAUk01AAoHzhtEFxM61.jpeg?imageMogr2%2Fstrip",
        viewNum: "2300",
        likeNum: "150",
        content: "一直都想去台儿庄古城逛逛，感受一下古老城墙的氛围。在临沂上学马上就要毕业了感觉一定要去一趟，就这样开始了旅程。台儿庄的门票学生价75可多次进出，临沂市民40但不可多次进出。我们选择了75的打算多逛逛。提醒大家出去之前一定要看好出行方式的时间。结果第二课天我们中午就要走了也没呢再进去逛逛。浪费了35块钱。解决好门票就要解决住宿的问题了。因为去的时候正值高峰期，房价特别贵我们就定了青旅，如果是学生党的话推荐这家店超级棒，可以有一种不一样的体验。先上一波图片感受一下。我们住的是八人间，房间很干净，店家人也很好很热情，第一次住青旅体验很好。一楼大院里的墙都写满来到这里的人的故事。住的地方很方便，在游客服务中心旁边步行3分钟，可以在服务中心买车票或者船票去古城的南门。青旅旁边有贺敬之的纪念馆。再旁边是台儿庄战役纪念馆，一定要去看看，纪念馆旁边也有卖一些小吃的。纪念馆一进去就可以看到院子里放的各种武器，一楼有一个放映厅，如果不赶时间的话可以在那里看一会，二楼有展示的报纸资料，人物资料和各种事迹。这是一张台儿庄的复原模型，可以说是非常的辉煌、繁华了。古城里面可以下午去3点多看看白天的节目表演，逛到傍晚看看夜景。古城里面有很多小的场馆，很值得看一看的。古城最美的就是夜景了吧，还有酒吧一条街可以逛逛不过消费略贵没有进去。在古城的河边走一走逛一逛也是不错的。旁边还有一个湿地公园，时间不够也没有去，如果要玩的话推荐2天，第一天白天逛一下2个纪念馆，下午到傍晚的时候去古城里面逛一下看看表演和夜色。第二天去湿地公园逛一下。感觉这个旅行还是很愉快的。希望你们也玩的开心。"
      }
    ]
  },

  navigateBack:function(){
    wx.navigateBack({
      delta: 1
    })
  },
  changeRegion: function(e){
    this.setData({
      region: e.detail.value
    });
    this.getWeather();
  },

  changeSwiperCity:function(e){
    this.setData({
      swiperCity: this.data.swiperList[e.detail.current].city
    })
  },

  //获取天气
  getWeather:function(){
    let that=this;
    wx.request({
      url: 'https://free-api.heweather.net/s6/weather/now?',
      data:{
        location: that.data.region[1],
        key:'5bc9c69fd43145eaa55735df36e0cc4f'
      },
      success:function(res){
        that.setData({
          tempreture: res.data.HeWeather6[0].now.tmp,
          weatherImg: "cloud://test-wusir.7465-test-wusir-1302022901/weather/" + res.data.HeWeather6[0].now.cond_code+ ".png",
        })
      }
    })
  },

  onPageScroll: function (res) {
    if (res.scrollTop >= 265){
      this.setData({
        searchBackgroundColor: "white",
        inputBackgroundColor: "rgb(245,245,245)"
      })
    }
    else{
      this.setData({
        searchBackgroundColor: "none",
        inputBackgroundColor: "rgb(255,255,255,0.5)"
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let region=["",options.city,""]
    this.setData({
      region: region
    });
    swiperList.limit(5).get({
      success:res=>{
        this.setData({
          swiperList: res.data,
          swiperCity: res.data[0].city
        })
      }
    });
    guide.limit(3).get({
      success:res=>{
        this.setData({
          recommendGuide: res.data
        })
      }
    });
    this.getWeather();
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