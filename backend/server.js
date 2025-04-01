const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3001;

// Database setup
const db = new sqlite3.Database('/app/database/db.sqlite3');

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint to save names to the database
app.post('/add-name', (req, res) => {
  const { name } = req.body;
  db.run('INSERT INTO names (name) VALUES (?)', [name], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID, name });
  });
});

// API endpoint to get all names from the database
app.get('/names', (req, res) => {
  db.all('SELECT * FROM names', [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ names: rows });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});

// Initialize the database (Create table)
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS names (id INTEGER PRIMARY KEY, name TEXT)');

  -- 1. Core Inventory & Food Data
  db.run('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS storage_locations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');
  db.run(`CREATE TABLE IF NOT EXISTS food_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      category_id INTEGER,
      calories_per_unit REAL,
      quantity REAL,
      unit TEXT,
      storage_location_id INTEGER,
      expiry_date DATE,
      purchase_date DATE,
      last_purchase_price REAL,
      notes TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (storage_location_id) REFERENCES storage_locations(id)
  )`);

  -- 2. Price Comparison & Purchase History
  db.run('CREATE TABLE IF NOT EXISTS stores (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, location TEXT, contact_info TEXT)');
  db.run(`CREATE TABLE IF NOT EXISTS store_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_item_id INTEGER,
      store_id INTEGER,
      price REAL,
      last_checked DATE,
      FOREIGN KEY (food_item_id) REFERENCES food_items(id),
      FOREIGN KEY (store_id) REFERENCES stores(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS purchase_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_item_id INTEGER,
      store_id INTEGER,
      quantity REAL,
      unit TEXT,
      price REAL,
      purchase_date DATE,
      expiry_date DATE,
      FOREIGN KEY (food_item_id) REFERENCES food_items(id),
      FOREIGN KEY (store_id) REFERENCES stores(id)
  )`);

  -- 3. Shopping & Recipe Integration
  db.run('CREATE TABLE IF NOT EXISTS shopping_list (id INTEGER PRIMARY KEY AUTOINCREMENT, food_item_id INTEGER, quantity_needed REAL, unit TEXT, priority TEXT, FOREIGN KEY (food_item_id) REFERENCES food_items(id))');
  db.run('CREATE TABLE IF NOT EXISTS recipes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, instructions TEXT, total_calories REAL, servings REAL)');
  db.run(`CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER,
      food_item_id INTEGER,
      quantity_required REAL,
      unit TEXT,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id),
      FOREIGN KEY (food_item_id) REFERENCES food_items(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS recipe_shopping_checklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER,
      food_item_id INTEGER,
      quantity_missing REAL,
      unit TEXT,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id),
      FOREIGN KEY (food_item_id) REFERENCES food_items(id)
  )`);

  -- 4. Expense Tracking
  db.run('CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, date DATE, amount REAL, category TEXT, notes TEXT)');
  db.run(`CREATE TABLE IF NOT EXISTS home_cooked_meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER,
      date_prepared DATE,
      servings_made REAL,
      total_cost REAL,
      expense_id INTEGER,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id),
      FOREIGN KEY (expense_id) REFERENCES expenses(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS eating_out_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_name TEXT,
      meal_description TEXT,
      price REAL,
      date DATE,
      expense_id INTEGER,
      FOREIGN KEY (expense_id) REFERENCES expenses(id)
  )`);
});
