// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db=cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  try{
    let length = await db.collection('team').count();
    length = length.total;
    return await db.collection('team').add({
      data: {
        id: length+1,
        teamName: event.teamName,//名称
        teamHeadImg: event.teamHeadImg,//头像
        teamCoverImg: event.teamHeadImg,//封面
        teamHeader: event.teamHeader,//队长
        teamDescription: event.teamDescription,//简介
        teamNotice: event.teamNotice,//公告
        teamProvince: event.teamProvince,//省份
        teamCity:event.teamCity,//城市
        teamSchool:event.teamSchool,//学校
        teamDestination:event.teamDestination,//目的地
        teamSetOutDate:event.teamSetOutDate,//出发日期
        teamTravelDate:event.teamTravelDate,//旅行天数
        teamMemberNum:event.teamMemberNum,//人数
        teamMemberList:[],//小队成员
        teamStatus:event.teamStatus,//小队状态
        teamGuide:''//小队导游
      }
    })
  }catch(e){
    console.log(e);
  }
}