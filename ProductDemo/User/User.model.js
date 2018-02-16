var mongoose = require('mongoose');
var Schema = mongoose.Schema;


 const User = new mongoose.Schema({
     userName : {
         type:String
     },
     userEmail :{
         type : String,
     },
     userDOB :{
         type:Date
     },
     userProfile: {
         data: Buffer, contentType: String
     },
     userSecQuestion: {
         type:String
     },
     userSecAnswer: {
         type:String
     },
     userPassword:
         {
           type:String
         },
     userToken :{
         type:String
     }

 });

 User.method({});
var user =  mongoose.model('User',User);
module.exports = user;