const db = require('../config/db');

exports.createPurchase = async (customerId, products, totalAmount, sessionId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Create purchase record
    const [purchaseResult] = await connection.query(
      'INSERT INTO purchases (customer_id, total_amount, stripe_session_id, purchase_date) VALUES (?, ?, ?, NOW())',
      [customerId, totalAmount, sessionId]
    );
    const purchaseId = purchaseResult.insertId;

    // Insert purchase items
    for (const product of products) {
      await connection.query(
        'INSERT INTO purchase_items (purchase_id, harvest_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [purchaseId, product.HarvestID, product.required_quantity, product.UnitPrice, product.sub_total]
      );
    }

    await connection.commit();
    return purchaseId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.getPurchaseHistory = async (customerId) => {
  try {
    console.log('Running purchase history query for customer:', customerId);
    const [purchases] = await db.query(
      `SELECT 
        p.id as purchase_id,
        p.purchase_date,
        p.total_amount,
        p.stripe_session_id,
        pi.id as item_id,
        pi.quantity,
        pi.unit_price,
        pi.subtotal,
        pi.harvest_id,
        pi.crop_name,
        h.CropName as harvest_crop_name
      FROM purchases p
      JOIN purchase_items pi ON p.id = pi.purchase_id
      LEFT JOIN harvestinventory h ON pi.harvest_id = h.HarvestID
      WHERE p.customer_id = ?
      ORDER BY p.purchase_date DESC`,
      [customerId]
    );
    console.log('Query results:', purchases);
    return purchases;
  } catch (error) {
    console.error('Database error in getPurchaseHistory:', error);
    throw error;
  }
};
