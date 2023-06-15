const dotenv= require("dotenv").config();
const express = require ("express");
const bodyParser = require ("body-parser");
const app = express();
const bcrypt = require("bcrypt");

app.use(bodyParser.json());

const mongoose = require("mongoose");
const uri = process.env.DB_URI;
mongoose.connect(uri,{useNewUrlParser:true})
.then(()=>console.log("DB IS CONNECTED"))
.catch(()=>console.log("DB IS NOT CONNECTED"))

const studentSchema = new mongoose.Schema({
    name:String,
    age:String,
    class:String,
    email:String,
    password:String,
},{
    timestamps:true
})

const Student = mongoose.model("Student",studentSchema);


//! API TO CHECK CONNECTION
app.get("/",(req,res)=>{
    res.json({message:"welcome !!!"})
})

//! API TO CREATE A STUDENT USER
app.post("/students",async(req,res)=>{
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password,salt);
        const password = hash;
        const studentObject = {
            name:req.body.name,
            age:req.body.age,
            class:req.body.class,
            email:req.body.email,
            password:password,
        }
        const student = new Student(studentObject);
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"something went wrong"})
    }
   
});

//! LOGIN A STUDENT BY EMAIL AND PASSWORD
app.post("/students/login",async(req,res)=>{
    try {
        const {email,password}= req.body;
        const student = await Student.findOne({email:email});
        if(!student){
            res.status(404).json({message:"student not found"});
        }else{
            const validPassword = await bcrypt.compare(password,student.password);
            console.log(validPassword)
            if(!validPassword){
                res.status(404).json({message:"student unauthorized"});
            }else{
                res.json(student);
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"something went wrong"})
    }
})

//! API TO GET ALL STUDENT USER
app.get("/students",async(req,res)=>{
    try {
        const student =await Student.find({})
        res.json(student)
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"something went wrong"})
    }
   
});

//! API TO GET A STUDENT USER BY ID
app.get("/students/:id",async(req,res)=>{
    try {
        const id = req.params.id;
        const student =await Student.findById(id)
        if(student){
            res.json(student)
        }else{
            res.status(404).json({message:"student not found"})
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"something went wrong"})
    }
   
});


//! API TO UPDATE A STUDENT USER BY ID
app.put("/students/:id",async(req,res)=>{
    try {
        const id = req.params.id;
        const student =await Student.findByIdAndUpdate(id,req.body,{new:true})
        if(student){
            res.json(student)
        }else{
            res.status(404).json({message:"student not found"})
    
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"something went wrong"})
    }
   
});


//! API TO DELETE A STUDENT USER BY ID
app.delete("/students/:id",async(req,res)=>{
    try {
        const id = req.params.id;
        const student =await Student.findByIdAndDelete(id)
        if(student){
            res.json(student)
        }else{
            res.status(404).json({message:"student not found"})
    
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"something went wrong"})
    }
   
});





const port = process.env.PORT;
app.listen(port,()=>{
    console.log(`app is running on port ${port}`);
});