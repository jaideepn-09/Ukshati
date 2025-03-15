// pages/api/last-quote-id.js

import { connectToDB } from '../../lib/db';  // Adjust the path to where your connectToDB function is located

// API handler to get the last quote ID and increment it
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Connect to the database
      const connection = await connectToDB();

      // Query to get the last quote ID
      const [rows] = await connection.execute('SELECT MAX(quote_id) AS last_quote_id FROM quotesdata');

      // Close the connection after the query
      await connection.end();

      // Get the last quote ID or set it to 0 if no quotes exist
      const lastQuoteId = rows[0].last_quote_id || 0;

      // Calculate the next quote ID
      const nextQuoteId = lastQuoteId + 1;

      // Return the next quote ID as the response
      res.status(200).json({ nextQuoteId });
    } catch (err) {
      console.error('Error fetching last quote ID:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
