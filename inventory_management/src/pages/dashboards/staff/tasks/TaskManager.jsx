// src/pages/dashboards/staff/tasks/TaskManager.jsx
import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaCheck, FaClock, FaTrash, FaPlus, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './TaskManager.css';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
    const navigate = useNavigate();

    // Fetch staff tasks
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // In a real implementation, uncomment this and remove the dummy data
            /*
            const response = await fetch('http://localhost:5001/api/staff/tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            
            const data = await response.json();
            setTasks(data);
            */
            
            // Dummy data for development
            const staffId = JSON.parse(localStorage.getItem('user') || '{}').id || 1;
            const dummyTasks = [
                { id: 1, title: "Quality check on tomato harvest", dueDate: "2025-05-21", status: "pending", staffId: staffId },
                { id: 2, title: "Inventory verification", dueDate: "2025-05-23", status: "pending", staffId: staffId },
                { id: 3, title: "Update crop status reports", dueDate: "2025-05-25", status: "completed", staffId: staffId },
                { id: 4, title: "Assist with new produce packaging", dueDate: "2025-05-27", status: "pending", staffId: staffId },
            ];
            
            setTasks(dummyTasks);
            setError(null);
        } catch (err) {
            console.error("Error fetching tasks:", err);
            setError("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Add a new task
    const addTask = async () => {
        if (!newTask.trim() || !taskDueDate) {
            alert("Please enter a task title and due date");
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const staffId = JSON.parse(localStorage.getItem('user') || '{}').id || 1;
            
            // Create new task object
            const taskToAdd = {
                id: Date.now(), // Temporary ID for frontend
                title: newTask,
                dueDate: taskDueDate,
                status: "pending",
                staffId: staffId
            };
            
            // Update local state first for immediate UI feedback
            setTasks([...tasks, taskToAdd]);
            setNewTask("");
            setTaskDueDate("");
            
            // Commented out the real implementation for now
            /*
            // Send to backend
            const response = await fetch('http://localhost:5001/api/staff/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newTask,
                    dueDate: taskDueDate
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add task');
            }
            
            // Refresh tasks from server to get the real ID
            fetchTasks();
            */
        } catch (err) {
            console.error("Error adding task:", err);
            alert("Failed to add task. Please try again.");
        }
    };
    
    // Update task status
    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            
            // Update local state first for immediate UI feedback
            const updatedTasks = tasks.map(task => 
                task.id === taskId ? {...task, status: newStatus} : task
            );
            setTasks(updatedTasks);
            
            // Commented out the real implementation for now
            /*
            // Send to backend
            const response = await fetch(`http://localhost:5001/api/staff/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update task');
            }
            */
        } catch (err) {
            console.error("Error updating task:", err);
            alert("Failed to update task. Please try again.");
            // Revert the change if the API call failed
            fetchTasks();
        }
    };
    
    // Delete a task
    const deleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            
            // Update local state first for immediate UI feedback
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            setTasks(updatedTasks);
            
            // Commented out the real implementation for now
            /*
            // Send to backend
            const response = await fetch(`http://localhost:5001/api/staff/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete task');
            }
            */
        } catch (err) {
            console.error("Error deleting task:", err);
            alert("Failed to delete task. Please try again.");
            // Revert the change if the API call failed
            fetchTasks();
        }
    };
    
    // Get filtered tasks based on status
    const getFilteredTasks = () => {
        if (filter === 'all') {
            return tasks;
        }
        return tasks.filter(task => task.status === filter);
    };

    if (loading) return (
        <div className="task-manager-container">
            <div className="back-button" onClick={() => navigate('/staff/dashboard')}>
                <FaArrowLeft /> Back to Dashboard
            </div>
            <h1>Loading tasks...</h1>
        </div>
    );
    
    if (error) return (
        <div className="task-manager-container">
            <div className="back-button" onClick={() => navigate('/staff/dashboard')}>
                <FaArrowLeft /> Back to Dashboard
            </div>
            <h1>Error: {error}</h1>
        </div>
    );

    return (
        <div className="task-manager-container">
            <div className="back-button" onClick={() => navigate('/staff/dashboard')}>
                <FaArrowLeft /> Back to Dashboard
            </div>
            
            <h1 className="task-header">Task Manager</h1>
            <p className="task-description">Create and manage your tasks</p>
            
            {/* Add new task form */}
            <div className="task-form">
                <div className="form-group">
                    <label>Task Title</label>
                    <input 
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Enter task title"
                        className="form-control"
                    />
                </div>
                
                <div className="form-group">
                    <label>Due Date</label>
                    <input 
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="form-control"
                    />
                </div>
                
                <button className="add-button" onClick={addTask}>
                    <FaPlus /> Add Task
                </button>
            </div>
            
            {/* Filter options */}
            <div className="filter-options">
                <span className="filter-label"><FaFilter /> Filter:</span>
                <button 
                    className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button 
                    className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pending
                </button>
                <button 
                    className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </button>
            </div>
            
            {/* Tasks list */}
            {getFilteredTasks().length === 0 ? (
                <div className="empty-tasks">
                    {filter === 'all' ? (
                        <p>No tasks available. Add a new task to get started.</p>
                    ) : (
                        <p>No {filter} tasks available.</p>
                    )}
                </div>
            ) : (
                <div className="tasks-list">
                    {getFilteredTasks().map(task => (
                        <div key={task.id} className={`task-card ${task.status}`}>
                            <div className="task-content">
                                <h3 className="task-title">{task.title}</h3>
                                <p className="task-due-date">
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                </p>
                                <span className={`task-status-badge ${task.status}`}>
                                    {task.status === 'completed' ? 'Completed' : 'Pending'}
                                </span>
                            </div>
                            <div className="task-actions">
                                {task.status === 'pending' ? (
                                    <button 
                                        className="complete-button" 
                                        onClick={() => updateTaskStatus(task.id, 'completed')}
                                        title="Mark as completed"
                                    >
                                        <FaCheck />
                                    </button>
                                ) : (
                                    <button 
                                        className="pending-button" 
                                        onClick={() => updateTaskStatus(task.id, 'pending')}
                                        title="Mark as pending"
                                    >
                                        <FaClock />
                                    </button>
                                )}
                                <button 
                                    className="delete-button" 
                                    onClick={() => deleteTask(task.id)}
                                    title="Delete task"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskManager;
