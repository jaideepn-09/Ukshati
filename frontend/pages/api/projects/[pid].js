import { connectToDB } from "../../../lib/db";

export default async function handler(req, res) {
  const { pid } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  let db;
  try {
    db = await connectToDB();
    const [results] = await db.query("SELECT * FROM project WHERE pid = ?", [pid]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json(results[0]); // Return the single project
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) db.release();
  }
}
