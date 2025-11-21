const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer Setup (File Upload config)
const upload = multer({ dest: 'uploads/' });

// --- ROUTES ---

// 1. GET ALL PRODUCTS
app.get('/api/products', (req, res) => {
    const sql = "SELECT * FROM products";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});

// 2. ADD SINGLE PRODUCT
app.post('/api/products', (req, res) => {
    const { name, category, brand, stock, unit, image } = req.body;
    const status = stock > 0 ? 'In Stock' : 'Out of Stock';
    const sql = `INSERT INTO products (name, category, brand, stock, unit, status, image) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [name, category, brand, stock, unit, status, image], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Added successfully", id: this.lastID });
    });
});

// 3. UPDATE PRODUCT (With History)
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, category, brand, stock, unit, image } = req.body;
    const newStock = parseInt(stock);
    const status = newStock > 0 ? 'In Stock' : 'Out of Stock';

    db.get("SELECT stock FROM products WHERE id = ?", [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: "Product not found" });
        
        const oldStock = row.stock;
        if (oldStock !== newStock) {
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

// 4. GET HISTORY
app.get('/api/products/:id/history', (req, res) => {
    db.all("SELECT * FROM inventory_history WHERE product_id = ? ORDER BY change_date DESC", [req.params.id], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});

// 5. IMPORT CSV (The Bulk Import Logic)
app.post('/api/products/import', upload.single('file'), (req, res) => {
    const results = [];
    let successCount = 0;
    let failCount = 0;

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            // Process each row
            const processRow = async () => {
                for (const row of results) {
                    const { name, category, brand, stock, unit, image } = row;
                    const status = stock > 0 ? 'In Stock' : 'Out of Stock';
                    
                    // Insert (using Promise wrapper to keep order)
                    await new Promise((resolve) => {
                        const sql = `INSERT INTO products (name, category, brand, stock, unit, status, image) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                        db.run(sql, [name, category, brand, stock, unit, status, image], (err) => {
                            if (!err) successCount++;
                            else failCount++; // Likely duplicate name
                            resolve();
                        });
                    });
                }
                // Cleanup temp file
                fs.unlinkSync(req.file.path);
                res.json({ message: "Import processed", success: successCount, failed: failCount });
            };
            processRow();
        });
});

// 6. EXPORT CSV (Download)
app.get('/api/products/export', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Convert JSON to CSV string manually
        const headers = ['id', 'name', 'category', 'brand', 'stock', 'unit', 'status'];
        const csvRows = rows.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] || '')).join(','));
        const csvString = [headers.join(','), ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
        res.status(200).send(csvString);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});