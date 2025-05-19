const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigrations() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '*0713928130Mysql',
      database: 'inventory_db'
    });

    console.log('Connected to database.');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'migrations', 'purchase_tables.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');

    // Split into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim());

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('Successfully executed:', statement.substr(0, 50) + '...');
        } catch (err) {
          console.error('Error executing statement:', statement);
          console.error('Error:', err);
        }
      }
    }

    console.log('Migrations completed successfully.');
    await connection.end();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigrations();
