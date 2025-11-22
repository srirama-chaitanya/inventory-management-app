require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const db = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000; 
const SECRET_KEY = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());

// Multer Setup (File Uploads)
const upload = multer({ dest: 'uploads/' });

// --- MIDDLEWARE: THE BOUNCER (Verify JWT) ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ error: "No token provided" });
    }

    // Format: "Bearer <token>" -> Split to get the token part
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: "Malformed token" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized: Invalid Token" });
        }
        req.userId = decoded.id; // Save user ID for future use
        next(); // Pass to the next function
    });
};

// --- AUTH ROUTES ---

// 1. REGISTER
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
        if (err) return res.status(400).json({ error: "Username already exists" });
        
        // Auto-login after register
        const token = jwt.sign({ id: this.lastID }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ auth: true, token, user: { id: this.lastID, username } });
    });
});

// 2. LOGIN
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) return res.status(404).json({ error: "User not found" });

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ auth: false, token: null, error: "Invalid Password" });

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ auth: true, token, user: { id: user.id, username: user.username } });
    });
});

// --- PUBLIC ROUTES (Anyone can see) ---

// 3. GET ALL PRODUCTS
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});

// 4. SEARCH PRODUCTS
app.get('/api/products/search', (req, res) => {
    const { name } = req.query;
    const sql = "SELECT * FROM products WHERE name LIKE ?";
    db.all(sql, [`%${name}%`], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});

// 5. GET HISTORY
app.get('/api/products/:id/history', (req, res) => {
    const sql = "SELECT * FROM inventory_history WHERE product_id = ? ORDER BY change_date DESC";
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});

// 6. EXPORT CSV
app.get('/api/products/export', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const headers = ['id', 'name', 'category', 'brand', 'stock', 'unit', 'status'];
        const csvRows = rows.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] || '')).join(','));
        const csvString = [headers.join(','), ...csvRows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
        res.status(200).send(csvString);
    });
});

// --- PROTECTED ROUTES (Only with Token) ---

// 7. ADD PRODUCT (Protected)
app.post('/api/products', verifyToken, (req, res) => {
    const { name, category, brand, stock, unit, image } = req.body;
    const status = stock > 0 ? 'In Stock' : 'Out of Stock';
    const sql = `INSERT INTO products (name, category, brand, stock, unit, status, image) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [name, category, brand, stock, unit, status, image], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Added successfully", id: this.lastID });
    });
});

// 8. UPDATE PRODUCT (Protected)
app.put('/api/products/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { name, category, brand, stock, unit, image } = req.body;
    const newStock = parseInt(stock);
    const status = newStock > 0 ? 'In Stock' : 'Out of Stock';

    db.get("SELECT stock FROM products WHERE id = ?", [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: "Product not found" });
        
        const oldStock = row.stock;
        if (oldStock !== newStock) {
            // Log change (Bonus: You could record req.userId here to see WHO changed it)
            const historySql = `INSERT INTO inventory_history (product_id, old_quantity, new_quantity, change_date, action_type) VALUES (?, ?, ?, ?, ?)`;
            db.run(historySql, [id, oldStock, newStock, new Date().toISOString(), 'Update']);
        }

        const updateSql = `UPDATE products SET name=?, category=?, brand=?, stock=?, unit=?, status=?, image=? WHERE id=?`;
        db.run(updateSql, [name, category, brand, newStock, unit, status, image, id], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: "Updated successfully" });
        });
    });
});

// 9. DELETE PRODUCT (Protected)
app.delete('/api/products/:id', verifyToken, (req, res) => {
    db.run("DELETE FROM products WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Deleted successfully" });
    });
});

// 10. IMPORT CSV (Protected)
app.post('/api/products/import', verifyToken, upload.single('file'), (req, res) => {
    const results = [];
    let successCount = 0;
    let failCount = 0;

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            const processRow = async () => {
                for (const row of results) {
                    const { name, category, brand, stock, unit, image } = row;
                    const status = stock > 0 ? 'In Stock' : 'Out of Stock';
                    await new Promise((resolve) => {
                        const sql = `INSERT INTO products (name, category, brand, stock, unit, status, image) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                        db.run(sql, [name, category, brand, stock, unit, status, image], (err) => {
                            if (!err) successCount++;
                            else failCount++; 
                            resolve();
                        });
                    });
                }
                fs.unlinkSync(req.file.path);
                res.json({ message: "Import processed", success: successCount, failed: failCount });
            };
            processRow();
        });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});