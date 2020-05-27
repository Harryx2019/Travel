// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db=cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  try{
    return await db.collection('user').doc(event._id).update({
      data:{
        userName: event.userName,
        isQulified: 2,
        schoolName: event.schoolName,
        schoolProvince: event.schoolProvince, 
        schoolCity: event.schoolCity,
        schoolDistrict :event.schoolDistrict,
        studentId: event.studentId,
        institute: event.institute,
        grade: event.grade,
        identityCard: event.identityCard,
      }
    })
  }catch(e){
    console.error(e);
  }
}