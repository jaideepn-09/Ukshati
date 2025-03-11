"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import Next.js router for navigation
import StarryBackground from "@/components/StarryBackground";

export default function StockDetails() {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [spendQuantity, setSpendQuantity] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchStocks();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchStocks = async () => {
    try {
      const response = await fetch("/api/stocks");
      const data = await response.json();
      setStocks(data.sort((a, b) => b.stock_id - a.stock_id)); // Sort by most recent
    } catch (error) {
      console.error("Error fetching stocks:", error);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!categoryId || !productName || !quantity || !price) return;
  
    try {
      const response = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, productName, quantity, price }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Stock updated successfully:", data);
  
        // **Ensure state update after adding stock**
        fetchStocks();
  
        // Reset input fields
        setCategoryId("");
        setProductName("");
        setQuantity("");
        setPrice("");
      } else {
        console.error("Failed to add stock");
      }
    } catch (error) {
      console.error("Error adding stock:", error);
    }
  };
  

  const handleSpendStock = async (id) => {
    const spentQty = parseInt(spendQuantity[id]) || 0;
    if (spentQty <= 0) return;

    try {
      const response = await fetch("/api/spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockId: id, spentQty, remark: "Used for project" }),
      });

      if (response.ok) {
        fetchStocks();
        setSpendQuantity({ ...spendQuantity, [id]: "" });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error spending stock:", error);
    }
  };

  // Filter stocks based on search query
  const filteredStocks = stocks.filter(stock =>
    stock.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-cover bg-center p-6">
      <StarryBackground/>
      
      {/* Back Button */}
      <button onClick={() => router.push("/ims/home")} className="absolute top-5 left-5 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6 text-black">Stock Management</h1>

      {/* Add Stock Form */}
      <form onSubmit={handleAddStock} className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg mb-10 bg-opacity-90">
        <h2 className="text-2xl font-semibold mb-4 text-black">Add Stock</h2>

        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full p-3 border border-gray-300 rounded text-black" required>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>{category.category_name}</option>
            ))}
          </select>
        </div>

        <div className="mb-5 text-black">
          <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
          <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full p-3 border border-gray-300 rounded" required />
        </div>

        <div className="mb-5 text-black">
          <label className="block text-gray-700 text-sm font-bold mb-2">Quantity</label>
          <input type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full p-3 border border-gray-300 rounded" required />
        </div>

        <div className="mb-5 text-black">
          <label className="block text-gray-700 text-sm font-bold mb-2">Total Price</label>
          <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-3 border border-gray-300 rounded" required />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded text-lg hover:bg-blue-700">
          Add Stock
        </button>
      </form>

      {/* Stock List with Search */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl bg-opacity-90 text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-black">Stock List</h2>
          <input
            type="text"
            placeholder="Search by Product Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded w-64"
          />
        </div>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Product</th>
              <th className="border border-gray-300 p-2">Category</th>
              <th className="border border-gray-300 p-2">Quantity</th>
              <th className="border border-gray-300 p-2">Price</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => (
              <tr key={stock.stock_id}>
                <td className="border border-gray-300 p-2">{stock.item_name}</td>
                <td className="border border-gray-300 p-2">{stock.category_name}</td>
                <td className="border border-gray-300 p-2">{stock.quantity}</td>
                <td className="border border-gray-300 p-2">₹{stock.price_pu}</td>
                <td className="border border-gray-300 p-2">
                  <input type="number" min="1" value={spendQuantity[stock.stock_id] || ""}
                    onChange={(e) => setSpendQuantity({ ...spendQuantity, [stock.stock_id]: e.target.value })}
                    className="p-2 border border-gray-300 w-16"
                  />
                  <button onClick={() => handleSpendStock(stock.stock_id)} className="ml-2 bg-red-600 text-white p-2 rounded">
                    Spend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={() => router.push("/ims/inventory-spent")} className="mt-6 w-full bg-green-600 text-white p-3 rounded text-lg hover:bg-green-700">
          View Inventory Spent
        </button>
      </div>
    </div>
  );
}
