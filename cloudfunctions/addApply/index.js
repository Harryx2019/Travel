// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let length = await db.collection('applyTeam').count();
    length = length.total;
    return await db.collection('applyTeam').add({
      data: {
        id : length+1,
        applyName: event.userName,//申请人姓名
        applyNickName: event.nickName,//申请人微信名
        applyAvatarUrl: event.avatarUrl,//申请人头像
        applySex: event.sex,//申请人性别
        applyTeamId: event.teamId,//申请小队编号
        applyContent: event.personalDescription,//申请人简介
        applySchool: event.school,//申请人学校
        applyInsitude: event.institute,//申请人学院
        applyGrade: event.grade,//申请人年级
        applyProvince: event.province,//申请人所在省份
        applyCity: event.city,//申请人所在城市
        applyStatus: 0
      }
    })
  } catch (e) {
    console.log(e);
  }
}