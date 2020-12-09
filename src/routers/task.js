const express = require("express");
const Task = require("../models/tasks");
const auth = require("../middleware/auth");

const router = new express.Router();

router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.complete) {
    match.complete = req.query.complete === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split("_");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/tasks", auth, async (req, res) => {
  const newtask = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    const newt = await newtask.save();
    res.status(201).send(newt);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "complete"];
  const isValidUpdation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidUpdation) {
    return res.status(400).send({ error: "Invalid Updates" });
  }

  try {
    // const task = await Task.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));

    await task.save();

    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
