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
});
