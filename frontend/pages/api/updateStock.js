import { connectToDB } from "../../lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { stockId, quantity, price } = req.body;

  // Ensure Authorization header exists and extract token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header provided" });
  }
  const token = authHeader.split(" ")[1];

  // Use JWT_SECRET from environment or fallback (for testing only)
  const secret = process.env.JWT_SECRET || "defaultsecret";
  console.log("Verifying token with secret:", secret); // DEBUG: Remove in production

  try {
    // Verify JWT and check admin role
    const decoded = jwt.verify(token, secret);
    console.log("Decoded token:", decoded); // DEBUG: Remove in production
    if (decoded.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
  } catch (err) {
    console.error("JWT verification error:", err);
  }

  const db = await connectToDB();

  try {
    // Check if the stock exists
    const [existingStock] = await db.execute(
      "SELECT stock_id, quantity, price_pu FROM stock WHERE stock_id = ?",
      [stockId]
    );

    if (existingStock.length === 0) {
      return res.status(404).json({ message: "Stock not found" });
    }
    const stock = existingStock[0];
    const newQuantity = parseInt(stock.quantity) + parseInt(quantity);
    // Update bulk price: add the new bulk price to the existing bulk price
    const newPrice = parseFloat(stock.price_pu) + parseFloat(price);

    await db.execute(
      "UPDATE stock SET quantity = ?, price_pu = ? WHERE stock_id = ?",
      [newQuantity, newPrice, stockId]
    );

    // Fetch updated stock details along with category name
    const [updatedStock] = await db.execute(
      `SELECT s.*, c.category_name 
       FROM stock s 
       JOIN category c ON s.category_id = c.category_id 
       WHERE s.stock_id = ?`,
      [stockId]
    );
    return res.status(200).json({ message: "Stock updated successfully", stock: updatedStock[0] });
  } catch (error) {
    console.error("Error updating stock:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
