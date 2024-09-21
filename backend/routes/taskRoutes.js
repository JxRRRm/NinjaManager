// routes/task.js

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Route to fetch all tasks
router.get('/', taskController.getTasks);

// Route to fetch a single task by ID
router.get('/:id', taskController.getTaskById);

// Route to create a new task
router.post('/', taskController.createTask);

// Route to update a task's title
router.patch('/:id/title', taskController.updateTaskTitle);

// Route to update a task's priority
router.patch('/:id/priority', taskController.updateTaskPriority);

// Route to update a task's status
router.patch('/:id/status', taskController.updateTaskStatus);

// Route to update a task's date
router.patch('/:id/date', taskController.updateTaskDate);

// Route to delete a task
router.delete('/:id', taskController.deleteTask);

module.exports = router;
