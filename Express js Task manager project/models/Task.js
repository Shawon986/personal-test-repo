const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
      type: String,
    },
    status: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    description: {
        type: String,
    },
    expiresAt:{
        type: Date
    }
  },{
      timestamps:true
  });

  module.exports =  Task = mongoose.model("Task", taskSchema);
