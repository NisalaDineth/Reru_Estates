// db.js
const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',      // MySQL server host
  user: 'root',   // MySQL username
  password: '*0713928130Mysql', // MySQL password
  database: 'inventory_db', // MySQL database name
});

// Establish a connection
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL ' );
});

module.exports = connection.promise();
