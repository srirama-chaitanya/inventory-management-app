const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'inventory.db'), (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to SQLite database.');
});

db.serialize(() => {
    // 1. Products
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

    // 2. History
    db.run(`CREATE TABLE IF NOT EXISTS inventory_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        old_quantity INTEGER,
        new_quantity INTEGER,
        change_date TEXT,
        action_type TEXT,
        FOREIGN KEY(product_id) REFERENCES products(id)
    )`);

    // 3. USERS (New!)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);
});

module.exports = db;