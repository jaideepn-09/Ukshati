import { connectToDB } from "../../lib/db"; 

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const db = await connectToDB();

  try {
    console.log("Received spend request:", req.body);

    const { stockId, spentQty, remark } = req.body;

    if (!stockId || spentQty <= 0) {
      return res.status(400).json({ error: "Invalid stock ID or spent quantity" });
    }

    // Fetch current stock details
    const [stockResult] = await db.execute(
      "SELECT quantity, price_pu FROM stock WHERE stock_id = ?",
      [stockId]
    );

    if (stockResult.length === 0) {
      return res.status(404).json({ error: "Stock item not found" });
    }

    const { quantity, price_pu } = stockResult[0];

    if (spentQty > quantity) {
      return res.status(400).json({ error: "Not enough stock available" });
    }

    // Calculate total price deduction
    const pricePerItem = price_pu / quantity;
    const totalPriceDeduction = pricePerItem * spentQty;

    // Update stock quantity and price
    await db.execute(
      "UPDATE stock SET quantity = quantity - ?, price_pu = price_pu - ? WHERE stock_id = ?",
      [spentQty, totalPriceDeduction, stockId]
    );

    // Insert spent record into inventory_spent table
    await db.execute(
      "INSERT INTO inventory_spent (stock_id, quantity_used, remark) VALUES (?, ?, ?)",
      [stockId, spentQty, remark || "Stock spent"]
    );

    return res.status(200).json({ message: "Stock spent successfully" });

  } catch (error) {
    console.error("Error processing spend request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
