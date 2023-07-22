const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connectDb = require("./config/db");
const User = require("./models/user")
const authToken= require("./middleware/auth")
const app = express();
app.use(bodyParser.json());

connectDb()

//! check connection
app.get("/", (req, res) => {
  res.status(400).json({ message: "Welcome to Task Manager" });
});

//! Routes
app.use("/api/users",require("./routes/api/users"))
app.use("/api/tasks",require("./routes/api/tasks"))

//!POrt connection
const port = process.env.PORT; 
app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});


