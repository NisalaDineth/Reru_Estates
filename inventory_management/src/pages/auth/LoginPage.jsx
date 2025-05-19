import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";
import "./LoginPage.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [info, setInfo] = useState("Use test account: testuser@example.com / testpass123");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    try {
      console.log("Attempting login with:", { email });
      
      // Try the new endpoint first
      let response;
      let data;
      
      try {
        response = await fetch('http://localhost:5001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        data = await response.json();
        console.log("Login response from new endpoint:", data);
      } catch (err) {
        console.error("Error with new endpoint, trying fallback:", err);
        // If the new endpoint fails, try the old one
        response = await fetch('http://localhost:5001/routes/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        data = await response.json();
        console.log("Login response from fallback endpoint:", data);
      }
  
      if (!response.ok) {
        // Check for specific error messages for deactivated accounts
        if (response.status === 403) {
          throw new Error("Your account has been deactivated. Please contact support.");
        } else {
          throw new Error(data.message || "Login failed");
        }
      }
      
      // Check if customer account is inactive (in case backend doesn't properly check)
      if (data.role === "customer" && data.isActive === 0) {
        throw new Error("Your account has been deactivated. Please contact support.");
      }
  
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("role", data.role);
      
      const userRole = data.role;
      // Store customer details properly
      if (userRole === "customer") {
        navigate("/customer/dashboard");
      } else if (userRole === "owner") {
        navigate("/owner/dashboard");
      } else if (userRole === "staff") {
        navigate("/staff/dashboard");
      } else {
        throw new Error("Invalid role");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your account</p>
        </div>        
        {error && (
          <div className="error-message">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}
        
        {info && (
          <div className="info-message">
            <FaInfoCircle />
            <span>{info}</span>
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
