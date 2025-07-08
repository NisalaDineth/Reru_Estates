import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaPhone, FaEnvelope, FaLock, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import "./SignUpPage.css";

// SignUpPage component for user registration
// This component handles user registration, form submission, and validation
const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    phone: "",
    email: ""
  });
  const navigate = useNavigate();

  // Phone number validation - must start with 0 and be exactly 10 digits
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^0\d{9}$/; // starts with 0 and total 10 digits
    return phoneRegex.test(phone);
  };

// Email validation with support for subdomains
const validateEmail = (email) => {
  const emailRegex = /^[\w.-]+@[\w-]+(\.[\w-]+)*\.[a-z]{2,7}$/i;
  return emailRegex.test(email);
};


  // Handle input changes with validation
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    
    if (value && !validatePhoneNumber(value)) {
      setValidationErrors(prev => ({
        ...prev,
        phone: "Phone number must start with 0 and be exactly 10 digits long"
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        phone: ""
      }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setValidationErrors(prev => ({
        ...prev,
        email: "Please enter a valid email address"
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        email: ""
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate all fields before submission
    if (!validatePhoneNumber(phone)) {
      setError('Phone number must start with 0 and be exactly 10 digits long');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);

    const userData = { username, phone, email, password, role: "customer" };

    try {
      const response = await fetch("http://localhost:5001/api/auth/register/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Registration successful! Redirecting to login...");
      setUsername("");
      setPhone("");
      setEmail("");
      setPassword("");
      
      // Delay navigation to show success message
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Render the sign-up form
  // Displays input fields for username, phone, email, and password, error messages, and a submit button
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="subtitle">Sign up to get started</p>
        
        {error && (
          <div className="error-message">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <FaCheckCircle />
            <span>{success}</span>
          </div>
        )}
        
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="username">
              <FaUser className="input-icon" />
              <span>Username</span>
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="phone">
              <FaPhone className="input-icon" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="Enter your phone number (start with 0)"
              required
            />
            {validationErrors.phone && (
              <div className="field-error">{validationErrors.phone}</div>
            )}
          </div>
          
          <div className="input-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              required
            />
            {validationErrors.email && (
              <div className="field-error">{validationErrors.email}</div>
            )}
          </div>
          
          <div className="input-group">
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
          
          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || validationErrors.phone || validationErrors.email}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="login-prompt">
          <p>Already have an account? <Link to="/login">Log In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
