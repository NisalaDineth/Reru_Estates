// expenseRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getExpenses, 
    getExpense, 
    addExpense, 
    updateExpenseById, 
    deleteExpenseById,
    getExpensesByRange,
    getTotalExpensesAmount
} = require('../controllers/expenseController');
const { protect, ownerOnly } = require('../middleware/authMiddleware');

// All routes are protected and only accessible by owner
// Get all expenses
router.get('/owner/expenses', protect, ownerOnly, getExpenses);

// Get a single expense
router.get('/owner/expenses/:id', protect, ownerOnly, getExpense);

// Create a new expense
router.post('/owner/expenses', protect, ownerOnly, addExpense);

// Update an expense
router.put('/owner/expenses/:id', protect, ownerOnly, updateExpenseById);

// Delete an expense
router.delete('/owner/expenses/:id', protect, ownerOnly, deleteExpenseById);

// Get total expenses
router.get('/owner/expenses/total', protect, ownerOnly, getTotalExpensesAmount);

// Get expenses by date range - move this route after the specific routes
router.get('/owner/expenses/filter/date', protect, ownerOnly, getExpensesByRange);

module.exports = router;