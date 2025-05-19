// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { getStaffTasks, createTask, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const { protect, staffOnly } = require('../middleware/authMiddleware');

// All routes need authentication and staff role
router.use(protect);
router.use(staffOnly);

// Get all tasks for the logged-in staff member
router.get('/tasks', getStaffTasks);

// Create a new task
router.post('/tasks', createTask);

// Update task status
router.put('/tasks/:taskId', updateTaskStatus);

// Delete a task
router.delete('/tasks/:taskId', deleteTask);

module.exports = router;
