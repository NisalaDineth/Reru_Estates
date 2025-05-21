// expenseModel.js
const db = require('../config/db');

// Get all expenses
const getAllExpenses = async () => {
    const [rows] = await db.query('SELECT * FROM expenses ORDER BY date DESC');
    return rows;
};

// Get a single expense by ID
const getExpenseById = async (id) => {
    const [rows] = await db.query('SELECT * FROM expenses WHERE id = ?', [id]);
    return rows[0];
};

// Create a new expense
const createExpense = async (expense) => {
    const { description, amount, category, date, notes } = expense;
    const query = 'INSERT INTO expenses (description, amount, category, date, notes) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(query, [description, amount, category, date, notes || null]);
    return result;
};

// Update an existing expense
const updateExpense = async (id, expense) => {
    const { description, amount, category, date, notes } = expense;
    const query = 'UPDATE expenses SET description = ?, amount = ?, category = ?, date = ?, notes = ? WHERE id = ?';
    const [result] = await db.query(query, [description, amount, category, date, notes || null, id]);
    return result;
};

// Delete an expense
const deleteExpense = async (id) => {
    const query = 'DELETE FROM expenses WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result;
};

// Get expenses by date range
const getExpensesByDateRange = async (startDate, endDate) => {
    const query = 'SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC';
    const [rows] = await db.query(query, [startDate, endDate]);
    return rows;
};

// Get expenses by category
const getExpensesByCategory = async (category) => {
    const query = 'SELECT * FROM expenses WHERE category = ? ORDER BY date DESC';
    const [rows] = await db.query(query, [category]);
    return rows;
};

// Get total expenses
const getTotalExpenses = async () => {
    const [rows] = await db.query('SELECT SUM(amount) as total FROM expenses');
    return rows[0].total || 0;
};

// Get total expenses by date range
const getTotalExpensesByDateRange = async (startDate, endDate) => {
    const query = 'SELECT SUM(amount) as total FROM expenses WHERE date BETWEEN ? AND ?';
    const [rows] = await db.query(query, [startDate, endDate]);
    return rows[0].total || 0;
};

module.exports = {
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpensesByDateRange,
    getExpensesByCategory,
    getTotalExpenses,
    getTotalExpensesByDateRange
};