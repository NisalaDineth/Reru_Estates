const cartModel = require('../models/cartModel');
const pool = require('../config/db'); // Import MySQL connection

const addToCart = async (req, res) => {
    const customerId = req.user.id;
    const { harvestId } = req.body;

    try {
        await cartModel.addToCart({ CustomerID: customerId, HarvestID: harvestId });
        res.status(201).json({ message: 'Item added to cart' });
    } catch (error) {
        if (error.message === 'Item already in cart') {
            return res.status(400).json({ message: 'Item already exists in cart' });
        }
        res.status(500).json({ message: 'Failed to add to cart', error: error.message });
    }
};


const getCart = async (req, res) => {
    const customerId = req.user.id;
    console.log('Fetching cart for Customer ID:', customerId);

    


    try {
        const items = await cartModel.getCartItems(customerId);
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve cart items', error: error.message });
    }
};
const deleteFromCart = async (req, res) => {
    const customerId = req.user.id;
    const { cartId } = req.params;

    try {
        const query = 'DELETE FROM Cart WHERE CartID = ? AND CustomerID = ?';
        await pool.query(query, [cartId, customerId]);
        res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Failed to remove item', error: error.message });
    }
};


module.exports = {
    addToCart,
    getCart,
    deleteFromCart
};
