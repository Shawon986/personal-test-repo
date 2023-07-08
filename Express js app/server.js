const express = require("express")
const bodyParser = require("body-parser")
const dotenv = require("dotenv").config()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const app = express()
app.use(bodyParser.json())

const uri= process.env.DB_URI
mongoose.connect(uri,{useNewUrlParser:true})
.then(()=>console.log("DB is connected"))
.catch((error)=>console.error("DB is not connected"))

const userSchema = new mongoose.Schema({
    name:String,
    age:Number,
    email:String,
    password:String
},{
    timestamps:true
})

const User = mongoose.model("User",userSchema)

//! Connection check
app.get("/",(req,res)=>{
    res.json({message:"Welcome !!!"})
})


//! Api to create a user
app.post("/users",async(req,res)=>{
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt) 
        const userObject={
            name:req.body.name,
            age:req.body.age,
            email:req.body.email,
            password:hashedPassword
        }
        const user = User(userObject) 
        await user.save()
        res.status(201).json(user)
    } catch (error) {
        res.status(400).json({message:"Something went wrong with the server"})
        console.error(error)
    }
    
})

//! Api to login a user(email/password)
app.post("/users/login",async(req,res)=>{
    try {
        const {email,password}=req.body
        const user =await User.findOne({email:email})
        if(!user){
            res.status(404).json({message:"User not found !!!"})
        }else{
            const validPassword= await bcrypt.compare(password,user.password)
            if(!validPassword){
                res.status(401).json({message:"User unauthorized"})
            }else{
                const accessToken = jwt.sign({email:user.email,id:user._id},process.env.JWT_SECRET)
                userObject=user.toJSON()
                userObject.accessToken= accessToken
                res.json(userObject)
            }
        }
    } catch (error) {
        res.status(400).json({message:"Something went wrong with the server"})
        console.error(error.message)
    }

})

//! Api to get all users
app.get("/users",async(req,res)=>{
    const users = await User.find({})
    res.json({all_users:users})
})

//! Api to get a user by id
app.get("/users/:id",async(req,res)=>{
    try {
        const id = req.params.id
        const user =await User.findById(id)
        if(!user){
            res.status(404).json({message:"User not found !!!"})
        }else{
            res.json(user)
        }
    } catch (error) {
        res.status(400).json({message:"Something went wrong with the server"})
        console.error(error)
    }
    
})

//! Api to update a user
app.put("/users/:id",async(req,res)=>{
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt) 
        const id = req.params.id
        const user =await User.findByIdAndUpdate(id,req.body,{new:true})
        if(!user){
            res.status(404).json({message:"User not found !!!"})
        }else{
            user.password=hashedPassword
            await user.save()
            res.json(user)
        }
    } catch (error) {
        res.status(400).json({message:"Something went wrong with the server"})
        console.error(error)
    }
    
}) 

//! Api to delete a user by id
app.delete("/users/:id",async(req,res)=>{
    try {
        const id = req.params.id
        const user = await User.findByIdAndDelete(id)
        if(!user){
            res.status(404).json({message:"User not found !!!"})
        }else{
            res.json(user)
        }
    } catch (error) {
        res.status(400).json({message:"Something went wrong with the server"})
        console.error(error)
    }
    
})

const port = process.env.PORT
app.listen(port,()=>{
    console.log(`App is running on port ${port}`)
}) 