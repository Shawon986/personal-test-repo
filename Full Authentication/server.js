

const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
app.use(bodyParser.json());
const uri = process.env.DB_URI;
mongoose.connect(uri,{useNewUrlParser:true})
.then(()=>console.log("Database is connected"))
.catch((error)=>console.error("Database is not connected"))





const port = process.env.PORT;
app.listen(port,()=>{ 
    console.log(`App is running on port ${port}`)
})
