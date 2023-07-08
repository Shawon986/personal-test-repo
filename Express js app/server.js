
const express = require("express")
const bodyParser = require("body-parser")
const dotenv = require("dotenv").config()
const connectDB = require("./config/DB")
const User= require("./models/schema")
const app = express()
app.use(bodyParser.json())

connectDB()

 

//! Connection check
app.get("/",(req,res)=>{
    res.json({message:"Welcome !!!"})
})

//! Importing API'S
app.use("/api/users",require("./routes/api/users"))


//! Middleware
const authenticateToken = require("./middleware/auth")



const port = process.env.PORT
app.listen(port,()=>{
    console.log(`App is running on port ${port}`)
}) 


