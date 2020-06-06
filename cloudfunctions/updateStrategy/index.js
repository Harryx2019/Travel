// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  try{
    return await db.collection('strategy').doc(event._id).update({
      data:{
        likeNum: _.set(event.likeList)
      }
    })
  }catch(e){
    console.error(e);
  }
}