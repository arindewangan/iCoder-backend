const mongoose = require('mongoose');
const { Schema } = mongoose;

const UsersSchema = new Schema({
    fname:{type:String,required:true},
    lname:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    date:{type:Date,default:Date.now},
});
const Users = mongoose.model('user',UsersSchema);
module.exports = Users;