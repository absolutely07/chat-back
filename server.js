const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Подключение к Supabase
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
  res.json(data.reverse());
});

// Отправить сообщение
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

// Очистить все сообщения (команда /del)
app.post('/clear-all', async (req, res) => {
  const { error } = await supabase.from('messages').delete().neq('id', 0);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, message: 'Чат очищен' });
});

// Заглушка для /presence (если фронт её вызывает)
app.post('/presence', (req, res) => {
  res.json({ status: 'ok' });
});

// Проверка здоровья
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Сервер на Supabase запущен на порту ${port}`);
});
