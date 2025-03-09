import mysql from "mysql2/promise";

export default async function handler(req, res) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    if (req.method === 'GET') {
      const [rows] = await connection.execute(
        "SELECT id, name, email, phone, role FROM employee"
      );
      res.status(200).json({ employees: rows });
    }

    if (req.method === 'POST') {
      const { name, email, phone, role, password } = req.body;
      const [result] = await connection.execute(
        "INSERT INTO employee (name, email, phone, role, password) VALUES (?, ?, ?, ?, ?)",
        [name, email, phone, role, password]
      );
      
      res.status(201).json({
        id: result.insertId,
        name,
        email,
        phone,
        role
      });
    }
  } catch (error) {
    console.error("Employee error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.end();
  }
}