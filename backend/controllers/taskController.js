const Task = require('../models/taskModel');
const mongoose = require('mongoose');

// Helper function to capitalize the first letter of a string
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// get all tasks with detailed createdBy and updatedBy information
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({})
                            .sort({ createdAt: -1 })
                            .populate('createdBy', 'fname lname email')
                            .populate('updatedBy', 'fname lname email');
    const tasksWithCheck = tasks.map(task => {
      task = task.toObject(); // Convert document to object for modification
      // Check and handle deleted createdBy user
      if (!task.createdBy) {
        task.createdBy = { fname: "Deleted", lname: "User" }; // Placeholder for deleted createdBy user
      }
      // Check and handle deleted updatedBy user
      if (!task.updatedBy) {
        task.updatedBy = { fname: "Deleted", lname: "User" }; // Placeholder for deleted updatedBy user
      }
      return task;
    });
    res.status(200).json(tasksWithCheck);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




// get a single task
const getTask = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such task' });
  }

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ error: 'No such task' });
  }

  res.status(200).json(task);
};

const getCompletedTasks = async (req, res) => {
  try {
    const completedTasks = await Task.find({ completed: true }).sort({ createdAt: -1 });
    res.status(200).json(completedTasks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

//mark a task complete
const completeTask = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such task' });
  }

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ error: 'No such task' });
  }
  task.completed = true;

  res.status(200).json(task);
  task.save()
};

//mark a task uncompleted
const uncompleteTask = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such task' });
  }

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ error: 'No such task' });
  }
  task.completed = false;

  res.status(200).json(task);
  task.save()
};

//mark a task complete
const undeletedTask = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such task' });
  }

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ error: 'No such task' });
  }
  task.deleted = false;

  res.status(200).json(task);
  task.save()
};

//mark a task deleted
const markTaskDeleted = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such task' });
  }

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ error: 'No such task' });
  }
  task.deleted = true;

  res.status(200).json(task);
  task.save()
};

// create a new task
// Inside your task creation route handler
const createTask = async (req, res) => {
  const { title, date, description, priority, employees } = req.body;
  let errors = [];

  // Check for missing fields and add appropriate messages to the errors array
  if (!title) errors.push("The title field is required.");
  if (!date) errors.push("Please provide a due date for the task.");
  if (!description) errors.push("A task description is required.");
  if (!priority) errors.push("Please select a priority level for the task.");

  // If there are any errors, return a 400 response with the errors array
  if (errors.length > 0) {
    return res.status(400).json({ errors: errors });
  }

  try {
    // If 'employees' is not an array or is undefined, default to an empty array
    const assignedEmployees = Array.isArray(employees) ? employees : [];

    const task = new Task({
      title,
      date,
      description,
      priority,
      employees: assignedEmployees, // accepts empty array
      createdBy: req.user.id,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(400).json({ errors: ["An unexpected error occurred when creating the task.", error.message] });
  }
};

const moment = require('moment-timezone');

// Example function within your controller
exports.getTasks = async (req, res) => {
  const tasks = await Task.find(); // Fetch tasks from the database
  const tasksWithConvertedDates = tasks.map(task => ({
    ...task._doc,
    dueDate: moment(task.dueDate).tz('America/Los_Angeles').format(),
  }));
  res.json(tasksWithConvertedDates);
};

// delete a task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'No such task' });
  }

  const task = await Task.findOneAndDelete({ _id: id });

  if (!task) {
    return res.status(400).json({ error: 'No such task' });
  }

  res.status(200).json(task);
};

// update a task


// Inside your task update route handler
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, date, description, priority, employees } = req.body;
  
  let errors = [];

  // Check for missing fields and add appropriate messages to the errors array
  if (!title) errors.push("The title field is required.");
  if (!date) errors.push("Please provide a due date for the task.");
  if (!description) errors.push("A task description is required.");
  if (!priority) errors.push("Please select a priority level for the task.");

  // If there are any errors, return a 400 response with the errors array
  if (errors.length > 0) {
    return res.status(400).json({ errors: errors });
  }

  try {
    const updateData = {
      title,
      date,
      description,
      priority,
      employees, // can be empty
      updatedBy: req.user.id, 
    };

    const now = new Date();
    updateData.status = new Date(date) > now ? 'In Progress' : 'Past Due';

    const task = await Task.findOneAndUpdate({ _id: id }, updateData, { new: true })
      .populate('createdBy updatedBy', 'fname lname'); 

    if (!task) {
      return res.status(404).json({ error: 'No such task' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};
exports.updateTaskStatuses = async () => {
  const tasks = await Task.find({ completed: false });
  tasks.forEach(async (task) => {
    const now = new Date();
    const taskDueDate = new Date(task.date);
    
    if (taskDueDate < now && task.status !== 'Past Due') {
      task.status = 'Past Due';
      await task.save();
    }
  });
};
//=========================================================================================================
// Inside taskController.js
const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such task' });
  }

  try {
    const task = await Task.findByIdAndUpdate(
      id, 
      { status: status }, // Update only the status field
      { new: true } // Return the updated document
    ).populate('createdBy updatedBy', 'fname lname');

    if (!task) {
      return res.status(404).json({ error: 'No such task' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
  getTasks,
  getTask,
  createTask,
  deleteTask,
  updateTask,
  getCompletedTasks,
  completeTask,
  markTaskDeleted,
  uncompleteTask,
  undeletedTask,
  updateTaskStatus, // Add this here
};

