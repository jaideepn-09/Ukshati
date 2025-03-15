<<<<<<< HEAD
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [results] = await connection.execute(`
      SELECT 
        s.item_name AS productName,
        ispent.quantity_used AS quantity,
        ROUND(ispent.quantity_used * (s.price_pu/s.quantity), 2) AS price,
        ispent.remark
      FROM inventory_spent ispent
      JOIN stock s ON ispent.stock_id = s.stock_id
      ORDER BY ispent.spent_id DESC
    `);

    await connection.end();

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching inventory spent:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
=======
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [results] = await connection.execute(`
      SELECT 
        s.item_name AS productName,
        ispent.quantity_used AS quantity,
        ROUND(ispent.quantity_used * (s.price_pu / s.quantity), 2) AS price,
        ispent.remark
      FROM inventory_spent ispent
      JOIN stock s ON ispent.stock_id = s.stock_id
      ORDER BY ispent.spent_id DESC
    `);

    await connection.end();

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching inventory spent:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
>>>>>>> 4f69bf6b0fecdefac3520e275aaa476fc7f569e2
