import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  let db;
  try {
    db = await connectToDB();
    const [results] = await db.query("SELECT pid FROM project WHERE status != 'completed'");

    res.status(200).json(results.length > 0 ? results : []);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) db.release(); // Release the connection
  }
}
