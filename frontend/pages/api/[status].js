import mysql from "mysql2/promise";

export default async function handler(req, res) {
  try {
    const { status } = req.query;
    console.log(`Fetching projects with status: ${status}`);

    // Connect to MySQL
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // SQL Query with amount and comments
    const query = `
      SELECT 
        p.pid, p.pname, p.cname, 
        DATE_FORMAT(p.start_date, '%d-%m-%Y') AS start_date,
        DATE_FORMAT(p.end_date, '%d-%m-%Y') AS end_date,
        COALESCE(SUM(e.Amount), 0) AS total_amount,
        GROUP_CONCAT(e.Comments SEPARATOR '; ') AS comments
      FROM project p
      LEFT JOIN add_expenses e ON p.pid = e.pid
      WHERE p.status = ?
      GROUP BY p.pid, p.pname, p.cname, p.start_date, p.end_date
      ORDER BY p.start_date, p.end_date;
    `;

    const [results] = await db.execute(query, [status]);
    console.log(`Projects fetched for status "${status}":`, results);

    db.end();
    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Database Error:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
}
