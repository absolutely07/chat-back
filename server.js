const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// База данных
const db = new sqlite3.Database('chat.db');

// Создаём таблицы
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT,
    text TEXT NOT NULL,
    timestamp INTEGER
  )
`);

// Получить последние 50 сообщений
app.get('/messages', (req, res) => {
  db.all('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.reverse());
  });
});

// Отправить сообщение
app.post('/messages', (req, res) => {
  const { nickname, text } = req.body;
  if (!text) return res.status(400).json({ error: 'Нет текста' });

  db.run(
    'INSERT INTO messages (nickname, text, timestamp) VALUES (?, ?, ?)',
    [nickname || 'Аноним', text, Date.now()],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, success: true });
    }
  );
});

// Проверка здоровья
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Сервер чата запущен на порту ${port}`);
});
