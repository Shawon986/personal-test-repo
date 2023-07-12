const express =require("express")
const bodyParser = require("body-parser")
const dotenv = require("dotenv").config()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const app = express()
app.use(bodyParser.json())

const uri = process.env.DB_URI
mongoose.connect(uri,{useNewUrlParser:true})
.then(()=>console.log("DB is Connected"))
.catch((error)=>console.error("DB is not connected"))

const userSchema= new mongoose.Schema({
    name : {
        type:String,
    },
    email : {
        type: String,
    },
    password : {
        type: String
    }
})

const User = mongoose.model("User",userSchema)

//! check connection
app.get("/",(req,res)=>{
    res.status(400).json({message:"Welcome to Task Manager"})
})

//! create a user
app.post("/users",async(req,res)=>{
    try {
    const hashedPassword= await bcrypt.hash(req.body.password,10)
    
    userObject={
        name:req.body.name,
        email:req.body.email,
        password:hashedPassword
    }
    const user = new User(userObject)
    await user.save()
    res.status(201).json(user)

    } catch (error) {
        res.json({message:"Something went wrong"})
        console.error(error)
    }
})




const port = process.env.PORT 
app.listen(port,()=>{
    console.log(`app is running on port ${port}`)
})

