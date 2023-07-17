const mongoose = require("mongoose");
const uri = process.env.DB_URI;

const connectDb = async() => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true });
    console.log("DB is Connected")
  } catch (error) {
    console.error("DB is not connected")
  }
};
module.exports= connectDb
