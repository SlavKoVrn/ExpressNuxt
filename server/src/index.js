const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;
const { generateItems } = require('./items');

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();

  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Capture response end
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`--> ${res.statusCode}, Duration: ${duration}ms`);
  });

  next(); // Don't forget to call next()
});

app.get('/items', (req, res) => {
  const { search = '', page = 1, 'per-page': perPage = 20 } = req.query;

  let data = generateItems();
  if (search) {
    data = data.filter(item => item.text.includes(search));
  }

  const total = data.length;
  const start = (Number(page) - 1) * Number(perPage);
  const end = start + Number(perPage);
  const result = data.slice(start, end);

  res.json({
    items: result,
    total,
    page: Number(page),
    perPage: Number(perPage)
  });
});

app.listen(PORT, () => console.log(`Express server running on http://localhost:${PORT}`));
