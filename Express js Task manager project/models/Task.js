const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
      type: String,
    },
    status: {
      type: String,
      enum:["to-do","in-progress","done"],
      default:"to-do"
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
