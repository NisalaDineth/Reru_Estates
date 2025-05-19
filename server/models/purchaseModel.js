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
  const [purchases] = await db.query(
    `SELECT p.*, pi.*
     FROM purchases p
     JOIN purchase_items pi ON p.id = pi.purchase_id
     WHERE p.customer_id = ?
     ORDER BY p.purchase_date DESC`,
    [customerId]
  );
  return purchases;
};
