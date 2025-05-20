const db = require('./config/db');

async function listInventory() {
  try {
    console.log('Fetching inventory items...');
    const [rows] = await db.query('SELECT * FROM harvestinventory LIMIT 10');
    
    if (rows.length === 0) {
      console.log('No inventory items found in the database.');
    } else {
      console.log('Available inventory items:');
      rows.forEach(item => {
        console.log(`ID: ${item.HarvestID}, Crop: ${item.CropName}, Available: ${item.QuantityAvailable}`);
      });
    }
  } catch (error) {
    console.error('Error fetching inventory:', error);
  } finally {
    process.exit(0);
  }
}

listInventory();
