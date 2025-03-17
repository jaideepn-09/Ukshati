"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import StarryBackground from "@/components/StarryBackground";
import { FiUploadCloud, FiFilePlus, FiShoppingCart, FiX, FiArrowLeft, FiCheck, FiArrowUp, FiActivity, FiSearch } from "react-icons/fi";
import ScrollToTopButton from "@/components/scrollup";

export default function StockDetails() {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ categoryId: "", productName: "", quantity: "", price: "" });
  const [errors, setErrors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [spendQty, setSpendQty] = useState({});


  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, stockRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/stocks")
        ]);
        
        const [categories, stocks] = await Promise.all([
          catRes.json(),
          stockRes.json()
        ]);
        
        setCategories(categories);
        setStocks(stocks.sort((a, b) => b.stock_id - a.stock_id));
      } catch (error) {
        setErrors(["Failed to load initial data"]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSpendStock = async (stockId) => {
    if (!spendQty[stockId] || spendQty[stockId] <= 0) return;

    try {
      const response = await fetch("/api/spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockId, spentQty: spendQty[stockId] })
      });

      if (!response.ok) throw new Error("Failed to update stock");
      
      const updatedStock = await response.json();
      setStocks(prev => prev.map(stock => 
        stock.stock_id === stockId ? updatedStock : stock
      ));
      setSpendQty(prev => ({ ...prev, [stockId]: "" }));
    } catch (error) {
      setErrors([error.message]);
    }
    window.location.reload();
  };

  // Filtered stocks
  const filteredStocks = stocks.filter(stock => {
    const itemName = String(stock?.item_name || '').toLowerCase();
    const searchTerm = String(searchQuery || '').toLowerCase();
    return itemName.includes(searchTerm);
  });

  return (
    <div className="min-h-screen text-gray-100">
      <StarryBackground />
      <ScrollToTopButton/>
      <header className="ml-8 p-4 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/ims/home")}
            className="flex items-center gap-2 hover:text-blue-400 transition-colors"
          >
            <FiArrowLeft className="text-xl" />
            <span className="font-semibold">Back</span>
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-blue-400">Stock Management</h1>
          </div>

          <button
            onClick={() => router.push("/ims/inventory-spent")}
            className="flex items-center gap-2 hover:text-blue-400 transition-colors mr-8"
          >
            <FiActivity className="text-xl" />
            <span className="font-semibold">View Spent Inventory</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-8">
        <section className="rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700">
          <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiShoppingCart className="text-blue-400" />
              Current Stock List
            </h2>
            <div className="flex items-center space-x-2">
            <FiSearch className="text-blue-400" />
    <input
      type="text"
      placeholder="Search products..."
      className="p-2 bg-gray-700 rounded-lg w-full md:w-64"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  {["Product", "Category", "Quantity", "Unit Price", "Actions"].map((header, i) => (
                    <th key={i} className="p-3 text-left text-sm font-semibold min-w-[150px]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400">
                      Loading stock data...
                    </td>
                  </tr>
                ) : filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400">
                      No matching stock items found
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => (
                    <tr 
                      key={stock.stock_id} 
                      className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors text-white"
                    >
                      <td className="p-3">{stock.item_name}</td>
                      <td className="p-3">{stock.category_id}</td>
                      <td className="p-3">{stock.quantity}</td>
                      <td className="p-3">₹{stock.price_pu}</td>
                      <td className="p-3">
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            min="1"
                            max={stock.quantity}
                            className="w-20 p-2 bg-gray-800 rounded"
                            value={spendQty[stock.stock_id] || ""}
                            onChange={(e) => setSpendQty({
                              ...spendQty,
                              [stock.stock_id]: e.target.value
                            })}
                          />
                          <button
  onClick={() => handleSpendStock(stock.stock_id)}
  className="group relative px-4 h-[35px] w-[100px] bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-300 " data-tooltip={`Spend ${spendQty[stock.stock_id] || 0} units`}>
  <div className="relative w-full h-full">
    {/* Text - visible by default */}
    <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0">
      <span className="text-sm text-white">Spend</span>
    </div>
    
    {/* Icon - hidden by default */}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-white"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"/>
      </svg>
    </div>
  </div>
  {/* Tooltip */}
  <div className="absolute hidden group-hover:block -top-[30px] left-1/2 -translate-x-1/2 w-[130px] px-2 py-1 text-xs bg-gray-700 text-white rounded-md after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-gray-700">
    {`Spend ${spendQty[stock.stock_id] || 0} units`}
  </div>
</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {errors.length > 0 && (
          <div className="p-4 bg-red-900/50 rounded-xl border border-red-700">
            {errors.map((error, i) => (
              <div key={i} className="flex items-center gap-2 text-red-300">
                <FiX className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}