const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Initialize SQLite Database
const db = new sqlite3.Database('./dashboard.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeDatabase();
    }
});

// Create tables and seed initial data
function initializeDatabase() {
    // Create daily_data table
    db.run(`CREATE TABLE IF NOT EXISTS daily_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE NOT NULL,
        revenue REAL DEFAULT 0,
        orders INTEGER DEFAULT 0,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        day INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create summary_metrics table for quick access
    db.run(`CREATE TABLE IF NOT EXISTS summary_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT UNIQUE NOT NULL,
        metric_value REAL DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Seed initial data if tables are empty
    seedInitialData();
}

function seedInitialData() {
    // Check if we have any data
    db.get("SELECT COUNT(*) as count FROM daily_data", (err, row) => {
        if (err) {
            console.error('Error checking data:', err);
            return;
        }
        
        if (!row || row.count === 0) {
            console.log('Seeding initial data...');
            
            // Generate sample data for 2024 and 2025
            const years = [2024, 2025];
            const insertStmt = db.prepare(`INSERT OR REPLACE INTO daily_data 
                (date, revenue, orders, year, month, day) VALUES (?, ?, ?, ?, ?, ?)`);
            
            years.forEach(year => {
                for (let month = 0; month < 12; month++) {
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    
                    for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day);
                        const dateStr = date.toISOString().split('T')[0];
                        
                        // Generate realistic sample data
                        const baseRevenue = year === 2025 ? 400 : 350;
                        const baseOrders = year === 2025 ? 8 : 6;
                        
                        const revenue = Math.floor(baseRevenue + (Math.random() * 300));
                        const orders = Math.floor(baseOrders + (Math.random() * 6));
                        
                        insertStmt.run([dateStr, revenue, orders, year, month + 1, day]);
                    }
                }
            });
            
            insertStmt.finalize(() => {
                // Initialize summary metrics after data is inserted
                db.run(`INSERT OR REPLACE INTO summary_metrics (metric_name, metric_value) VALUES 
                    ('total_orders_2025', 0),
                    ('total_revenue_2025', 0),
                    ('total_orders_2024', 0),
                    ('total_revenue_2024', 0)`, (err) => {
                    if (err) {
                        console.error('Error inserting summary metrics:', err);
                    } else {
                        updateSummaryMetrics();
                        console.log('Initial data seeded successfully!');
                    }
                });
            });
        }
    });
}

function updateSummaryMetrics() {
    // Update 2025 totals
    db.get(`SELECT SUM(revenue) as total_revenue, SUM(orders) as total_orders 
            FROM daily_data WHERE year = 2025`, (err, row) => {
        if (!err && row) {
            db.run(`UPDATE summary_metrics SET metric_value = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE metric_name = 'total_revenue_2025'`, [row.total_revenue || 0]);
            db.run(`UPDATE summary_metrics SET metric_value = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE metric_name = 'total_orders_2025'`, [row.total_orders || 0]);
        }
    });
    
    // Update 2024 totals
    db.get(`SELECT SUM(revenue) as total_revenue, SUM(orders) as total_orders 
            FROM daily_data WHERE year = 2024`, (err, row) => {
        if (!err && row) {
            db.run(`UPDATE summary_metrics SET metric_value = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE metric_name = 'total_revenue_2024'`, [row.total_revenue || 0]);
            db.run(`UPDATE summary_metrics SET metric_value = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE metric_name = 'total_orders_2024'`, [row.total_orders || 0]);
        }
    });
    
    // Emit updated metrics to all connected clients
    setTimeout(() => {
        db.all("SELECT * FROM summary_metrics", (err, rows) => {
            if (!err) {
                const metrics = {};
                rows.forEach(row => {
                    metrics[row.metric_name] = row.metric_value;
                });
                io.emit('metricsUpdated', metrics);
            }
        });
    }, 100); // Small delay to ensure all updates are complete
}

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// API Routes

// Get all summary metrics
app.get('/api/metrics', (req, res) => {
    db.all("SELECT * FROM summary_metrics", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        const metrics = {};
        rows.forEach(row => {
            metrics[row.metric_name] = row.metric_value;
        });
        
        res.json(metrics);
    });
});

// Get data by period (year, month, day, custom range)
app.get('/api/data/:period', (req, res) => {
    const { period } = req.params;
    const { year = 2025, month, startDate, endDate } = req.query;
    
    let query = '';
    let params = [];
    
    switch (period) {
        case 'year':
            query = `SELECT month, SUM(revenue) as revenue, SUM(orders) as orders 
                     FROM daily_data WHERE year = ? GROUP BY month ORDER BY month`;
            params = [year];
            break;
            
        case 'month':
            if (!month) {
                return res.status(400).json({ error: 'Month parameter required' });
            }
            query = `SELECT day, revenue, orders FROM daily_data 
                     WHERE year = ? AND month = ? ORDER BY day`;
            params = [year, month];
            break;
            
        case 'day':
            query = `SELECT date, revenue, orders FROM daily_data 
                     WHERE year = ? ORDER BY date DESC LIMIT 30`;
            params = [year];
            break;
            
        case 'custom':
            if (!startDate || !endDate) {
                return res.status(400).json({ error: 'Start and end dates required' });
            }
            query = `SELECT date, revenue, orders FROM daily_data 
                     WHERE date BETWEEN ? AND ? ORDER BY date`;
            params = [startDate, endDate];
            break;
            
        default:
            return res.status(400).json({ error: 'Invalid period' });
    }
    
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get recent data (most recently updated)
app.get('/api/recent', (req, res) => {
    const { limit = 10 } = req.query;
    
    const query = `SELECT date, revenue, orders, updated_at 
                   FROM daily_data 
                   ORDER BY updated_at DESC 
                   LIMIT ?`;
    
    db.all(query, [parseInt(limit)], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Update single day data
app.put('/api/data/day', (req, res) => {
    const { date, revenue, orders } = req.body;
    
    if (!date || revenue === undefined || orders === undefined) {
        return res.status(400).json({ error: 'Date, revenue, and orders are required' });
    }
    
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    
    db.run(`INSERT OR REPLACE INTO daily_data 
            (date, revenue, orders, year, month, day, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [date, revenue, orders, year, month, day],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            updateSummaryMetrics();
            io.emit('dataUpdated', { type: 'single', date, revenue, orders });
            res.json({ 
                message: 'Data updated successfully',
                changes: this.changes
            });
        }
    );
});

// Bulk update data
app.put('/api/data/bulk', (req, res) => {
    const { data } = req.body;
    
    if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ error: 'Data array is required' });
    }
    
    const stmt = db.prepare(`INSERT OR REPLACE INTO daily_data 
        (date, revenue, orders, year, month, day, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`);
    
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        data.forEach(item => {
            const { date, revenue, orders } = item;
            const dateObj = new Date(date);
            const year = dateObj.getFullYear();
            const month = dateObj.getMonth() + 1;
            const day = dateObj.getDate();
            
            stmt.run([date, revenue, orders, year, month, day]);
        });
        
        db.run("COMMIT", (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            updateSummaryMetrics();
            io.emit('dataUpdated', { type: 'bulk', count: data.length });
            res.json({ 
                message: `${data.length} records updated successfully`
            });
        });
    });
    
    stmt.finalize();
});

// Delete data for a specific date
app.delete('/api/data/day/:date', (req, res) => {
    const { date } = req.params;
    
    db.run("DELETE FROM daily_data WHERE date = ?", [date], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        updateSummaryMetrics();
        io.emit('dataUpdated', { type: 'delete', date });
        res.json({ 
            message: 'Data deleted successfully',
            changes: this.changes
        });
    });
});

// Get comparison data between two years
app.get('/api/comparison/:year1/:year2', (req, res) => {
    const { year1, year2 } = req.params;
    const { period = 'year' } = req.query;
    
    let groupBy = '';
    switch (period) {
        case 'year':
            groupBy = 'month';
            break;
        case 'month':
            groupBy = 'day';
            break;
        default:
            groupBy = 'month';
    }
    
    const query = `
        SELECT 
            ${groupBy},
            SUM(CASE WHEN year = ? THEN revenue ELSE 0 END) as revenue_${year1},
            SUM(CASE WHEN year = ? THEN orders ELSE 0 END) as orders_${year1},
            SUM(CASE WHEN year = ? THEN revenue ELSE 0 END) as revenue_${year2},
            SUM(CASE WHEN year = ? THEN orders ELSE 0 END) as orders_${year2}
        FROM daily_data 
        WHERE year IN (?, ?) 
        GROUP BY ${groupBy} 
        ORDER BY ${groupBy}
    `;
    
    db.all(query, [year1, year1, year2, year2, year1, year2], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Serve the main dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Nabataty Dashboard Server running on http://localhost:${PORT}`);
    console.log(`📊 Database: SQLite (dashboard.db)`);
    console.log(`🔧 API endpoints available at http://localhost:${PORT}/api/`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
