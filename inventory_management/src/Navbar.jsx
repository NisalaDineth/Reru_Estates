import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaTachometerAlt, FaBoxes, FaSignOutAlt, FaBars, FaTimes, FaRegFilePowerpoint, FaParagraph, FaPaperclip } from 'react-icons/fa';
import Logo from './assets/Logo.png';
import './Navbar.css';
import { FaCartShopping } from 'react-icons/fa6';
import { useCart } from './pages/dashboards/customer/cart/cartcontext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, updateCartCount } = useCart();

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  
  // Fetch cart item count using the context
  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    
    // Only fetch cart count if user is logged in as customer
    if (token && role === 'customer') {
      updateCartCount();
    }
  }, [location.pathname, updateCartCount]); 
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('customer');
    navigate('/login');
  };
  
  // Parse customer data properly
  const customerData = JSON.parse(localStorage.getItem('user') || '{}');

  const role = customerData.role;
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token && !!customerData.email;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <Link to="/">
            <img src={Logo} alt="AgriConnect" />
            <span className="logo-text">Reru Estates</span>
          </Link>
        </div>
        
        <div className="mobile-toggle" onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
        
        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li>
            <button className="nav-button" onClick={() => {
              if (role === 'owner') {
                navigate('/owner/dashboard');
              } else if (role === 'customer') {
                navigate('/customer/dashboard');
              } else if (role === 'staff') {
                navigate('/staff/dashboard');
              }
              else {
                navigate('/');
            }
            }}>
            <FaHome /> Home
            </button>
          </li>
          <li><Link to="/AboutUs"><FaInfoCircle /> About Us</Link></li>          
          {/* Staff dashboard button removed as requested */}
          {role === 'customer' && (
            <li className="cart-item-container">
              <Link to="/customer/cart">
                <FaCartShopping /> Cart
                {cartCount > 0 && (
                  <span className="cart-counter">{cartCount}</span>
                )}
              </Link>
            </li>
          )}

          {role === 'owner' && (
            <li><Link to="/owner/reports"><FaPaperclip />Reports</Link></li>
          )}
          
          {isLoggedIn ? (
            <li className="auth-item">
              <button className="auth-button logout-button" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </li>
          ) : (
            <>
              <li className="auth-item">
                <button className="auth-button login-button" onClick={() => navigate('/login')}>
                  Login
                </button>
              </li>
              <li className="auth-item">
                <button className="auth-button signup-button" onClick={() => navigate('/signup')}>
                  Sign Up
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
