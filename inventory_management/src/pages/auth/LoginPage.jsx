import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaExclamationCircle } from "react-icons/fa";
import "./LoginPage.css";

// Login component for user authentication
// This component handles user login, form submission, and error handling
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    // Validate email format
    try {
      console.log("Attempting login with:", { email });
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Include cookies if needed
      });
      
      if (!response) {
        throw new Error("Network error: No response received");
      }
      
      const data = await response.json();
      console.log("Login response:", data);
  
      if (!response.ok) {
        // Check for specific error messages for deactivated accounts
        if (response.status === 403) {
          throw new Error("Your account has been deactivated. Please contact support.");
        } else {
          throw new Error(data.message || "Login failed");
        }
      }
      
      // Check if customer account is inactive
      if (data.role === "customer" && data.isActive === 0) {
        throw new Error("Your account has been deactivated. Please contact support.");
      }
  
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("role", data.role);
      
      const userRole = data.role;
      // Navigate based on user role
      if (userRole === "customer") {
        navigate("/customer/dashboard");
      } else if (userRole === "owner") {
        navigate("/owner/dashboard");
      } else if (userRole === "staff") {
        navigate("/staff/dashboard");
      } else {
        throw new Error("Invalid role");
      }    } catch (err) {
      console.error("Login failed:", err);
      // Handle specific error cases
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError("Network error: Could not connect to the server. Please check your connection or try again later.");
        console.error("Network error details:", err);
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render the login form
  // Displays input fields for email and password, error messages, and a submit button
  return (
    <div className="login-page">
      <div className="login-container">        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your account</p>
        </div>        
        {error && (
          <div className="error-message">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" />
              <span>Email Address</span>
            </label>
            <input 
              type="email" 
              id="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" />
              <span>Password</span>
            </label>
            <input 
              type="password" 
              id="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              required 
            />
          </div>
          
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          
          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="signup-prompt">
          <p>Don't have an account? <Link to="/signup">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
