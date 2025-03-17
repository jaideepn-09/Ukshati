import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  const db = await connectToDB();

  if (req.method === "POST") {
    try {
      console.log("Received POST request:", req.body);

      const { category_name, productName, quantity, price } = req.body;

      if (!category_name || !productName || !quantity || !price) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if stock already exists
      const [existingStock] = await db.execute(
        "SELECT stock_id, quantity, price_pu FROM stock WHERE category_id = ? AND item_name = ?",
        [categoryId, productName]
      );

      if (existingStock.length > 0) {
        const stock = existingStock[0]; // Get the first entry
        const stockId = stock.stock_id;
        const oldQuantity = parseInt(stock.quantity);
        const oldPricePerUnit = parseFloat(stock.price_pu);
        const newQuantity = oldQuantity + parseInt(quantity);
      
        // Compute the new price per unit (weighted average)
        const newPricePerUnit = ((oldPricePerUnit * oldQuantity) + (parseFloat(price) * parseInt(quantity))) / newQuantity;

        console.log(`Updating Stock ID: ${stockId}, Old Price: ${oldPricePerUnit}, New Price: ${newPricePerUnit}`);
      
        // Update stock with new quantity & price
        await db.execute(
          "UPDATE stock SET quantity = ?, price_pu = ? WHERE stock_id = ?",
          [newQuantity, newPricePerUnit+oldPricePerUnit, stockId]
        );
      
        // Fetch updated stock details
        const [updatedStock] = await db.execute("SELECT * FROM stock WHERE stock_id = ?", [stockId]);
      
        return res.status(200).json({ message: "Stock updated successfully", stock: updatedStock[0] });
      } else {
        // Insert new stock
        const [result] = await db.execute(
          "INSERT INTO stock (item_name, category_id, quantity, price_pu) VALUES (?, ?, ?, ?)",
          [productName, categoryId, quantity, price]
        );

        return res.status(201).json({ message: "Stock added successfully", stockId: result.insertId });
      }
    } catch (error) {
      console.error("Error adding stock:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === "GET") {
    try {
      const [stocks] = await db.execute("SELECT * FROM stock ORDER BY stock_id DESC");
      return res.status(200).json(stocks);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}