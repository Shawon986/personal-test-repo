const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
  },{
      timestamps:true
  });

  module.exports =  User = mongoose.model("User", userSchema);
