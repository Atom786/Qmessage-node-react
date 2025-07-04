// const UserofFeeds = require("../model/user")
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Post = new Schema ({
    title:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    creator:{
        type:Schema.Types.ObjectId,
        ref: "UserofFeeds",
        required:true
       
    }
},
    { timestamps: true}
);

module.exports = mongoose.model("Post", Post)
