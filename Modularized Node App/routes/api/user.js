const express = require ("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authAccessToken = require("../../middleware/auth")
const User = require("../../models/Users")


router.post("/",async(req,res)=>{
    try {
        const hashPassword =await bcrypt.hash(req.body.password,10)
        const password=hashPassword;
        const userObject ={
            name:req.body.name,
            age:req.body.age,
            email:req.body.email,
            password:hashPassword,
        }
        const user = new User(userObject)
        res.json(user)
        await user.save();
    } catch (error) {
        res.status(500).json({message:"Something went wrong !!!"})
        console.error(error.message)
    }
   
})
router.post("/login",async(req,res)=>{
    try {
        const{email,password,type,refreshToken}=req.body;
        if(!type){
            res.status(401).json({message:"Type is undefined"})
        }else{
            if(type=="email"){
                await emailLogin(email, res, password);
            }else{
                refreshLogin(refreshToken, res, password);
            }
        }
        
    } catch (error) {
        res.status(500).json({message:"Something went wrong !!!"})
        console.error(error.message)
    }
})

router.get("/profile",authAccessToken,async(req,res)=>{
    try {
        const id = req.payload.id;
        const user = await User.findById(id);
        if(!user){
            res.status(404).json({message:"User not found"})
        }else{
            res.json(user)
        }
    } catch (error) {
        res.status(500).json({message:"Something went wrong !!!"})
        console.error(error.message)
    }
   
})

router.get("/",async(req,res)=>{
    try {
        const user= await User.find({})
        res.json(user)
    } catch (error) {
        res.status(500).json({message:"Something went wrong !!!"})
        console.error(error.message)
    }
})

router.get("/:id",async(req,res)=>{
    try {
        const id = req.params.id
        const user = await User.findById(id)
        if(!user){
            res.status(404).json({message:"User not found"})
        }else{
            res.json(user) 
        }
    } catch (error) {
        res.status(500).json({message:"Something went wrong !!!"})
        console.error(error.message)
    } 
})

//! Update a user by id
router.put("/:id",authAccessToken,async(req,res)=>{
    try {
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(id,req.body,{new:true})
        const hashPassword =await bcrypt.hash(req.body.password,10)
        const password=hashPassword;
        user.password=password;
        res.json(user);
        await user.save()
    } catch (error) {
        res.status(500).json({message:"Something went wrong !!!"})
        console.error(error.message)
    }
})  

//! Delete a user by id
router.delete("/:id",authAccessToken,async(req,res)=>{
    try {
        const id = req.params.id;
        const user = await User.findByIdAndDelete(id);
        res.json(user)
    } catch (error) {
        res.status(500).json({message:"Something went wrong !!!"})
        console.error(error.message)
    }
})

async function emailLogin(email, res, password) {
    const user = await User.findOne({ email: email });
    if (!user) {
        res.status(404).json({ message: "User not found" });
    } else {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(500).json({ message: "User unauthorized !!!" });
        } else {
            tokenGenerator(user, res);
        }
    }
}

function refreshLogin(refreshToken, res, password) {
    if (!refreshToken) {
        res.status(500).json({ message: "RefreshToken is undefined !!!" });
    } else {
        const token = jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, payload) => {
            if (err) {
                res.status(401).json({ message: "Customer Unauthorized!!!" });
            } else {
                const id = payload.id;
                const user = await User.findById(id);
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                } else {
                    const isValidPassword = await bcrypt.compare(password, user.password);
                    if (!isValidPassword) {
                        res.status(500).json({ message: "User unauthorized !!!" });
                    } else {
                        tokenGenerator(user, res);
                    }
                }

            }
        });
    }
}

function tokenGenerator(user, res) {
    const accessToken = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "2d" });
    const refreshToken = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "60d" });
    const userObject = user.toJSON();
    userObject.accessToken = accessToken;
    userObject.refreshToken = refreshToken;
    res.json(userObject);
}
module.exports = router
