const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 5000;

// Database connection with retry logic
const connectWithRetry = () => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err.message);
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    } else {
      console.log('Connected to the database');
    }
  });

  return connection;
};

const connection = connectWithRetry();

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});