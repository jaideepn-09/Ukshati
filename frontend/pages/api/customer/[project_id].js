import { connectToDB } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const connection = await connectToDB();
    
    const { project_id } = req.query; // Extract project_id from query string
    const query = `
      SELECT c.cname AS customer_name, c.cadd AS address,c.cphone
      FROM customer c
      JOIN project p ON c.cid = p.cid
      WHERE p.pid = ?;
    `;

    // Execute the query
    const [results] = await connection.query(query, [project_id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Customer not found." });
    }
    
    res.status(200).json(results[0]);

    // Close the connection
    connection.end();
  } else {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
