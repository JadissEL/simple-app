import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import { promises as fs } from 'fs';

interface FoodItem {
  id: number;
  name: string;
  category_id?: number;
  storage_location_id?: number;
  quantity: number;
  unit: string;
  expiry_date?: string;
}

interface Category {
  id: number;
  name: string;
}

interface StorageLocation {
  id: number;
  name: string;
}

// Add other interfaces as needed
interface StorageLocation {
  id: number;
  name: string;
}

interface Store {
  id: number;
  name: string;
  address?: string;
  website?: string;
}

interface StorePrice {
  id: number;
  store_id: number;
  food_item_id: number;
  price: number;
  date: string;
  unit?: string;
}

interface PurchaseHistory {
  id: number;
  store_id: number;
  food_item_id: number;
  quantity: number;
  price: number;
  date: string;
  notes?: string;
}

interface ShoppingListItem {
  id: number;
  food_item_id: number;
  quantity: number;
  unit: string;
  priority: number;
  completed: boolean;
}

interface Recipe {
  id: number;
  name: string;
  description?: string;
  instructions: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
}

interface RecipeIngredient {
  id: number;
  recipe_id: number;
  food_item_id: number;
  quantity: number;
  unit: string;
  notes?: string;
}

interface RecipeShoppingChecklist {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  quantity: number;
  unit: string;
  completed: boolean;
}

interface Expense {
  id: number;
  store_id?: number;
  food_item_id?: number;
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

interface HomeCookedMeal {
  id: number;
  recipe_id?: number;
  name: string;
  date: string;
  notes?: string;
  rating?: number;
}

interface EatingOutExpense {
  id: number;
  store_id: number;
  amount: number;
  date: string;
  notes?: string;
  rating?: number;
}

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
const { verbose } = sqlite3;

// Initialize database tables
async function initializeDatabase(db: Database) {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS food_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER,
        storage_location_id INTEGER,
        quantity INTEGER,
        unit TEXT,
        expiry_date TEXT,
        FOREIGN KEY(category_id) REFERENCES categories(id),
        FOREIGN KEY(storage_location_id) REFERENCES storage_locations(id)
      );
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS storage_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS stores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        website TEXT
      );
      CREATE TABLE IF NOT EXISTS store_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_id INTEGER NOT NULL,
        food_item_id INTEGER NOT NULL,
        price REAL NOT NULL,
        date TEXT NOT NULL,
        unit TEXT,
        FOREIGN KEY(store_id) REFERENCES stores(id),
        FOREIGN KEY(food_item_id) REFERENCES food_items(id)
      );
      CREATE TABLE IF NOT EXISTS purchase_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_id INTEGER NOT NULL,
        food_item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY(store_id) REFERENCES stores(id),
        FOREIGN KEY(food_item_id) REFERENCES food_items(id)
      );
      CREATE TABLE IF NOT EXISTS shopping_list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food_item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit TEXT NOT NULL,
        priority INTEGER DEFAULT 1,
        completed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY(food_item_id) REFERENCES food_items(id)
      );
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        instructions TEXT NOT NULL,
        prep_time INTEGER,
        cook_time INTEGER,
        servings INTEGER
      );
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        food_item_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY(recipe_id) REFERENCES recipes(id),
        FOREIGN KEY(food_item_id) REFERENCES food_items(id)
      );
      CREATE TABLE IF NOT EXISTS recipe_shopping_checklist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY(recipe_id) REFERENCES recipes(id),
        FOREIGN KEY(ingredient_id) REFERENCES recipe_ingredients(id)
      );
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_id INTEGER,
        food_item_id INTEGER,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY(store_id) REFERENCES stores(id),
        FOREIGN KEY(food_item_id) REFERENCES food_items(id)
      );
      CREATE TABLE IF NOT EXISTS home_cooked_meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        rating INTEGER,
        FOREIGN KEY(recipe_id) REFERENCES recipes(id)
      );
      CREATE TABLE IF NOT EXISTS eating_out_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        rating INTEGER,
        FOREIGN KEY(store_id) REFERENCES stores(id)
      );
      // Add other table creation statements here
    `);
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

const db: Database = new (verbose().Database)('./database/db.sqlite3', (err: Error | null) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase(db);
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Food Items Endpoints
app.get('/food_items', async (req: Request, res: Response) => {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM food_items', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.get('/food_items/:id', async (req: Request, res: Response) => {
  try {
    const row = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM food_items WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Food item not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.post('/food_items', async (req: Request, res: Response) => {
  const foodItem: FoodItem = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'INSERT INTO food_items (name, category_id, storage_location_id, quantity, unit, expiry_date) VALUES (?, ?, ?, ?, ?, ?)',
        [foodItem.name, foodItem.category_id, foodItem.storage_location_id, foodItem.quantity, foodItem.unit, foodItem.expiry_date],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    res.status(201).json({ id: result.lastID });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.put('/food_items/:id', async (req: Request, res: Response) => {
  const foodItem: FoodItem = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'UPDATE food_items SET name = ?, category_id = ?, storage_location_id = ?, quantity = ?, unit = ?, expiry_date = ? WHERE id = ?',
        [foodItem.name, foodItem.category_id, foodItem.storage_location_id, foodItem.quantity, foodItem.unit, foodItem.expiry_date, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Food item updated successfully' });
    } else {
      res.status(404).json({ error: 'Food item not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.delete('/food_items/:id', async (req: Request, res: Response) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'DELETE FROM food_items WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Food item deleted successfully' });
    } else {
      res.status(404).json({ error: 'Food item not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

// Categories Endpoints
app.get('/categories', async (req: Request, res: Response) => {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM categories', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.get('/categories/:id', async (req: Request, res: Response) => {
  try {
    const row = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM categories WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.post('/categories', async (req: Request, res: Response) => {
  const category: Category = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'INSERT INTO categories (name) VALUES (?)',
        [category.name],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    res.status(201).json({ id: result.lastID });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.put('/categories/:id', async (req: Request, res: Response) => {
  const category: Category = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'UPDATE categories SET name = ? WHERE id = ?',
        [category.name, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Category updated successfully' });
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.delete('/categories/:id', async (req: Request, res: Response) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'DELETE FROM categories WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Category deleted successfully' });
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

// Storage Locations Endpoints
app.get('/storage_locations', async (req: Request, res: Response) => {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM storage_locations', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.get('/storage_locations/:id', async (req: Request, res: Response) => {
  try {
    const row = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM storage_locations WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Storage location not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.post('/storage_locations', async (req: Request, res: Response) => {
  const location: StorageLocation = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'INSERT INTO storage_locations (name) VALUES (?)',
        [location.name],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    res.status(201).json({ id: result.lastID });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.put('/storage_locations/:id', async (req: Request, res: Response) => {
  const location: StorageLocation = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'UPDATE storage_locations SET name = ? WHERE id = ?',
        [location.name, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Storage location updated successfully' });
    } else {
      res.status(404).json({ error: 'Storage location not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.delete('/storage_locations/:id', async (req: Request, res: Response) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'DELETE FROM storage_locations WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Storage location deleted successfully' });
    } else {
      res.status(404).json({ error: 'Storage location not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

// Stores Endpoints
app.get('/stores', async (req: Request, res: Response) => {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM stores', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.get('/stores/:id', async (req: Request, res: Response) => {
  try {
    const row = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM stores WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Store not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.post('/stores', async (req: Request, res: Response) => {
  const store: Store = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'INSERT INTO stores (name, address, website) VALUES (?, ?, ?)',
        [store.name, store.address, store.website],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    res.status(201).json({ id: result.lastID });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.put('/stores/:id', async (req: Request, res: Response) => {
  const store: Store = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'UPDATE stores SET name = ?, address = ?, website = ? WHERE id = ?',
        [store.name, store.address, store.website, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Store updated successfully' });
    } else {
      res.status(404).json({ error: 'Store not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.delete('/stores/:id', async (req: Request, res: Response) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'DELETE FROM stores WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Store deleted successfully' });
    } else {
      res.status(404).json({ error: 'Store not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

// Store Prices Endpoints
app.get('/store_prices', async (req: Request, res: Response) => {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM store_prices', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.get('/store_prices/:id', async (req: Request, res: Response) => {
  try {
    const row = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM store_prices WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Store price not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.post('/store_prices', async (req: Request, res: Response) => {
  const storePrice: StorePrice = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'INSERT INTO store_prices (store_id, food_item_id, price, date, unit) VALUES (?, ?, ?, ?, ?)',
        [storePrice.store_id, storePrice.food_item_id, storePrice.price, storePrice.date, storePrice.unit],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    res.status(201).json({ id: result.lastID });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.put('/store_prices/:id', async (req: Request, res: Response) => {
  const storePrice: StorePrice = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'UPDATE store_prices SET store_id = ?, food_item_id = ?, price = ?, date = ?, unit = ? WHERE id = ?',
        [storePrice.store_id, storePrice.food_item_id, storePrice.price, storePrice.date, storePrice.unit, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Store price updated successfully' });
    } else {
      res.status(404).json({ error: 'Store price not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.delete('/store_prices/:id', async (req: Request, res: Response) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'DELETE FROM store_prices WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Store price deleted successfully' });
    } else {
      res.status(404).json({ error: 'Store price not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

// Purchase History Endpoints
app.get('/purchase_history', async (req: Request, res: Response) => {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM purchase_history', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.get('/purchase_history/:id', async (req: Request, res: Response) => {
  try {
    const row = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM purchase_history WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Purchase history entry not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.post('/purchase_history', async (req: Request, res: Response) => {
  const purchase: PurchaseHistory = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'INSERT INTO purchase_history (store_id, food_item_id, quantity, price, date, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [purchase.store_id, purchase.food_item_id, purchase.quantity, purchase.price, purchase.date, purchase.notes],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    res.status(201).json({ id: result.lastID });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.put('/purchase_history/:id', async (req: Request, res: Response) => {
  const purchase: PurchaseHistory = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'UPDATE purchase_history SET store_id = ?, food_item_id = ?, quantity = ?, price = ?, date = ?, notes = ? WHERE id = ?',
        [purchase.store_id, purchase.food_item_id, purchase.quantity, purchase.price, purchase.date, purchase.notes, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Purchase history updated successfully' });
    } else {
      res.status(404).json({ error: 'Purchase history entry not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.delete('/purchase_history/:id', async (req: Request, res: Response) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'DELETE FROM purchase_history WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Purchase history entry deleted successfully' });
    } else {
      res.status(404).json({ error: 'Purchase history entry not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

// Shopping List Endpoints
app.get('/shopping_list', async (req: Request, res: Response) => {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM shopping_list', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.get('/shopping_list/:id', async (req: Request, res: Response) => {
  try {
    const row = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM shopping_list WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Shopping list item not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.post('/shopping_list', async (req: Request, res: Response) => {
  const item: ShoppingListItem = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'INSERT INTO shopping_list (food_item_id, quantity, unit, priority, completed) VALUES (?, ?, ?, ?, ?)',
        [item.food_item_id, item.quantity, item.unit, item.priority, item.completed],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    res.status(201).json({ id: result.lastID });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.put('/shopping_list/:id', async (req: Request, res: Response) => {
  const item: ShoppingListItem = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'UPDATE shopping_list SET food_item_id = ?, quantity = ?, unit = ?, priority = ?, completed = ? WHERE id = ?',
        [item.food_item_id, item.quantity, item.unit, item.priority, item.completed, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Shopping list item updated successfully' });
    } else {
      res.status(404).json({ error: 'Shopping list item not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.delete('/shopping_list/:id', async (req: Request, res: Response) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'DELETE FROM shopping_list WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Shopping list item deleted successfully' });
    } else {
      res.status(404).json({ error: 'Shopping list item not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

// Recipes Endpoints
app.get('/recipes', async (req: Request, res: Response) => {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM recipes', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.get('/recipes/:id', async (req: Request, res: Response) => {
  try {
    const row = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM recipes WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Recipe not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.post('/recipes', async (req: Request, res: Response) => {
  const recipe: Recipe = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'INSERT INTO recipes (name, description, instructions, prep_time, cook_time, servings) VALUES (?, ?, ?, ?, ?, ?)',
        [recipe.name, recipe.description, recipe.instructions, recipe.prep_time, recipe.cook_time, recipe.servings],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    res.status(201).json({ id: result.lastID });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.put('/recipes/:id', async (req: Request, res: Response) => {
  const recipe: Recipe = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'UPDATE recipes SET name = ?, description = ?, instructions = ?, prep_time = ?, cook_time = ?, servings = ? WHERE id = ?',
        [recipe.name, recipe.description, recipe.instructions, recipe.prep_time, recipe.cook_time, recipe.servings, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Recipe updated successfully' });
    } else {
      res.status(404).json({ error: 'Recipe not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.delete('/recipes/:id', async (req: Request, res: Response) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'DELETE FROM recipes WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Recipe deleted successfully' });
    } else {
      res.status(404).json({ error: 'Recipe not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

// Recipe Ingredients Endpoints
app.get('/recipe_ingredients', async (req: Request, res: Response) => {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM recipe_ingredients', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.get('/recipe_ingredients/:id', async (req: Request, res: Response) => {
  try {
    const row = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM recipe_ingredients WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Recipe ingredient not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.post('/recipe_ingredients', async (req: Request, res: Response) => {
  const ingredient: RecipeIngredient = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'INSERT INTO recipe_ingredients (recipe_id, food_item_id, quantity, unit, notes) VALUES (?, ?, ?, ?, ?)',
        [ingredient.recipe_id, ingredient.food_item_id, ingredient.quantity, ingredient.unit, ingredient.notes],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    res.status(201).json({ id: result.lastID });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.put('/recipe_ingredients/:id', async (req: Request, res: Response) => {
  const ingredient: RecipeIngredient = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'UPDATE recipe_ingredients SET recipe_id = ?, food_item_id = ?, quantity = ?, unit = ?, notes = ? WHERE id = ?',
        [ingredient.recipe_id, ingredient.food_item_id, ingredient.quantity, ingredient.unit, ingredient.notes, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Recipe ingredient updated successfully' });
    } else {
      res.status(404).json({ error: 'Recipe ingredient not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.delete('/recipe_ingredients/:id', async (req: Request, res: Response) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'DELETE FROM recipe_ingredients WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Recipe ingredient deleted successfully' });
    } else {
      res.status(404).json({ error: 'Recipe ingredient not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

// Recipe Shopping Checklist Endpoints
app.get('/recipe_shopping_checklist', async (req: Request, res: Response) => {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM recipe_shopping_checklist', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.get('/recipe_shopping_checklist/:id', async (req: Request, res: Response) => {
  try {
    const row = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM recipe_shopping_checklist WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Recipe shopping checklist item not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.post('/recipe_shopping_checklist', async (req: Request, res: Response) => {
  const item: RecipeShoppingChecklist = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'INSERT INTO recipe_shopping_checklist (recipe_id, ingredient_id, quantity, unit, completed) VALUES (?, ?, ?, ?, ?)',
        [item.recipe_id, item.ingredient_id, item.quantity, item.unit, item.completed],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    res.status(201).json({ id: result.lastID });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.put('/recipe_shopping_checklist/:id', async (req: Request, res: Response) => {
  const item: RecipeShoppingChecklist = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'UPDATE recipe_shopping_checklist SET recipe_id = ?, ingredient_id = ?, quantity = ?, unit = ?, completed = ? WHERE id = ?',
        [item.recipe_id, item.ingredient_id, item.quantity, item.unit, item.completed, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Recipe shopping checklist item updated successfully' });
    } else {
      res.status(404).json({ error: 'Recipe shopping checklist item not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.delete('/recipe_shopping_checklist/:id', async (req: Request, res: Response) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'DELETE FROM recipe_shopping_checklist WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Recipe shopping checklist item deleted successfully' });
    } else {
      res.status(404).json({ error: 'Recipe shopping checklist item not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

// Expenses Endpoints
app.get('/expenses', async (req: Request, res: Response) => {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM expenses', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.get('/expenses/:id', async (req: Request, res: Response) => {
  try {
    const row = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM expenses WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Expense not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.post('/expenses', async (req: Request, res: Response) => {
  const expense: Expense = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'INSERT INTO expenses (store_id, food_item_id, amount, date, category, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [expense.store_id, expense.food_item_id, expense.amount, expense.date, expense.category, expense.notes],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    res.status(201).json({ id: result.lastID });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.put('/expenses/:id', async (req: Request, res: Response) => {
  const expense: Expense = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'UPDATE expenses SET store_id = ?, food_item_id = ?, amount = ?, date = ?, category = ?, notes = ? WHERE id = ?',
        [expense.store_id, expense.food_item_id, expense.amount, expense.date, expense.category, expense.notes, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Expense updated successfully' });
    } else {
      res.status(404).json({ error: 'Expense not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.delete('/expenses/:id', async (req: Request, res: Response) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'DELETE FROM expenses WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Expense deleted successfully' });
    } else {
      res.status(404).json({ error: 'Expense not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

// Home Cooked Meals Endpoints
app.get('/home_cooked_meals', async (req: Request, res: Response) => {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM home_cooked_meals', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.get('/home_cooked_meals/:id', async (req: Request, res: Response) => {
  try {
    const row = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM home_cooked_meals WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Home cooked meal not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.post('/home_cooked_meals', async (req: Request, res: Response) => {
  const meal: HomeCookedMeal = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'INSERT INTO home_cooked_meals (recipe_id, name, date, notes, rating) VALUES (?, ?, ?, ?, ?)',
        [meal.recipe_id, meal.name, meal.date, meal.notes, meal.rating],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    res.status(201).json({ id: result.lastID });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.put('/home_cooked_meals/:id', async (req: Request, res: Response) => {
  const meal: HomeCookedMeal = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'UPDATE home_cooked_meals SET recipe_id = ?, name = ?, date = ?, notes = ?, rating = ? WHERE id = ?',
        [meal.recipe_id, meal.name, meal.date, meal.notes, meal.rating, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Home cooked meal updated successfully' });
    } else {
      res.status(404).json({ error: 'Home cooked meal not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.delete('/home_cooked_meals/:id', async (req: Request, res: Response) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'DELETE FROM home_cooked_meals WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Home cooked meal deleted successfully' });
    } else {
      res.status(404).json({ error: 'Home cooked meal not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

// Eating Out Expenses Endpoints
app.get('/eating_out_expenses', async (req: Request, res: Response) => {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM eating_out_expenses', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.get('/eating_out_expenses/:id', async (req: Request, res: Response) => {
  try {
    const row = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM eating_out_expenses WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Eating out expense not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.post('/eating_out_expenses', async (req: Request, res: Response) => {
  const expense: EatingOutExpense = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'INSERT INTO eating_out_expenses (store_id, amount, date, notes, rating) VALUES (?, ?, ?, ?, ?)',
        [expense.store_id, expense.amount, expense.date, expense.notes, expense.rating],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    res.status(201).json({ id: result.lastID });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.put('/eating_out_expenses/:id', async (req: Request, res: Response) => {
  const expense: EatingOutExpense = req.body;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'UPDATE eating_out_expenses SET store_id = ?, amount = ?, date = ?, notes = ?, rating = ? WHERE id = ?',
        [expense.store_id, expense.amount, expense.date, expense.notes, expense.rating, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Eating out expense updated successfully' });
    } else {
      res.status(404).json({ error: 'Eating out expense not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

app.delete('/eating_out_expenses/:id', async (req: Request, res: Response) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'DELETE FROM eating_out_expenses WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    if (result.changes > 0) {
      res.json({ message: 'Eating out expense deleted successfully' });
    } else {
      res.status(404).json({ error: 'Eating out expense not found' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

process.on('SIGINT', () => {
  db.close();
  process.exit();
});
