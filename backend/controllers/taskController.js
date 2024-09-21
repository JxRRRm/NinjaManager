// controllers/taskController.js
const Task = require('../models/taskModel');
const mongoose = require('mongoose');

// Utility function to check if ObjectId is valid
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Fetch all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('createdBy updatedBy employees'); // Populating references
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};

// Fetch a single task by ID
const getTaskById = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  try {
    const task = await Task.findById(id).populate('createdBy updatedBy employees');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error });
  }
};

const createTask = async (req, res) => {
  const { title, date, description, priority, createdBy, employees } = req.body;

  // Ensure the title is provided
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  // Create a task object, using defaults where applicable
  const newTaskData = {
    title,
    description: undefined, // Use provided value or undefined
    date: undefined,                // Use provided value or undefined
    priority: undefined,        // Use provided value or undefined
    createdBy: undefined,      // Use provided value or undefined
    employees: [],              // Defaults to an empty array if not provided
  };

  // Create the new task instance
  const newTask = new Task(newTaskData);

  try {
    // Save the task to the database
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
};


// Update the task's title
const updateTaskTitle = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task title', error });
  }
};

// Update the task's priority
const updateTaskPriority = async (req, res) => {
  const { id } = req.params;
  const { priority } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { priority },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task priority', error });
  }
};

// Update the task's status
const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task status', error });
  }
};

// Update the task's due date
const updateTaskDate = async (req, res) => {
  const { id } = req.params;
  const { date } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { date },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task date', error });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  try {
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
};

// Export the controller functions
module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTaskTitle,
  updateTaskPriority,
  updateTaskStatus,
  updateTaskDate,
  deleteTask,
};
