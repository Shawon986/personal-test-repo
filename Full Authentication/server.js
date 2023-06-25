

const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
app.use(bodyParser.json());
const uri = process.env.DB_URI;
mongoose.connect(uri,{useNewUrlParser:true})
.then(()=>console.log("Database is connected"))
.catch((error)=>console.error("Database is not connected"))

const packageSchema = new mongoose.Schema({
    name:String,
    from:String,
    to:String,
    ticketPrice:String,
    email:String,
    password:String
},{
    timestamps:true
});
 
const Package = mongoose.model("Package",packageSchema) 

//! Check connection

app.get("/",(req,res)=>{
    res.json({message:"Welcome !!!"}) 
});  

//! Create Customer tour package 
 
app.post("/packages",async(req,res)=>{  
    try {
        const hash = await bcrypt.hash(req.body.password,10); 
        const password = hash;
        const packageObject ={
            name:req.body.name,
            from:req.body.from,
            to:req.body.to,
            ticketPrice:req.body.ticketPrice,
            email:req.body.email,
            password:password
        }
        const package = new Package(packageObject) ;
        res.status(201).json(package);
        await package.save();  

    } catch (error) {
        console.error(error.message);
        res.status(500).json({message:"Something went wrong!!!"})

    }

});

//! Login customer and generate accessToken

app.post("/packages/login",async(req,res)=>{
    try {
    const{email,password,type,refreshToken}=req.body;
    if(!type){
        res.status(500).json({message:"Type is not defined"})
    }else{
        if(type=="email"){
            await emailLogin(email, res, password); 
        }else{
            refreshTokenLogin(refreshToken, res);
        } 
    }


    
        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message:"Something went wrong!!!"})
    }

});

//! Middleware to auathenticate JWT token

const authenticateToken = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    const accessToken = authHeader.split(" ")[1];
    if(!accessToken){
        res.status(401).json({message:"Unauthorized!!!"})
        return
    }else{
        jwt.verify(accessToken,process.env.JWT_SECRET,(err,package)=>{
            if(err){
                res.status(401).json({message:"Unauthorized!!!"})
            }else{
                req.package=package
                next()
            }
        })
        
    }
}

//! Get a package details

app.get("/packages/profile",authenticateToken,async(req,res)=>{
    try {
        
        const id = req.package.id;
        const package = await Package.findById(id)
        if(!package){
            res.status(401).json({message:"Unauthorized!!!"})
        }else{
            res.json(package)
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message:"Something went wrong!!!"})
    }
})
 

const port = process.env.PORT;
app.listen(port,()=>{ 
    console.log(`App is running on port ${port}`)
})
async function emailLogin(email, res, password) {
    const package = await Package.findOne({ email: email });
    if (!package) {
        res.status(404).json({ message: "Package not found" });
    } else {
        const isvalidPassword = await bcrypt.compare(password, package.password);
        if (!isvalidPassword) {
            res.status(500).json({ message: "Unauthorized !!!" });
        } else {
            tokenGenerator(package, res);
        }
    }
}

function refreshTokenLogin(refreshToken, res) {
    if (!refreshToken) {
        res.status(500).json({ message: "RefreshToken is not defined" });
    } else {
        jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, payload) => {
            if (err) {
                res.status(401).json({ message: "Unauthorized!!!" });
            } else {
                const id = payload.id;
                const package = await Package.findById(id);
                if (!package) {
                    res.status(401).json({ message: "Unauthorized!!!" });
                } else {
                    tokenGenerator(package, res);
                }
            }
        });
    }
}

function tokenGenerator(package, res) {
    const accessToken = jwt.sign({ email: package.email, id: package._id }, process.env.JWT_SECRET, { expiresIn: "1m" });
    const refreshToken = jwt.sign({ email: package.email, id: package._id }, process.env.JWT_SECRET, { expiresIn: "3m" });
    const packageObject = package.toJSON();
    packageObject.accessToken = accessToken;
    packageObject.refreshToken = refreshToken;
    res.json(packageObject);
}

