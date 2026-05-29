const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Подключение к Supabase через переменные окружения
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Получить последние 50 сообщений
app.get('/messages', async (req, res) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(50);
  
  if (error) return res.status(500).json({ error: error.message });
  // Отправляем в хронологическом порядке (старые сверху)
  res.json(data.reverse());
});

// Отправить новое сообщение
app.post('/messages', async (req, res) => {
  const { nickname, text } = req.body;
  if (!text) return res.status(400).json({ error: 'Нет текста' });

  const { data, error } = await supabase
    .from('messages')
    .insert([{ nickname: nickname || 'Аноним', text, timestamp: Date.now() }])
    .select();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// Заглушка для /presence (если фронт её вызывает)
app.post('/presence', (req, res) => {
  res.json({ status: 'ok' });
});

// Проверка здоровья
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер на Supabase запущен на порту ${port}`);
});
