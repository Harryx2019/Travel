// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let length = await db.collection('applyGuide').count();
    length = length.total;
    return await db.collection('applyGuide').add({
      data: {
        id : length+1,
        applyGuide: event.guideId,
        applyTeam: event.teamId,
        applyStatus: 0
      }
    })
  } catch (e) {
    console.log(e);
  }
}