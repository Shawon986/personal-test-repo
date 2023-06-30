const jwt = require("jsonwebtoken");

module.exports = function(req,res,next){
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]
    if(!token){
        res.status(401).json({message:"User unauthorized"})
        return
    }else{
        jwt.verify(token,process.env.JWT_SECRET,(err,payload)=>{
            if(err){
                res.status(401).json({ message: "Customer Unauthorized!!!" });
            }else{
                req.payload=payload
                next()
            }
        }) 
    }

} 