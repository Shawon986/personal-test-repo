const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { reset } = require("nodemon");
const app = express();
app.use(bodyParser.json());

const uri = process.env.DB_URI;
mongoose
  .connect(uri, { useNewUrlParser: true })
  .then(() => console.log("DB is Connected"))
  .catch((error) => console.error("DB is not connected"));

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
});

const User = mongoose.model("User", userSchema);

//! check connection
app.get("/", (req, res) => {
  res.status(400).json({ message: "Welcome to Task Manager" });
});

//! create a user
app.post("/users", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    userObject = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    };
    const user = new User(userObject);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.error(error);
  }
});

//! login a user by email and password
app.post("/users/login", async (req, res) => {
  try {
    const { email, password, type, refreshToken } = req.body;
    if (!type) {
      res.json({ message: "type is not defined" });
    } else {
      if (type == "email") {
        const user = await User.findOne({ email: email });
        if (!user) {
          res.status(404).json({ message: "user not found" });
        } else {
          const validPassword = bcrypt.compare(password, user.password);
          if (!validPassword) {
            res.status(400).json({ message: "user unauthorized" });
          } else {
            const accessToken = jwt.sign(
              { email: user.email, id: user._id },
              process.env.JWT_SECRET
            );
            const refreshToken = jwt.sign(
              { email: user.email, id: user._id },
              process.env.JWT_SECRET
            );
            userObject = user.toJSON();
            userObject.accessToken = accessToken;
            userObject.refreshToken = refreshToken;
            res.json(userObject);
          }
        }
      } else {
        if (!refreshToken) {
          res.status(400).json({ message: "user unauthorized" });
        } else {
          jwt.verify(
            refreshToken,
            process.env.JWT_SECRET,
            async (err, payloads) => {
              if (err) {
                res.status(400).json({ message: "unauthorized" });
              } else {
                const id = payloads.id;
                const user = await User.findById(id);
                if (!user) {
                  res.status(404).json({ message: "user not found" });
                } else {
                  const accessToken = jwt.sign(
                    { email: user.email, id: user._id },
                    process.env.JWT_SECRET
                  );
                  const refreshToken = jwt.sign(
                    { email: user.email, id: user._id },
                    process.env.JWT_SECRET
                  );
                  userObject = user.toJSON();
                  userObject.accessToken = accessToken;
                  userObject.refreshToken = refreshToken;
                  res.json(userObject);
                }
              }
            }
          );
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.error(error);
  }
});

//! middleware
const authToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(400).json({ message: "unauthorized" });
    return;
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        res.status(400).json({ message: "unauthorized" });
      } else {
        req.payload = payload;
        next();
      }
    });
  }
};

//! get user profile
app.get("/users/profile", authToken, async (req, res) => {
  try {
    const id = req.payload.id;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "user not found" });
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.error(error);
  }
});

//! get all user
app.get("/users", async (req, res) => {
  try {
    const user = await User.find({});
    res.json(user);
  } catch (error) {
    res.json({ message: "Something went wrong" });
    console.error(error);
  }
});

//! get a user by id
app.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "user not found" });
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.error(error);
  }
});

//! update a user
app.put("/users/:id", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const id = req.params.id;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!user) {
      res.status(404).json({ message: "user not found" });
    } else {
      user.password = hashedPassword;
      res.json(user);
      await user.save();
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.error(error);
  }
});

//! delete a user by id
app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ message: "user not found" });
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.error(error);
  }
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
