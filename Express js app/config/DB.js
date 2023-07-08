const mongoose = require("mongoose")
const uri= process.env.DB_URI

const connectDB = async ()=>{
    try {
        await mongoose.connect(
            uri,
            {useNewUrlParser:true}
        )
        console.log("DB is connected")
    } catch (error) {
        console.error("DB is not connected")
    }
    
}
module.exports = connectDB