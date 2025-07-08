import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import './CustomerProducts.css';
import { useCart } from '../cart/cartcontext';

const CustomerProducts = () => {
    const navigate = useNavigate();
    const [inventory, setInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const { refreshCartItems } = useCart();
    
    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch('http://localhost:5001/api/customer/inventory', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Fetch failed');
            }

            // Parse the response data
            // Handle both array and object responses
            const data = await response.json();
            const inventoryData = Array.isArray(data) ? data : (data.rows || data);
            setInventory(inventoryData);
            setFilteredInventory(inventoryData);
            
            // Extract unique categories
            const uniqueCategories = [...new Set(inventoryData.map(item => item.Category))];
            setCategories(uniqueCategories);
            
            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message || 'Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    // Function to add product to cart
    // This function sends a POST request to add the selected product to the user's cart
    const addToCart = async (product) => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:5001/api/cart/add", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ harvestId: product.HarvestID })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to add item to cart');
            }

            // Update cart badge count after successfully adding to cart
            refreshCartItems();
            
            alert(`${product.CropName} added to cart!`);
        } catch (err) {
            if (err.message.includes('already')) {
                alert(`${product.CropName} is already in your cart.`);
            } else {
                alert(`Error: ${err.message}`);
            }
        }
    };

    // Apply filters when filter criteria change
    useEffect(() => {
        applyFilters();
    }, [selectedCategory, dateRange, inventory]);

    // Filter function
    const applyFilters = () => {
        let filtered = [...inventory];
        
        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(item => item.Category === selectedCategory);
        }
        
        // Apply date range filter
        if (dateRange.startDate && dateRange.endDate) {
            const start = new Date(dateRange.startDate);
            const end = new Date(dateRange.endDate);
            
            filtered = filtered.filter(item => {
                const harvestDate = new Date(item.HarvestingDate);
                return harvestDate >= start && harvestDate <= end;
            });
        }
        
        setFilteredInventory(filtered);
    };

    // Handle filter changes
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleDateChange = (e) => {
        setDateRange({
            ...dateRange,
            [e.target.name]: e.target.value
        });
    };
    
    const clearFilters = () => {
        setSelectedCategory('');
        setDateRange({ startDate: '', endDate: '' });
        setFilteredInventory(inventory);
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    if (loading) return <div className="loading">Loading inventory...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    // Render the products with filtering options
    // This component displays a list of products with options to filter by category and harvesting date range
    return (
        <div className="products-container">
            <h2 className="products-header">Our Fresh Products</h2>
            
            {/* Filter Section */}
            <div className="filter-section">
                <h3>Filter Products</h3>
                <div className="filter-controls">
                    <div className="filter-group">
                        <label htmlFor="category-filter">Category:</label>
                        <select 
                            id="category-filter" 
                            value={selectedCategory} 
                            onChange={handleCategoryChange}
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Harvesting Date Range:</label>
                        <div className="date-inputs">
                            <input 
                                type="date" 
                                name="startDate"
                                value={dateRange.startDate} 
                                onChange={handleDateChange}
                                placeholder="From"
                            />
                            <span>to</span>
                            <input 
                                type="date" 
                                name="endDate"
                                value={dateRange.endDate} 
                                onChange={handleDateChange}
                                placeholder="To"
                            />
                        </div>
                    </div>
                    
                    <button className="clear-filters" onClick={clearFilters}>
                        Clear Filters
                    </button>
                </div>
                
                <div className="filter-summary">
                    {filteredInventory.length} products found
                </div>
            </div>
            
            {/* Products Grid */}
            <div className="products-grid">
                {filteredInventory.length > 0 ? (
                    filteredInventory.map(item => (
                        <div key={item.HarvestID} className="product-card">
                            <div className="product-image">
                                <div className="image-placeholder">{item.CropName.charAt(0)}</div>
                            </div>
                            <div className="product-details">
                                <h3 className="product-name">{item.CropName}</h3>
                                <p className="product-category">{item.Category}</p>
                                <p className="product-price">Rs. {item.UnitPrice || 'N/A'}</p>
                                <p className="product-quantity">Available: {item.QuantityAvailable} kg</p>
                                <p className="product-available">Harvesting Date: {new Date(item.HarvestingDate).toLocaleDateString()}</p>
                                <div className="product-buttons">
                                    <button 
                                        className="add-to-cart"
                                        onClick={() => addToCart(item)}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-products">No products match your filters. Try adjusting your criteria.</div>
                )}
            </div>
        </div>
    );
};

export default CustomerProducts;
