const express =require("express")
const bodyParser = require("body-parser")
const dotenv = require("dotenv").config()
const mongoose = require("mongoose")
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
    res.json({message:"Welcome to Task Manager"})
})

//! create a user




const port = process.env.PORT 
app.listen(port,()=>{
    console.log(`app is running on port ${port}`)
})

