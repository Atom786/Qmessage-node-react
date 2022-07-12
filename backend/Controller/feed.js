const { count } = require("console");
const { validationResult } = require("express-validator");
const fs = require("fs");
const { default: mongoose } = require("mongoose");
const path = require("path");
const Post = require("../model/post");
const user = require("../model/user");
const User = require("../model/user");

//////////////////////// Getting all Posts Endpoints//////////////
exports.getPosts = (req, res, next) => {
   
    const currentPage = req.query.page || 1;
    const perPage =4;
    let totalItems;
    Post.find().countDocuments().then(counts=>{
        totalItems = counts;
        return Post.find().skip((currentPage -1) * perPage).limit(perPage);
    }).then(posts=>{
        res.status(200).json({message:"Fetched posts Successfully", posts: posts, totalItems})
    }).catch(err=>{
        if (!err.statusCode) {
            err.statusCode =500;
        }
        next(err);
    })
}

//////////// Getting Single Post Endpoint///////
exports.getPost = (req,res,next)=>{
    const postId = req.params.postId;
    Post.findById(postId).then(post=>{
        if(!post){
            const error = new Error("Could not find Post in Database");
            error.statusCode =404;
            throw error;
        }
        res.status(200).json({message:"Post Fetched", post:post });
    }).catch(err=>{
        if (!err.statusCode) {
            err.statusCode =500;
        }
        next(err);
    })
}

////////////////Create Post Endpoint/////////////
exports.createpost = (req, res, next) => {

  const error = validationResult(req);
  if (!error.isEmpty()) {
    const error = new Error("Validation failed,enter valid data.");
    error.statusCode = 422;
    console.log("Validation failed,enter valid data"+ error)
    throw error;
  }
  if(!req.file){
      const error = new Error("No Image Provided");
      error.statusCode = 422;
      console.log("No Image Provided", +error)
      throw error;
  }
  const imageUrl = req.file.path.replace("\\","/");
  const title = req.body.title;
  const content = req.body.content;
  console.log("userid="+req.body.userId)
  let creator;
  const post = new Post({
    title: title,
    content: content,
    imageUrl:imageUrl,
    creator: req.userId,
  });
  post.save()
    .then((result) => {
        return User.findById(req.userId);
    }).then(user=>{
        
        creator = user;
        user.posts.push(post);
        return user.save();
    }).then(result=> {
        res.status(201).json({
        message: "Post create successfully",
        post: post,
        creator:{_id:creator._id, name:creator.name}

      });
    })
    .catch(err => {
        console.log(err)
        if(!err.statusCode){
            const error = new Error("Post invalid");
             error.statusCode =501;
             console.log("Post invalid"+ error)
        }
        next(error);
    });
};

exports.updatePost = (req,res,next)=>{
    const error = validationResult(req);
    if (!error.isEmpty()) {
      const error = new Error("Validation failed,enter valid data.");
      error.statusCode = 422;
      throw error;
    }
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUr =req.body.image;
    if(req.file){
        imageUr = req.file.path.replace("\\","/");
    }
    if(!imageUr){
        const error =new Error("No Image uploaded");
        error.statusCode = 422; 
        throw error;
    }
    Post.findById(postId).then(post=>{
        if(!post){
            const error = new Error("Could not find Post in Database");
            error.statusCode =404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error("Not Authorized!")
            error.statusCode =403
            throw error;
        }
        if (imageUr !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.content = content;
        post.imageUrl = imageUr;
        return post.save();
    }).then(result=>{
        res.status(200).json({message: "post updated", post: result});
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode =500;
        }
        next(err)
    })
}

exports.deletePost = (req,res,next)=>{
    const postId = req.params.postId;
    Post.findById(postId).then(post=>{
        //check logged user
        if(!post){
            const error = new Error("Could not find Post in Database");
            error.statusCode =404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error("Not Authorized!")
            error.statusCode =403
            throw error;
        }
        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);
    }).then(user=>{
        return User.findById(req.userId);
    }).then(user=>{
        user.posts.pull(postId);
        return user.save();
    }).then(result=>{
        res.status(200).json({message: "Deleted Post"})
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode =500;
        }
        next(err)
    })
}

const clearImage = filePath =>{
    filePath = path.join(__dirname,"..",filePath);
    fs.unlink(filePath,err=>{console.log(err)});
}

