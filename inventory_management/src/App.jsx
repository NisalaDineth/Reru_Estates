import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Navbar from './Navbar.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import SignUpPage from './pages/auth/SignUpPage.jsx';
import CustomerDashboard from './pages/dashboards/customer/CustomerDashboard.jsx';
import CustomerProducts from './pages/dashboards/customer/product/CustomerProducts.jsx';
import Checkout from './pages/dashboards/customer/cart/CustomerCheckout.jsx';
import Cart from './pages/dashboards/customer/cart/Cart.jsx';
import OwnerDashboard from './pages/dashboards/owner/OwnerDashboard.jsx';
import OwnerInventoryManagement from './pages/dashboards/owner/inventory/OwnerInventoryManagement.jsx';
import OwnerCustomerManagement from './pages/dashboards/owner/customer/OwnerCustomerManagement.jsx';
import OwnerStaffManagement from './pages/dashboards/owner/staff/OwnerStaffManagement.jsx';
import Reports from './pages/dashboards/owner/Reports.jsx';
import StaffDashboard from './pages/dashboards/staff/StaffDashboard.jsx';
import StaffInventoryManagement from './pages/dashboards/staff/inventory/StaffInventoryManagement.jsx';
import TaskManager from './pages/dashboards/staff/tasks/TaskManager.jsx';
import AboutUs from './pages/AboutUs.jsx';
import { CartProvider } from './pages/dashboards/customer/cart/cartcontext';
import PaymentSuccess from './pages/dashboards/customer/cart/PaymentSuccess.jsx';
import PurchaseHistory from './pages/dashboards/customer/purchase/PurchaseHistory.jsx';

function App() {
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      // Set user state or perform any necessary actions
    }
  }, []);

  return (
    <CartProvider>
      <Router>
        <div className="App">
          <ToastContainer 
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<CustomerDashboard />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
              <Route path="/owner/inventory" element={<OwnerInventoryManagement />} />
              <Route path="/owner/customer" element={<OwnerCustomerManagement />} />
              <Route path="/owner/staff" element={<OwnerStaffManagement />} />              <Route path="/owner/reports" element={<Reports />} />
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/inventory-management" element={<StaffInventoryManagement />} />
              <Route path="/staff/task-manager" element={<TaskManager />} />
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/checkout" element={<Checkout />} />              
              <Route path="/customer/cart" element={<Cart />} />
              <Route path="/customer/inventory" element={<CustomerProducts />} />
              <Route path="/customer/payment-success" element={<PaymentSuccess />} />
              <Route path="/customer/purchase-history" element={<PurchaseHistory />} />
              <Route path="/AboutUs" element={<AboutUs />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
