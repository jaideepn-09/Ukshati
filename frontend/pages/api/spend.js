import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const db = await connectToDB();

  try {
    const { stockId, spentQty, used_for, recorded_by, location, remark } = req.body;
    console.log("Request Body:", req.body);

    // Validate request body
    const requiredFields = ["stockId", "spentQty", "used_for", "recorded_by", "location"];
    const missingFields = requiredFields.filter(
      (field) => req.body[field] === undefined
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
        code: "MISSING_FIELDS",
      });
    }

    if (isNaN(spentQty) || spentQty <= 0) {
      return res.status(400).json({
        error: "Invalid quantity - must be a positive number",
        code: "INVALID_QUANTITY",
      });
    }

    // Fetch stock details
    const [stockResult] = await db.execute(
      "SELECT quantity, price_pu, item_name FROM stock WHERE stock_id = ?",
      [stockId]
    );

    if (stockResult.length === 0) {
      return res.status(404).json({ error: "Stock item not found" });
    }

    const { quantity, price_pu, item_name } = stockResult[0];

    if (spentQty > quantity) {
      return res.status(400).json({
        error: "Not enough stock available",
        available: quantity,
        code: "INSUFFICIENT_STOCK",
      });
    }

    // Validate database entities
    const [project] = await db.execute("SELECT pid, pname FROM project WHERE pid = ?", [
      used_for,
    ]);

    const [employee] = await db.execute(
      "SELECT id, name FROM employee WHERE id = ?",
      [recorded_by]
    );

    if (project.length === 0) {
      return res.status(404).json({
        error: "Project not found",
        code: "PROJECT_NOT_FOUND",
      });
    }

    if (employee.length === 0) {
      return res.status(404).json({
        error: "Employee not found",
        code: "EMPLOYEE_NOT_FOUND",
      });
    }

    const projectName = project[0].pname;
    const employeeName = employee[0].name;

    // Calculate total price deduction
    const totalPriceDeduction = spentQty * price_pu;

    // Start transaction
    await db.beginTransaction();

    try {
      // Create spent record with timestamp
      const [insertResult] = await db.execute(
        `INSERT INTO inventory_spent 
         (stock_id, quantity_used, used_for, recorded_by, location, remark, spent_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [stockId, spentQty, used_for, recorded_by, location, remark || null]
      );

      // Log the transaction with all details
      await db.execute(
        `INSERT INTO stock_transactions 
         (stock_id, transaction_type, quantity_change, previous_quantity, 
          new_quantity, price_pu, project_id, employee_id, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stockId,
          'SPEND',
          -spentQty,
          quantity,
          quantity - spentQty,
          price_pu,
          used_for,
          recorded_by,
          `Stock spent by ${employeeName} for project ${projectName} at ${location}. ${remark || ''}`
        ]
      );

      await db.commit();
      
      return res.status(200).json({
        message: "Stock usage recorded successfully",
        spentId: insertResult.insertId,
        timestamp: new Date().toISOString(),
        remainingStock: quantity - spentQty,
        itemName: item_name,
        projectName,
        employeeName
      });
    } catch (error) {
      await db.rollback();
      console.error("Transaction Error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      code: "SERVER_ERROR",
      details: error.message,
    });
  } finally {
    if (db) db.release();
  }
}