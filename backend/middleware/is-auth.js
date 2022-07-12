const jwt = require("jsonwebtoken");

module.exports = (req,res,next)=>{
    const authHeader = req.get("Authorization");
   
    if (!authHeader) {
        const error = new Error("Not Authenticated user");
        error.statuCode = 401;
        throw error;
        
    }
    const token = authHeader.split(' ')[1];
    try {
        decodeToken = jwt.verify(token,"somesupersecretsecret")
    } catch (error) {
        error.statuCode =501;
        throw error;
    }
    if (!decodeToken) {
        const error = new Error("Not Authenticated.");
        throw error;
    }
    req.userId =decodeToken.userId;
    next();

}