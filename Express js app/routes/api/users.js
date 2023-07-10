const express = require("express")
const router = express.Router();
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const authenticateToken = require("../../middleware/auth")
const  { check, validationResult } = require("express-validator");
//! Api to create a user
router.post("/",
[
    check("name", "Name cannot be empty").notEmpty(),
    check("email", "Enter a valid email address").isEmail().notEmpty(),
    check("password", "Password should be 8-12 character").notEmpty().isLength({min:8,max:12}),
],
async(req,res)=>{
    try {                                            
        const errors = validationResult(req); 
        let errorsList = errors.array().map((error)=>error.msg) 
        if (!errors.isEmpty()) {   
          return res.status(400).json({errors:errorsList});   
        } 
        const salt = await bcrypt.genSalt(10)    
        const hashedPassword = await bcrypt.hash(req.body.password,salt)    
        const userObject={          
            name:req.body.name,                         
            age:req.body.age,                   
            email:req.body.email,                       
            password:hashedPassword               
        }
        const user = User(userObject)  
        await user.save()
        res.status(201).json(user)  
    } catch (error) {
        res.status(400).json({message:"Something went wrong with the server"})
        console.error(error)
    }
     
});

//! Api to login a user(email/password)
router.post("/login",
[
    check("type", "Type cannot be empty").notEmpty(),
    check("type", "Type must be email or refresh").isIn(["email","refresh"]),
    check("email", "Enter a valid email address").isEmail().notEmpty(),
    check("password", "Password should be 8-12 character")
      .notEmpty()
      .isLength({ min: 8, max: 12 }), 
  ],
async(req,res)=>{ 
    try {
        const errors = validationResult(req);
        let errorsList = errors.array().map((error)=>error.msg)
        if (!errors.isEmpty()) {
          return res.status(400).json({errors:errorsList});
        }

        const {email,password,type,refreshToken}=req.body
        
            if(type=="email"){
                await email_login(email, res, password)
            }else{
                refreshToken_login(refreshToken, res)
            }
            
       
        
    } catch (error) {
        res.status(500).json({message:"Something went wrong with the server"})
        console.error(error)
    }

});

//! Api to get user profile
router.get("/profile",authenticateToken,async(req,res)=>{
    const id = req.user.id
    const user = await User.findById(id)
    if(!user){
        res.status(404).json({message:"User not found !!!"})
    }else{
        res.json(user)
    }
})

//! Api to get all users
router.get("/",async(req,res)=>{
    const users = await User.find({}) 
    res.json({all_users:users})
})

//! Api to get a user by id
router.get("/:id",async(req,res)=>{
    try {
        const id = req.params.id
        const user =await User.findById(id)
        if(!user){
            res.status(404).json({message:"User not found !!!"})
        }else{
            res.json(user)
        }
    } catch (error) {
        res.status(400).json({message:"Something went wrong with the server"})
        console.error(error)
    }
    
})

//! Api to update a user
router.put("/:id",async(req,res)=>{
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt) 
        const id = req.params.id
        const user =await User.findByIdAndUpdate(id,req.body,{new:true})
        if(!user){
            res.status(404).json({message:"User not found !!!"})
        }else{
            user.password=hashedPassword
            await user.save()
            res.json(user)
        }
    } catch (error) {
        res.status(400).json({message:"Something went wrong with the server"})
        console.error(error)
    }
    
}) 

//! Api to delete a user by id
router.delete("/:id",async(req,res)=>{
    try {
        const id = req.params.id
        const user = await User.findByIdAndDelete(id)
        if(!user){
            res.status(404).json({message:"User not found !!!"})
        }else{
            res.json(user)
        }
    } catch (error) {
        res.status(400).json({message:"Something went wrong with the server"})
        console.error(error)
    }
    
})


module.exports= router

async function email_login(email, res, password) {
    const user = await User.findOne({ email: email })
    if (!user) {
        res.status(404).json({ message: "User not found !!!" })
    } else {
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            res.status(401).json({ message: "User unauthorized" })
        } else {
            tokenGenerator(user, res)
        }
    }
}

function refreshToken_login(refreshToken, res) {
    if (!refreshToken) {
        res.status(401).json({ message: "RefreshToken is not defined" })
    } else {
        jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, payload) => {
            if (err) {
                res.status(401).json({ message: "User unauthorized" })
            } else {
                const id = payload.id
                const user = await User.findById(id)
                if (!user) {
                    res.status(404).json({ message: "User not found !!!" })
                } else {
                    tokenGenerator(user, res)
                }

            }
        })
    }
}

function tokenGenerator(user, res) {
    const accessToken = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "2d" })
    const refreshToken = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "60d" })
    userObject = user.toJSON()
    userObject.accessToken = accessToken
    userObject.refreshToken = refreshToken
    res.json(userObject)
}