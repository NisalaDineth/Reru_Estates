// controllers/taskController.js
const TaskModel = require('../models/taskModel');

// Get all tasks for the logged-in staff member
const getStaffTasks = async (req, res) => {
  try {
    const staffId = req.user.id;
    const tasks = await TaskModel.getTasksByStaffId(staffId);
    
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, dueDate } = req.body;
    const staffId = req.user.id;
    
    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required' });
    }
    
    const newTask = await TaskModel.createTask(staffId, title, dueDate);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const staffId = req.user.id;
    
    if (!status || !['pending', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (pending or completed) is required' });
    }
    
    // Ensure the task belongs to the staff member
    const tasks = await TaskModel.getTasksByStaffId(staffId);
    const taskExists = tasks.some(task => task.id == taskId);
    
    if (!taskExists) {
      return res.status(403).json({ message: 'You do not have permission to update this task' });
    }
    
    const updated = await TaskModel.updateTaskStatus(taskId, status);
    
    if (updated) {
      res.status(200).json({ message: 'Task status updated successfully' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const staffId = req.user.id;
    
    // Ensure the task belongs to the staff member
    const tasks = await TaskModel.getTasksByStaffId(staffId);
    const taskExists = tasks.some(task => task.id == taskId);
    
    if (!taskExists) {
      return res.status(403).json({ message: 'You do not have permission to delete this task' });
    }
    
    const deleted = await TaskModel.deleteTask(taskId);
    
    if (deleted) {
      res.status(200).json({ message: 'Task deleted successfully' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

module.exports = {
  getStaffTasks,
  createTask,
  updateTaskStatus,
  deleteTask
};
