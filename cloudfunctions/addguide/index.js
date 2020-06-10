// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let length = await db.collection('guide').count();
    length = length.total;
    return await db.collection('guide').add({
      data: {
        id : length+1,
        guideName: event.guideName,//申请人姓名
        guideNickName: event.nickName,//申请人微信名
        guideImg: event.avatarUrl,//申请人头像
        guideSex: event.sex,//申请人性别
        guidePhone: event.phone,//申请人电话
        guideQQ:event.qq,//申请人QQ
        guideTeamId: "",//申请小队编号
        guideDescription: event.guideDescription,//申请人简介
        guideSchool: event.school,//申请人学校
        guideProvince: event.province,//申请人所在省份
        guideCity: event.city,//申请人所在城市
        guideStatus: 0,//导游申请状态
        guideGrade:"",
        guideIdentiCard1:event.identityCard1,//导游证件信息
        guideIdentiCard2:event.identityCard2,
      }
    })
  } catch (e) {
    console.log(e);
  }
}