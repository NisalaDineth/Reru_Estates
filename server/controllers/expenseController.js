// expenseController.js
const {
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpensesByDateRange,
    getExpensesByCategory,
    getTotalExpenses,
    getTotalExpensesByDateRange
} = require('../models/expenseModel');

// Get all expenses
const getExpenses = async (req, res) => {
    try {
        const expenses = await getAllExpenses();
        res.status(200).json(expenses);
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ message: 'Failed to fetch expenses' });
    }
};

// Get a single expense by ID
const getExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await getExpenseById(id);
        
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        
        res.status(200).json(expense);
    } catch (err) {
        console.error('Error fetching expense:', err);
        res.status(500).json({ message: 'Failed to fetch expense' });
    }
};

// Create a new expense
const addExpense = async (req, res) => {
    try {
        const { description, amount, category, date, notes } = req.body;
        
        // Validate required fields
        if (!description || !amount || !category || !date) {
            return res.status(400).json({ message: 'Description, amount, category, and date are required' });
        }
        
        const result = await createExpense({
            description,
            amount,
            category,
            date,
            notes
        });
        
        res.status(201).json({ 
            message: 'Expense added successfully', 
            expenseId: result.insertId 
        });
    } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).json({ message: 'Failed to add expense' });
    }
};

// Update an existing expense
const updateExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, amount, category, date, notes } = req.body;
        
        // Validate required fields
        if (!description || !amount || !category || !date) {
            return res.status(400).json({ message: 'Description, amount, category, and date are required' });
        }
        
        // Check if expense exists
        const expense = await getExpenseById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        
        const result = await updateExpense(id, {
            description,
            amount,
            category,
            date,
            notes
        });
        
        res.status(200).json({ 
            message: 'Expense updated successfully',
            affected: result.affectedRows
        });
    } catch (err) {
        console.error('Error updating expense:', err);
        res.status(500).json({ message: 'Failed to update expense' });
    }
};

// Delete an expense
const deleteExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if expense exists
        const expense = await getExpenseById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        
        const result = await deleteExpense(id);
        
        res.status(200).json({ 
            message: 'Expense deleted successfully',
            affected: result.affectedRows
        });
    } catch (err) {
        console.error('Error deleting expense:', err);
        res.status(500).json({ message: 'Failed to delete expense' });
    }
};

// Get expenses by date range
const getExpensesByRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }
        
        const expenses = await getExpensesByDateRange(startDate, endDate);
        res.status(200).json(expenses);
    } catch (err) {
        console.error('Error fetching expenses by date range:', err);
        res.status(500).json({ message: 'Failed to fetch expenses by date range' });
    }
};

// Get total expenses
const getTotalExpensesAmount = async (req, res) => {
    try {
        const total = await getTotalExpenses();
        res.status(200).json({ total });
    } catch (err) {
        console.error('Error calculating total expenses:', err);
        res.status(500).json({ message: 'Failed to calculate total expenses' });
    }
};

module.exports = {
    getExpenses,
    getExpense,
    addExpense,
    updateExpenseById,
    deleteExpenseById,
    getExpensesByRange,
    getTotalExpensesAmount
};