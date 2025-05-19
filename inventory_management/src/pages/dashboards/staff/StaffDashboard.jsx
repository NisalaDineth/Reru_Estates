import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaCalendarCheck, FaTrash, FaCheck, FaClock, FaPlus } from 'react-icons/fa';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const navigate = useNavigate();  const [staffData, setStaffData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentHarvests, setRecentHarvests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  useEffect(() => {
    const fetchStaffData = async () => {
      setIsLoading(true);
      try {
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setStaffData(userData);
        
        // Fetch recent harvests (placeholder for now)
        // In a real implementation, this would be an API call
        setRecentHarvests([
          { id: 1, crop: "Tomatoes", quantity: "250 kg", date: "May 17, 2025", quality: "High" },
          { id: 2, crop: "Potatoes", quantity: "350 kg", date: "May 15, 2025", quality: "Medium" },
          { id: 3, crop: "Lettuce", quantity: "120 kg", date: "May 12, 2025", quality: "High" },
        ]);
        
        // Fetch staff tasks
        fetchTasks();
        
      } catch (err) {
        console.error("Error fetching staff data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffData();
  }, []);
  
  // Fetch staff tasks from the backend
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const staffId = JSON.parse(localStorage.getItem('user') || '{}').id;
      
      // In a real implementation, this would be an API call to fetch tasks from the database
      // For now, using dummy data
      const dummyTasks = [
        { id: 1, title: "Quality check on tomato harvest", dueDate: "2025-05-21", status: "pending", staffId: staffId },
        { id: 2, title: "Inventory verification", dueDate: "2025-05-23", status: "pending", staffId: staffId },
        { id: 3, title: "Update crop status reports", dueDate: "2025-05-25", status: "completed", staffId: staffId },
        { id: 4, title: "Assist with new produce packaging", dueDate: "2025-05-27", status: "pending", staffId: staffId },
      ];
      
      setTasks(dummyTasks);
      
      // Commented out the real implementation for now
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
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again later.");
    }
  };
  
  // Add a new task
  const addTask = async () => {
    if (!newTask.trim() || !taskDueDate) {
      alert("Please enter a task title and due date");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const staffId = JSON.parse(localStorage.getItem('user') || '{}').id;
      
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
    if (!confirm("Are you sure you want to delete this task?")) {
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
  const dashboardCards = [
    {
      id: 'inventory',
      title: 'Inventory Management',
      description: 'Track and update current harvest inventory',
      icon: <FaClipboardList className="card-icon" />,
      path: '/staff/inventory-management'
    },
    {
      id: 'tasks',
      title: 'Task Manager',
      description: 'Create and manage your tasks',
      icon: <FaCalendarCheck className="card-icon" />,
      path: '/staff/task-manager'
    }
  ];

  if (isLoading) return <div className="staff-dashboard">Loading dashboard data...</div>;
  if (error) return <div className="staff-dashboard">Error: {error}</div>;

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h2>Staff Dashboard</h2>
        <p className="welcome-message">
          Welcome back, {staffData?.name || 'Staff Member'}!
        </p>
      </div>

      <div className="dashboard-cards">
        {dashboardCards.map((card) => (
          <div 
            key={card.id}
            className="dashboard-card"
            onClick={() => navigate(card.path)}
          >
            <div className="card-icon-container">
              {card.icon}
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>

      {/* Dashboard charts section */}
      <div className="dashboard-charts-section">
        <div className="section-header">
          <h2>Recent Harvest Data</h2>
          <p>Overview of recently recorded harvests</p>
        </div>
        <div className="charts-container">
          <div className="chart-container">
            <h3>Recent Harvests</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2c5a2c" }}>
                  <th style={{ textAlign: "left", padding: "0.5rem", color: "#a3e6a3" }}>Crop</th>
                  <th style={{ textAlign: "left", padding: "0.5rem", color: "#a3e6a3" }}>Quantity</th>
                  <th style={{ textAlign: "left", padding: "0.5rem", color: "#a3e6a3" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "0.5rem", color: "#a3e6a3" }}>Quality</th>
                </tr>
              </thead>
              <tbody>
                {recentHarvests.map(harvest => (
                  <tr key={harvest.id} style={{ borderBottom: "1px solid #2c5a2c" }}>
                    <td style={{ padding: "0.5rem", color: "#d4f5d4" }}>{harvest.crop}</td>
                    <td style={{ padding: "0.5rem", color: "#d4f5d4" }}>{harvest.quantity}</td>
                    <td style={{ padding: "0.5rem", color: "#d4f5d4" }}>{harvest.date}</td>
                    <td style={{ padding: "0.5rem", color: "#d4f5d4" }}>{harvest.quality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>      {/* Upcoming tasks section */}
      <div className="task-section">
        <h2>Task Manager</h2>
        
        {/* Add new task form */}
        <div className="add-task-form">
          <input 
            type="text" 
            value={newTask} 
            onChange={(e) => setNewTask(e.target.value)} 
            placeholder="Enter a new task..." 
            className="task-input"
          />
          <input 
            type="date" 
            value={taskDueDate} 
            onChange={(e) => setTaskDueDate(e.target.value)} 
            min={new Date().toISOString().split('T')[0]}
            className="date-input"
          />
          <button onClick={addTask} className="add-task-button">
            <FaPlus /> Add Task
          </button>
        </div>
        
        {/* Tasks list */}
        {tasks.length === 0 ? (
          <p className="no-tasks-message">No tasks available. Add a new task to get started.</p>
        ) : (
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className={`task-item ${task.status}`}>
                <div className="task-info">
                  <span className="task-title">{task.title}</span>
                  <span className="task-date">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
