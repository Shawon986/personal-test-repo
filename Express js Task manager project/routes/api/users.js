const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authToken = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
//! create user
router.post(
  "/",
  [
    check("name", "Name cannot be empty").notEmpty(),
    check("email", "Enter a valid email address").isEmail().notEmpty(),
    check("password", "Password should be 6-18 character")
      .notEmpty()
      .isLength({ min: 8, max: 12 }),
  ], 
  async (req, res) => {
    try {
      const errors = validationResult(req);
      let errorsList = errors.array().map((error) => error.msg);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errorsList });
      }
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
  }
);

//! login a user by email and password
router.post(
  "/login",
  [
    check("type", "Type cannot be empty").notEmpty(),
    check("type", "Type must be email or refresh").isIn(["email", "refresh"]),
    check("email", "Enter a valid email address").isEmail().notEmpty(),
    check("password", "Password should be 8-12 character")
      .notEmpty()
      .isLength({ min: 6, max: 18 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      let errorsList = errors.array().map((error) => error.msg);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errorsList });
      }
      const { email, password, type, refreshToken } = req.body;

      if (type == "email") {
        await emailLogin(email, res, password);
      } else {
        refreshLogin(refreshToken, res);
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
      console.error(error);
    }
  }
);

//! get user profile
router.get("/profile", authToken, async (req, res) => {
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
router.get("/", async (req, res) => {
  try {
    const user = await User.find({});
    res.json(user);
  } catch (error) {
    res.json({ message: "Something went wrong" });
    console.error(error);
  }
});

//! get a user by id
router.get("/:id", authToken, async (req, res) => {
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
router.put("/:id", authToken, async (req, res) => {
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
router.delete("/:id", authToken, async (req, res) => {
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

module.exports = router;

async function emailLogin(email, res, password) {
  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(404).json({ message: "user not found" });
  } else {
    const validPassword = bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).json({ message: "user unauthorized" });
    } else {
      tokenGenerate(user, res);
    }
  }
}

function refreshLogin(refreshToken, res) {
  if (!refreshToken) {
    res.status(400).json({ message: "user unauthorized" });
  } else {
    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, payloads) => {
      if (err) {
        res.status(400).json({ message: "unauthorized" });
      } else {
        const id = payloads.id;
        const user = await User.findById(id);
        if (!user) {
          res.status(404).json({ message: "user not found" });
        } else {
          tokenGenerate(user, res);
        }
      }
    });
  }
}

function tokenGenerate(user, res) {
  const accessToken = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );
  const refreshToken = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "60d" }
  );
  userObject = user.toJSON();
  userObject.accessToken = accessToken;
  userObject.refreshToken = refreshToken;
  res.json(userObject);
}
