// run-expenses-migration.js
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const db = require('../config/db');

async function runMigration() {
    try {
        console.log('Starting expenses table migration...');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'expenses_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Split and execute each SQL statement
        const statements = sql.split(';').filter(statement => statement.trim() !== '');
        
        for (const statement of statements) {
            if (statement.trim()) {
                console.log(`Executing: ${statement}`);
                await db.query(statement);
                console.log('Statement executed successfully');
            }
        }
        
        console.log('Expenses table migration completed successfully');
    } catch (error) {
        console.error('Error running expenses table migration:', error);
    }
}

// Run migration
runMigration();