const mongoose = require("mongoose");
const User = require("./user");

/*
 * Task Model and Schema
 */
const taskSchema = mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    complete: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Task = new mongoose.model("Task", taskSchema);

module.exports = Task;
