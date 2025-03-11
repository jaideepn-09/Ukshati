import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password, role } = req.body;

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Check if user exists with matching email and role
    const [rows] = await connection.execute(
      "SELECT * FROM employee WHERE email = ? AND role = ?",
      [email, role]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found or role mismatch" });
    }

    const user = rows[0];

    // Direct password check (No hashing)
    if (password !== user.password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Use JWT_SECRET from environment or fallback to a default (for testing only)
    const secret = process.env.JWT_SECRET || "defaultsecret";
    console.log("Signing token with secret:", secret); // DEBUG: Remove in production
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: "1h" }
    );

    // Optionally, set a cookie with the user's role (HttpOnly for security)
    res.setHeader("Set-Cookie", [`userRole=${user.role}; Path=/; HttpOnly`]);

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  } finally {
    connection.end();
  }
}
