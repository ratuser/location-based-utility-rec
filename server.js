require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('Connected to MySQL');
});

app.post('/submit', (req, res) => {
  const { name, email, message } = req.body;
  console.log('📨 Form Data Received:', { name, email, message });

  const query = 'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)';
  db.execute(query, [name, email, message], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

app.post('/save-places', (req, res) => {
  const places = req.body;

  if (!Array.isArray(places)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  const query = `
    INSERT INTO places (name, category, address, lat, lon)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      name = VALUES(name)
  `;

  const values = places.map(place => [
    place.name || '',
    place.category || '',
    place.address || '',
    place.lat || 0,
    place.lon || 0
  ]);

  db.query(query, [values], (err, result) => {
    if (err) {
      console.error('Error inserting places:', err);
      return res.status(500).json({ success: false, error: err });
    }
    res.json({ success: true, inserted: result.affectedRows });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
