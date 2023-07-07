const express = require("express")
const bodyParser = require("body-parser")
const dotenv = require("dotenv").config()
const app = express()
app.use(bodyParser.json())


//! Connection check
app.get("/",(req,res)=>{
    res.json({message:"Welcome !!!"})
})

let users=[]
let userId = 0
//! Api to create a user
app.post("/users",(req,res)=>{
    const user = req.body
    user.id = ++userId
    users.push(user)
    res.status(201).json(user)
})

//! Api to get all users
app.get("/users",(req,res)=>{
    res.json(users)
})

//! Api to get a user by id
app.get("/users/:id",(req,res)=>{
    const id = req.params.id
    const user = users.find((u)=>u.id==id)
    if(!user){
        res.status(404).json({message:"User not found !!!"})
    }else{
        res.json(user)
    }
})

//! Api to update a user
app.put("/users/:id",(req,res)=>{
    const id =req.params.id
    const body =req.body
    const user = users.find((u)=>u.id==id)
    if(!user){
        res.status(404).json({message:"User not found !!!"})
    }else{
        user.name = body.name
        user.age = body.age
        user.email = body.email
        user.password = body.password

        res.json(user)
    }
  
}) 

//! Api to delete a user by id
app.delete("/users/:id",(req,res)=>{
    const id = req.params.id
    const userIndex = users.findIndex((u)=>u.id==id)
    if(userIndex){
        users.splice(userIndex,1)
        res.json(users)
    }else{
        res.status(404).json({message:"User not found !!!"})      
    }
})

const port = process.env.PORT
app.listen(port,()=>{
    console.log(`App is running on port ${port}`)
}) 