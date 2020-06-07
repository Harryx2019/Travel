// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db=cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  try{
    return await db.collection('team').doc(event._teamId).update({
      //第一步 在team表中新增队员信息
      data:{
        teamMemberList: _.push(event.member)
      }
    })
  }catch(e){
    console.error(e);
  }
}