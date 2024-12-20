require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace 'root' if you have a different username
  password: '12345678', // Replace with your MySQL password
  database: 'weather_app', // Ensure this matches your database name
});


db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database');
});

// Sign-Up Route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
    if (err) return res.status(500).send('Error checking email');
    if (result.length > 0) return res.status(400).send('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).send('Error signing up');
        res.status(201).send('User signed up successfully');
      }
    );
  });
});

// Log-In Route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
    if (err) return res.status(500).send('Error fetching user');
    if (result.length === 0) return res.status(400).send('User not found');

    const isMatch = await bcrypt.compare(password, result[0].password);
    if (!isMatch) return res.status(400).send('Invalid credentials');

    res.status(200).send('User logged in successfully');
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
