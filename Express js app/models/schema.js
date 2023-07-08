const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:String,
    age:Number,
    email:String,
    password:String
},{
    timestamps:true
})

module.exports = User=mongoose.model("User",userSchema)