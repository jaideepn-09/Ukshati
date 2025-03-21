import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  let connection;
  try {
    // Get a connection from the pool
    connection = await connectToDB();

    if (req.method === "GET") {
      const [projects] = await connection.query(`
        SELECT p.*, c.cname AS customer_name 
        FROM project p
        LEFT JOIN customer c ON p.cid = c.cid
        ORDER BY p.start_date DESC
      `);
      return res.status(200).json(projects);
    }

    if (req.method === "POST") {
      const { pname, start_date, end_date, status, cid } = req.body;

      if (!pname || !start_date || !end_date || !status || !cid) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const [result] = await connection.query(
        `INSERT INTO project (pname, start_date, end_date, status, cid) 
         VALUES (?, ?, ?, ?, ?)`,
        [pname, start_date, end_date, status, cid]
      );

      return res.status(201).json({
        pid: result.insertId,
        pname,
        start_date,
        end_date,
        status,
        cid,
      });
    }

    if (req.method === "PUT") {
      const { pid, pname, start_date, end_date, status, cid } = req.body;

      if (!pid || !pname || !start_date || !end_date || !status || !cid) {
        return res.status(400).json({ error: "All fields are required" });
      }

      await connection.query(
        `UPDATE project 
         SET pname = ?, start_date = ?, end_date = ?, status = ?, cid = ?
         WHERE pid = ?`,
        [pname, start_date, end_date, status, cid, pid]
      );

      return res.status(200).json({
        pid,
        pname,
        start_date,
        end_date,
        status,
        cid,
      });
    }

    if (req.method === "DELETE") {
      const { pid } = req.query;

      if (!pid) {
        return res.status(400).json({ error: "Project ID is required" });
      }

      await connection.query("DELETE FROM project WHERE pid = ?", [pid]);
      return res.status(204).end();
    }

    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: error.message || "Database operation failed" });
  } finally {
    // Release the connection back to the pool
    if (connection) connection.release();
  }
}
