import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    
      const db = await connectToDB(); 
      const [results] = await db.query("SELECT pid FROM project where status != 'completed' "); 
      res.status(200).json(results); 
    
  } else {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` }); 
  }
}
