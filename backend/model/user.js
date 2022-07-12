const mongoose = require("mongoose");
 const Schema = mongoose.Schema;

 const User = new Schema({
     email:{
         type:String,
         require:true
     },
     password:{
         type:String,
         require:true
     },
     name:{
         type:String,
         required:true
     },
     status:{
         type:String,
         default:"I am New User!"
     },
     posts:[
         {
             type:Schema.Types.ObjectId,
             ref:"Post"
         }
     ]
 });

 module.exports = mongoose.model("UserofFeeds", User);