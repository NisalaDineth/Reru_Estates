// db.js
const mysql = require('mysql2');

// Create a connection pool to the database
const pool = mysql.createPool({
  host: 'localhost',      // MySQL server host
  user: 'root',           // MySQL username
  password: '', // MySQL password
  database: 'inventory_db', // MySQL database name
  waitForConnections: true,
  connectionLimit: 10,     // Maximum number of connections in the pool
  queueLimit: 0
});

// Test the pool connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL pool:', err);
    return;
  }
  console.log('Connected to MySQL');
  connection.release(); // Release the connection when done
});

module.exports = pool.promise();
