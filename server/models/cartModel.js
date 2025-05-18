const pool = require('../config/db'); // Correct import

const addToCart = async (cart) => {
    const alreadyExists = await isItemInCart(cart.CustomerID, cart.HarvestID);
    if (alreadyExists) {
        throw new Error('Item already in cart');
    }

    const query = 'INSERT INTO Cart (CustomerID, HarvestID) VALUES (?, ?)';
    const [result] = await pool.query(query, [cart.CustomerID, cart.HarvestID]);
    return result;
};
const isItemInCart = async (customerID, harvestID) => {
    const query = 'SELECT * FROM Cart WHERE CustomerID = ? AND HarvestID = ?';
    const [rows] = await pool.query(query, [customerID, harvestID]);
    return rows.length > 0;
};


    const getCartItems = async (customerId) => {
        const query = `
            SELECT c.CartID, h.CropName, h.Category, h.UnitPrice, h.QuantityAvailable 
            FROM Cart c 
            JOIN harvestinventory h ON c.HarvestID = h.HarvestID 
            WHERE c.CustomerID = ?
        `;
        const [rows] = await pool.query(query, [customerId]);
        return rows;
    };

module.exports = {
    addToCart,
    getCartItems,
    isItemInCart
};
