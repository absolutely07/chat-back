const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Открываем базу данных (создаст файл kv-store.db)
const db = new sqlite3.Database('kv-store.db');

// Создаём таблицу
db.run(`
  CREATE TABLE IF NOT EXISTS kv_store (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`);

// API endpoints
app.get('/get/:key', (req, res) => {
  db.get('SELECT value FROM kv_store WHERE key = ?', [req.params.key], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ value: row ? JSON.parse(row.value) : null });
  });
});

app.post('/set', (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: 'Key is required' });
  
  const valueString = JSON.stringify(value ?? null);
  db.run('INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)', [key, valueString], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/del/:key', (req, res) => {
  db.run('DELETE FROM kv_store WHERE key = ?', [req.params.key], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(port, () => {
  console.log(`✅ KV сервер запущен на порту ${port}`);
});
