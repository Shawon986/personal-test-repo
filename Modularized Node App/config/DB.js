const mongoose = require("mongoose");
const uri = process.env.DB_URI

const dbConnection = async()=>{
    try {
        await mongoose.connect(
            uri,
            {useNewUrlParser:true}
        )
        console.log("DB is connected")
    } catch (error) {
        console.log("DB is not connected")
    }
    
}

module.exports= dbConnection