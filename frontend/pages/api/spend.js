import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const db = await connectToDB();

  try {
    const { stockId, spentQty, used_for, recorded_by, remark } = req.body;
    console.log("Request Body:", req.body);

    // Validate request body
    const requiredFields = ['stockId', 'spentQty', 'used_for', 'recorded_by'];
    const missingFields = requiredFields.filter(field => req.body[field] === undefined);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
        code: "MISSING_FIELDS"
      });
    }

    if (isNaN(spentQty) || spentQty <= 0) {
      return res.status(400).json({
        error: "Invalid quantity - must be a positive number",
        code: "INVALID_QUANTITY"
      });
    }
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

    // Validate database entities
    const [stock] = await db.execute(
      "SELECT quantity FROM stock WHERE stock_id = ?",
      [stockId]
    );
    
    const [project] = await db.execute(
      "SELECT pid FROM project WHERE pid = ?",
      [used_for]
    );
    
    const [employee] = await db.execute(
      "SELECT id FROM employee WHERE id = ?",
      [recorded_by]
    );

    if (stock.length === 0) {
      return res.status(404).json({
        error: "Stock item not found",
        code: "STOCK_NOT_FOUND"
      });
    }

    if (project.length === 0) {
      return res.status(404).json({
        error: "Project not found",
        code: "PROJECT_NOT_FOUND"
      });
    }

    if (employee.length === 0) {
      return res.status(404).json({
        error: "Employee not found",
        code: "EMPLOYEE_NOT_FOUND"
      });
    }

    if (spentQty > stock[0].quantity) {
      return res.status(400).json({
        error: "Insufficient stock quantity",
        code: "INSUFFICIENT_STOCK",
        available: stock[0].quantity
      });
    }

    // Start transaction
    await db.beginTransaction();

    try {
      // Create spent record
      const [insertResult] = await db.execute(
        `INSERT INTO inventory_spent 
         (stock_id, quantity_used, used_for, recorded_by, remark)
         VALUES (?, ?, ?, ?, ?)`,
        [stockId, spentQty, used_for, recorded_by, remark || null]
      );

      await db.commit();
      return res.status(200).json({ 
        message: "Stock usage recorded successfully",
        spentId: insertResult.insertId
      });

    } catch (error) {
      await db.rollback();
      throw error;
    }

  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ 
      error: "Internal Server Error",
      code: "SERVER_ERROR",
      details: error.message 
    });
  } finally {
    if (db) db.release();
  }
}