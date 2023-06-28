

const express = require ("express");
const bodyParser = require("body-parser");
const app =express();
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
app.use(bodyParser.json());

const uri = process.env.DB_URI

mongoose.connect(uri,{useNewUrlParser:true})
.then(()=>console.log("DB is connected"))
.catch((_error)=>console.log("DB is not connected"))

const userSchema = new mongoose.Schema({
    name:String,
    age:Number,
    email:String,
    password:String,
})
const User = mongoose.model("User",userSchema)

//! Check connection
app.get("/",(req,res)=>{
    res.json({message:"Welcome !!!"})
})

//! Create user
app.post("/users",async(req,res)=>{
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

//! Login a user

app.post("/users/login",async(req,res)=>{
    try {
        const{email,password}=req.body;
        const user = await User.findOne({email:email});
        if(!user){
            res.status(404).json({message:"User not found"})
        }else{
            const isValidPassword =await bcrypt.compare(password,user.password)
            if(!isValidPassword){
                res.status(500).json({message:"User unauthorized !!!"})
            }else{
                const accessToken = jwt.sign({email:user.email,id:user._id},process.env.JWT_SECRET)
                const userObject=user.toJSON()
                userObject.accessToken=accessToken
                res.json(userObject)
            }
        }
    } catch (error) {
        res.status(500).json({message:"Something went wrong !!!"})
        console.error(error.message)
    }
})

//! Get all user
app.get("/users",async(req,res)=>{
    try {
        const user= await User.find({})
        res.json(user)
    } catch (error) {
        res.status(500).json({message:"Something went wrong !!!"})
        console.error(error.message)
    }
})

//! Get a user by id
app.get("/users/:id",async(req,res)=>{
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
app.put("/users/:id",async(req,res)=>{
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
app.delete("/users/:id",async(req,res)=>{
    try {
        const id = req.params.id;
        const user = await User.findByIdAndDelete(id);
        res.json(user)
    } catch (error) {
        res.status(500).json({message:"Something went wrong !!!"})
        console.error(error.message)
    }
})

 
const port = process.env.PORT
app.listen(port,()=>{
    console.log(`App is running on port ${port}`)
})