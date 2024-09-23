const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  deleteTask,
  updateTask
} = require('../controllers/taskController');
const requireAuth = require('../middleware/requireAuth')

// require authenication for routes
router.use(requireAuth)

// Route to fetch all tasks
router.get('/', getTasks);

// Route to fetch a single task by ID
router.get('/:id', getTask);

// Route to create a new task
router.post('/', createTask);

// Route to delete a task
router.delete('/:id', deleteTask);

// Route to update a task
router.patch('/:id', updateTask);

module.exports = router;
