

const express = require ("express");
const bodyParser = require("body-parser");
const app =express();
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
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