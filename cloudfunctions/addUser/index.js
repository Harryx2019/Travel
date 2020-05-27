// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let length = await db.collection('user').count();
    length = length.total;
    return await db.collection('user').add({
      data: {
        id: length+1,
        userName: "",
        nickName: event.nickName,
        avatarUrl: event.avatarUrl,
        sex: event.sex,
        province: event.province,
        city: event.city,
        isQulified: 0,
        schoolName: "",
        schoolProvince: "", 
        schoolCity: "",
        schoolDistrict :"",
        studentId: "",
        institute: "",
        grade: "",
        identityCard: "",
        viewNum: 0,
        coverImg: "cloud://test-wusir.7465-test-wusir-1302022901/image/myBackground.jpg",
        followList: [],
        beFollowedList: [],
        likeStrategyList: [],
      }
    })
  } catch (e) {
    console.log(e);
  }
}