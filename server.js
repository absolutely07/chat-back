const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация базы данных
const db = new Database('kv-store.db');

// Создаём таблицу
db.exec(`
  CREATE TABLE IF NOT EXISTS kv_store (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Подготовленные запросы
const setValue = db.prepare(`
  INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)
`);

const getValue = db.prepare(`
  SELECT value FROM kv_store WHERE key = ?
`);

const deleteValue = db.prepare(`
  DELETE FROM kv_store WHERE key = ?
`);

// ========== API ==========

// Получить значение
app.get('/get/:key', (req, res) => {
  const result = getValue.get(req.params.key);
  const value = result ? JSON.parse(result.value) : null;
  res.json({ value });
});

// Установить значение
app.post('/set', (req, res) => {
  const { key, value } = req.body;
  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }
  const valueString = JSON.stringify(value ?? null);
  setValue.run(key, valueString);
  res.json({ success: true });
});

// Удалить ключ
app.delete('/del/:key', (req, res) => {
  deleteValue.run(req.params.key);
  res.json({ success: true });
});

// Проверка здоровья
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Запуск
app.listen(port, () => {
  console.log(`✅ KV сервер запущен на порту ${port}`);
});
