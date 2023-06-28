const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name:{
        type:String
    },
    age:{
        type:Number
    },
    email:{
        type:String
    },
    password:{
        type:String
    }

},{
    timestamps:true
})
module.exports= User = mongoose.model("User",userSchema)