const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authToken = require("../../middleware/auth");
const User = require("../../models/user");
const Task = require("../../models/Task");
const { check, validationResult } = require("express-validator");
//! create task
router.post(
  "/",
  [authToken, [check("title", "title cannot be empty").notEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      let errorsList = errors.array().map((error) => error.msg);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errorsList });
      }
      const id = req.payload.id;
      taskObject = {
        title: req.body.title,
        description: req.body.description,
        userId: id,
      };
      const task = new Task(taskObject);
      await task.save();
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
      console.error(error);
    }
  }
);

//! get all created task
router.get("/", authToken, async (req, res) => {
  try {
    const id = req.payload.id;
    const task = await Task.find({ userId: id });
    res.json(task);
  } catch (error) {
    res.json({ message: "Something went wrong" });
    console.error(error);
  }
});

//! update a task status by id
router.put(
  "/status/:id",
  [authToken, [check("status", "status cannot be empty").notEmpty(),
  check("status", "status must be to-do,in-progress and done").isIn(["to-do","in-progress","done"])]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      let errorsList = errors.array().map((error) => error.msg);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errorsList });
      }
      const id = req.params.id;
      const userId = req.payload.id;
      const status = req.body.status;
      const task = await Task.findOneAndUpdate(
        { _id: id, userId: userId },
        { status: status },
        { new: true }
      );
      if (!task) {
        res.status(404).json({ message: "task not found" });
      } else {
        res.json(task);
        await task.save();
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
      console.error(error);
    }
  }
);

//! update a task by id
router.put("/:id", authToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.payload.id;
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: userId },
      req.body,
      { new: true }
    );
    if (!task) {
      res.status(404).json({ message: "task not found" });
    } else {
      res.json(task);
      await task.save();
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.error(error);
  }
});

//! get a task by id
router.get("/:id", authToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId= req.payload.id

    const task = await Task.findOne({_id:id,userId:userId});
    if (!task) {
      res.status(404).json({ message: "Task not found" });
    } else {
      res.json(task);
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.error(error);
  }
});


//! delete a task by id
router.delete("/:id", authToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId= req.payload.id
    const task = await Task.findOneAndDelete({_id:id,userId:userId});
    if (!task) {
      res.status(404).json({ message: "task not found" });
    } else {
      res.json(task);
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.error(error);
  }
});

module.exports = router;

