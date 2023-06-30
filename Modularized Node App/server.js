
const express = require ("express");
const bodyParser = require("body-parser");
const app =express();
const dotenv = require("dotenv").config();
const dbConnection = require("./config/DB");
app.use(bodyParser.json());
dbConnection()



//! Check connection
app.get("/",(req,res)=>{
    res.json({message:"Welcome !!!"})
})

//! Create user
app.use("/api/users",require("./routes/api/user"))

//! Login a user
app.use("/api/users/login",require("./routes/api/user"))

//! Get user profile by Token
app.use("/api/users/profile",require("./routes/api/user"))

//! Get all user
app.use("/api/users",require("./routes/api/user"))



const port = process.env.PORT
app.listen(port,()=>{
    console.log(`App is running on port ${port}`)
})


