const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(bodyParser.json());

//MONGODB Connection

const uri = process.env.DB_URI;
mongoose.connect(uri,{useNewUrlParser:true})
.then(()=>console.log("Database Is Connected"))
.catch(()=>console.log("Database Is Not Connected"))

//Schema

const customerSchema =new mongoose.Schema({
    name:String,
    address:Object,
    email:String,
    password:String,
});

const Customer =  mongoose.model("Customer",customerSchema);

//! Check connection

app.get("/",(req,res)=>{
    res.json({message:"Connection Ok Bro!!!"})
});

//! Create Customer

app.post("/customers",async(req,res)=>{
    try {
        //Password Hashing

        const hash =await bcrypt.hash(req.body.password,10); 
        const password = hash;
        
        const customerObject ={
            name:req.body.name,
            address:req.body.address,
            email:req.body.email,
            password:password,
        }
        const customer = new Customer(customerObject);
        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Something went wrong with the server!!!"})
    }
   
});

//! Login Customer BY EMAIL AND PASSWORD

app.post("/customers/login",async(req,res)=>{
    try {
        const {email,password}=req.body
        const customer =await Customer.findOne({email:email});
        if(!customer){
        res.status(404).json({message:"Customer not found!!!"})
        }else{
            const validPassword=await bcrypt.compare(password,customer.password);
            if(!validPassword){
               res.status(401).json({message:"Customer unauthorized"})
            }else{
               const accessToken = jwt.sign({email:customer.email,id:customer._id},process.env.JWT_SECRET)
               customerObject =customer.toJSON();
               customerObject.jwtToken = accessToken;
               res.json(customerObject);
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Something went wrong with the server!!!"})
    }
});

//! Middleware to Authenticate JWT ACCESS TOKEN 

const authenticateToken = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if(!token){
        res.status(401).json({message:"Customer Unauthorized!!!"})
        return
    }else{
        jwt.verify(token,process.env.JWT_SECRET,(err,customer)=>{
            if(err){
                res.status(401).json({message:"Customer Unauthorized!!!"})
            }else{
                req.customer=customer;
                next()
            }
        });
        
    }
};

//! Get a Customer Profile

app.get("/customers/profile",authenticateToken, async(req,res)=>{
    try {
        const id = req.customer.id;
        const customer = await Customer.findById(id);
        if(!customer){
            res.status(404).json({message:"Customer not found!!!"})
        }else{
            res.json(customer)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Something went wrong with the server!!!"})
    }

})


//! Get all Customers

app.get("/customers",async(req,res)=>{
    try {
        const customer= await Customer.find({});
        res.json(customer)
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Something went wrong with the server!!!"})
    }
});

//! Get a Customer by id

app.get("/customers/:id",async(req,res)=>{
    try {
        const id = req.params.id;
        const customer = await Customer.findById(id);
        if(!customer){
            res.status(404).json({message:"Customer not found!!!"})
        }else{
            res.json(customer)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Something went wrong with the server!!!"})
    }
});

//! Update a Customer by id

app.put("/customers/:id",async(req,res)=>{
    try {
        const id = req.params.id;
        const customer = await Customer.findByIdAndUpdate(id,req.body,{new:true});
        if(!customer){
            res.status(404).json({message:"Customer not found!!!"})
        }else{
            const hash =await bcrypt.hash(req.body.password,10); 
            const password = hash;
            customer.name=req.body.name,
            customer.address=req.body.address,
            customer.email=req.body.email,
            customer.password=password,
            res.json(customer)
            await customer.save();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Something went wrong with the server!!!"})
    }
});

//! Delete a Customer by id

app.delete("/customers/:id",async(req,res)=>{
    try {
        const id = req.params.id;
        const customer = await Customer.findByIdAndDelete(id);
        if(!customer){
            res.status(404).json({message:"Customer not found!!!"})
        }else{
            res.json(customer)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Something went wrong with the server!!!"})
    }
})


const port = process.env.PORT 
app.listen(port,()=>{
    console.log(`App is running on port ${port}`) 
}) 


