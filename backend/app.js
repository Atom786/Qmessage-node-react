const express = require('express')
const cors = require("cors")
const mongoose = require("mongoose")
const BodyParser = require("body-parser")
const feedRouter = require("./Routes/feed");
const authRouter = require("./Routes/auth");
const { Result } = require('express-validator');
const multer =require("multer");
const {v4:uuidv4} = require("uuid")
const path = require("path");
const app = express()
require('dotenv').config()

app.use(cors());
const port = process.env.PORT || 2028

app.use(BodyParser.json()); //application/json

app.use("/images", express.static(path.join(__dirname,"images")));

// app.use(BodyParser.urlencoded({extended:true}))

const fileStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, "images");
    },
    filename:(req,file,cb)=>{
        cb(null, uuidv4())
    }
});

const fileFilter = (req,file,cb)=>{
    if (file.mimetype==="image/png" || file.mimetype==="image/jpg" || file.mimetype==="image/jpeg") {
        cb(null,true);
    }
    else{
        cb(null,false);
    }
}

app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single("image"));

// app.use((ErrorEvent))
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader(
      'Access-Control-Allow-Methods',
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    // res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000")
    // res.setHeader("Access-Control-Allow-Methods", " GET, POST, PUT, DELETE");
    // res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
})


app.use("/feed", feedRouter);
app.use("/auth", authRouter);

app.use((error, req,res,next)=>{
    console.log(error)
    const status = error.statusCode;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message:message, data:data});
})

mongoose.connect("mongodb://localhost:27017/FeedsPost").then(result=>{
    app.listen(port , ()=> console.log('> Server is up and running on port : ' + port));
}).catch(err=>{console.log(err)})
