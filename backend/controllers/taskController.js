// controllers/taskController.js
const Task = require('../models/taskModel');
const mongoose = require('mongoose');

// Fetch all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({}).sort({createdAt: 1})
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};

// Fetch a single task by ID
const getTask = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const task = await Task.findById(id)

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.status(200).json(task);


};

const createTask = async (req, res) => {
  const { title } = req.body;

  // Ensure the title is provided
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    // Save the task to the database
    const task = await Task.create({
      title,
      createdBy: req.user.id,
    });
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({error: error.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const task = await Task.findByIdAndDelete({id});
  if (!task) {
    return res.status(400).json({ message: 'Task not found' });
  }

  res.status(200).json({ message: 'Task deleted successfully' });

};

// Update a task
const updateTask = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const task = await Task.findOneAndUpdate({_id: id}, {
    ...req.body
  })

  if (!task) {
    return res.status(400).json({ message: 'Task not found' });
  }

  res.status(200).json(task);
}

// Export the controller functions
module.exports = {
  getTasks,
  getTask,
  createTask,
  deleteTask,
  updateTask
};
