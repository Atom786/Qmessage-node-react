const { validationResult, Result } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../model/user");

exports.signup= (req,res,next)=>{
    // console.log(req)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed:");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
  
    bcrypt.hash(password, 12).then(hashedPw =>{
        const User1 = new User({
            email:email,
            password:hashedPw,
            name:name,
        });
        return User1.save();
    }).then(result=>{
        res.status(201).json({message: "User created Successfully", userId:result._id })
    }).catch(err=>{
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });

};

exports.login = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    let loadUser;
    User.findOne({email:email}).then(user=>{
        if(!user){
            const error = new Error("A user with this email not found!!")
            error.statusCode = 401;
            throw error;
        }
        loadUser = user;
        return bcrypt.compare(password,user.password);

    }).then(isEqual=>{
        if (!isEqual) {
            const error = new Error("Wrong password");
            error.statusCode = 401;
            throw error;
        }
        console.log((loadUser._id).toString())
        const token = jwt.sign({email:loadUser.email,userId:loadUser._id.toString()}, "somesupersecretsecret", {expiresIn: "1h"});
        res.status(200).json({token:token, userId:loadUser._id.toString()});

    }).catch(err=>{
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};