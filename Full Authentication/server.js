

const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
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

})



const port = process.env.PORT;
app.listen(port,()=>{ 
    console.log(`App is running on port ${port}`)
})