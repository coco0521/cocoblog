var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var config = require('../config');
mongoose.connect(config.dbUrl);
//把user的model暴露给需要user.js
exports.User = mongoose.model('user',new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    avatar:String
}));

exports.Article = mongoose.model('article',new mongoose.Schema({
    //这里面的user应该是已登录的用户，所以有objectId,是一个对象ID类型，引用用户模型
    user:{type:ObjectId,ref:'user'},
    title:String,
    content:String,
    pv:{type:Number,default:0},
    poster:String,
    comments:[{user:{type:ObjectId,ref:'user'},content:String,createAt:{type:Date, default:Date.now}}],
    createAt:{type:Date,default:Date.now()}
}));

