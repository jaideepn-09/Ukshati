import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection;
  try {
    connection = await connectToDB();
    await connection.beginTransaction();

    // 1. Get categories
    const [categories] = await connection.query(
      "SELECT category_id, LOWER(category_name) AS lower_name, category_name FROM category"
    );
    
    if (!Array.isArray(categories) || categories.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: "No categories found in database" });
    }

    const categoryMap = new Map(
      categories.map(cat => [cat.lower_name, cat.category_id])
    );

    // 2. Process entries
    const errors = [];
    const processedStocks = [];
    
    for (const [index, entry] of (req.body.stocks || []).entries()) {
      try {
        // Validate entry
        if (!entry?.categoryName || !entry?.productName) {
          throw new Error("Missing required fields");
        }

        const categoryId = categoryMap.get(entry.categoryName.toLowerCase().trim());
        if (!categoryId) {
          throw new Error(`Category '${entry.categoryName}' not found`);
        }

        // Validate numbers
        const quantity = Number(entry.quantity) || 0;
        const price = Number(entry.price) || 0;
        if (quantity <= 0) throw new Error("Invalid quantity");
        if (price <= 0) throw new Error("Invalid price");

        // Database operations
        const [existing] = await connection.query(
          `SELECT stock_id, quantity, price_pu 
           FROM stock 
           WHERE category_id = ? 
           AND item_name = ?`,
          [categoryId, entry.productName.trim()]
        );

        if (existing?.length > 0) {
          const current = existing[0];
          const newQty = current.quantity + quantity;
          // Changed calculation: add the bulk price directly instead of multiplying by quantity
          const newBulkPrice = Number(current.price_pu) + price;

          await connection.query(
            `UPDATE stock 
             SET quantity = ?, price_pu = ?
             WHERE stock_id = ?`,
            [newQty, newBulkPrice, current.stock_id]
          );
        } else {
          await connection.query(
            `INSERT INTO stock 
             (item_name, category_id, quantity, price_pu)
             VALUES (?, ?, ?, ?)`,
            [entry.productName.trim(), categoryId, quantity, price]
          );
        }

        processedStocks.push(entry);

      } catch (error) {
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    }

    await connection.commit();

    // Get updated stock list
    const [updatedStocks] = await connection.query(`
      SELECT s.*, c.category_name 
      FROM stock s
      JOIN category c ON s.category_id = c.category_id
      ORDER BY s.stock_id DESC
    `);

    const safeStocks = (Array.isArray(updatedStocks) ? updatedStocks : []).map(stock => ({
      ...stock,
      price_pu: Number(stock.price_pu) || 0
    }));

    return res.status(200).json({
      success: true,
      stocks: safeStocks,
      processed: processedStocks.length,
      errors
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Server error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  } finally {
    if (connection) connection.end();
  }
}
