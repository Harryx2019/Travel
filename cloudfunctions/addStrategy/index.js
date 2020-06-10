// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let length = await db.collection('strategy').count();
    length = length.total;
    return await db.collection('strategy').add({
      data: {
        id : length+1,
        author:event.author,//作者
        authorImg:event.authorImg,//作者头像
        avarageCost:event.avarageCost,//平均消费
        content:event.content,//游记
        coverImg:event.coverImg,//游记封面
        destination:event.destination,//目的地
        likeNum:[],//点赞
        province:event.province,//作者省份
        city:event.city,//作者城市
        publishDate:event.publishDate,//发布日期
        setoutDate:event.setoutDate,//出发时间
        title:event.title,//游记题目
        travelDays:event.travelDays,//旅行天数
        university:event.university,//作者学校
        viewNum: 0
      }
    })
  } catch (e) {
    console.log(e);
  }
}