// miniprogram/pages/index/index.js
const db=wx.cloud.database();
const indexNavigate=db.collection('indexNavigate');
const indexDestination=db.collection('indexDestination');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperImg: [
      "https://images.pexels.com/photos/130111/pexels-photo-130111.jpeg?auto=compress&amp;cs=tinysrgb&amp;h=750&amp;w=1260",
      "https://images.pexels.com/photos/2085998/pexels-photo-2085998.jpeg?auto=compress&amp;cs=tinysrgb&amp;h=750&amp;w=1260",
      "https://images.pexels.com/photos/1292843/pexels-photo-1292843.jpeg?auto=compress&amp;cs=tinysrgb&amp;h=750&amp;w=1260"
    ],

    //组件参数设置，传递到组件
    defaultData: {
      title: "主页" //导航栏标题
    },

    //首页导航栏数组
    navigateList: [],

    //热门目的地数组
    destinationList: [],

    // 攻略游记数组
    viewIcon:"cloud://test-wusir.7465-test-wusir-1302022901/icon/view.png",
    likeIcon:"cloud://test-wusir.7465-test-wusir-1302022901/icon/like.png",
    strategyList:[
      {
        id: "8871054",
        title: "古城游记",
        author: "酸柠萌yu",
        school: "济南大学",
        authorImg: "https://b1-q.mafengwo.net/s15/M00/05/29/CoUBGV2TCeiAe4GLAABzooBi_TY73.jpeg?imageMogr2%2Fthumbnail%2F%21200x200r%2Fgravity%2FCenter%2Fcrop%2F%21200x200%2Fquality%2F90",
        publishDate: "2018/8/2",
        destination: "台儿庄",
        travelDays:"1天",
        averageCost:"500",
        coverImg: "http://n2-q.mafengwo.net/s11/M00/75/30/wKgBEFrIGLuAUk01AAoHzhtEFxM61.jpeg?imageMogr2%2Fstrip",
        viewNum:"2300",
        likeNum:"150",
        content: "一直都想去台儿庄古城逛逛，感受一下古老城墙的氛围。在临沂上学马上就要毕业了感觉一定要去一趟，就这样开始了旅程。台儿庄的门票学生价75可多次进出，临沂市民40但不可多次进出。我们选择了75的打算多逛逛。提醒大家出去之前一定要看好出行方式的时间。结果第二课天我们中午就要走了也没呢再进去逛逛。浪费了35块钱。解决好门票就要解决住宿的问题了。因为去的时候正值高峰期，房价特别贵我们就定了青旅，如果是学生党的话推荐这家店超级棒，可以有一种不一样的体验。先上一波图片感受一下。我们住的是八人间，房间很干净，店家人也很好很热情，第一次住青旅体验很好。一楼大院里的墙都写满来到这里的人的故事。住的地方很方便，在游客服务中心旁边步行3分钟，可以在服务中心买车票或者船票去古城的南门。青旅旁边有贺敬之的纪念馆。再旁边是台儿庄战役纪念馆，一定要去看看，纪念馆旁边也有卖一些小吃的。纪念馆一进去就可以看到院子里放的各种武器，一楼有一个放映厅，如果不赶时间的话可以在那里看一会，二楼有展示的报纸资料，人物资料和各种事迹。这是一张台儿庄的复原模型，可以说是非常的辉煌、繁华了。古城里面可以下午去3点多看看白天的节目表演，逛到傍晚看看夜景。古城里面有很多小的场馆，很值得看一看的。古城最美的就是夜景了吧，还有酒吧一条街可以逛逛不过消费略贵没有进去。在古城的河边走一走逛一逛也是不错的。旁边还有一个湿地公园，时间不够也没有去，如果要玩的话推荐2天，第一天白天逛一下2个纪念馆，下午到傍晚的时候去古城里面逛一下看看表演和夜色。第二天去湿地公园逛一下。感觉这个旅行还是很愉快的。希望你们也玩的开心。"
      }
    ]

  },

  navigateTo: function(e){
    let page = e.currentTarget.dataset.page;
    let city = e.currentTarget.dataset.city;
    wx.navigateTo({
      url: '../'+page+'/'+page+'?city='+city
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    indexNavigate.get({
      success:res=>{
        this.setData({
          navigateList: res.data
        })
      }
    });

    indexDestination.limit(4).get({
      success:res=>{
        this.setData({
          destinationList: res.data
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