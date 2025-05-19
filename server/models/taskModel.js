// models/taskModel.js
const db = require('../config/db');

class TaskModel {
  // Get all tasks for a specific staff member
  static async getTasksByStaffId(staffId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM tasks WHERE staff_id = ? ORDER BY due_date ASC',
        [staffId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Add a new task
  static async createTask(staffId, title, dueDate) {
    try {
      const [result] = await db.query(
        'INSERT INTO tasks (staff_id, title, due_date, status) VALUES (?, ?, ?, "pending")',
        [staffId, title, dueDate]
      );
      
      return {
        id: result.insertId,
        staff_id: staffId,
        title,
        due_date: dueDate,
        status: 'pending'
      };
    } catch (error) {
      throw error;
    }
  }

  // Update task status
  static async updateTaskStatus(taskId, status) {
    try {
      const [result] = await db.query(
        'UPDATE tasks SET status = ? WHERE id = ?',
        [status, taskId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete a task
  static async deleteTask(taskId) {
    try {
      const [result] = await db.query(
        'DELETE FROM tasks WHERE id = ?',
        [taskId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TaskModel;
