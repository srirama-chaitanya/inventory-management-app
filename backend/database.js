const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite (creates 'inventory.db' automatically)
const db = new sqlite3.Database(path.join(__dirname, 'inventory.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

db.serialize(() => {
    // 1. Products Table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        category TEXT,
        brand TEXT,
        stock INTEGER NOT NULL DEFAULT 0,
        unit TEXT,
        status TEXT,
        image TEXT
    )`);

    // 2. History Table (Audit Log)
    db.run(`CREATE TABLE IF NOT EXISTS inventory_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        old_quantity INTEGER,
        new_quantity INTEGER,
        change_date TEXT,
        action_type TEXT,
        FOREIGN KEY(product_id) REFERENCES products(id)
    )`);
});

module.exports = db;