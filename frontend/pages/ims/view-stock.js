"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiShoppingCart, FiX, FiArrowUp, FiArrowLeft, FiActivity, FiArrowRight } from "react-icons/fi";
import StarryBackground from "@/components/StarryBackground";

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center p-4 border-t border-gray-700">
      <div className="flex items-center bg-gray-900 rounded-full px-6 py-3 shadow-md">
        {/* Previous Button */}
        <button
          className={`text-gray-400 px-3 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {'<'}
        </button>

        {/* Page Numbers */}
        <div className="flex gap-6">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((num) => (
            <button
              key={num}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-lg ${
                currentPage === num ? 'bg-purple-600 text-white' : 'text-gray-300'
              }`}
              onClick={() => onPageChange(num)}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          className={`text-gray-400 px-3 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {'>'}
        </button>
      </div>
    </div>
  );
};

export default function ViewStock() {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch("/api/stocks");
        if (!response.ok) throw new Error("Failed to fetch stocks");
        const data = await response.json();
        setStocks(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  const filteredStocks = stocks.filter(stock => {
    const itemName = String(stock?.item_name || "").toLowerCase();
    const searchTerm = String(searchQuery || "").toLowerCase();
    return itemName.includes(searchTerm);
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStocks = filteredStocks.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="min-h-screen text-gray-100 relative">
      <StarryBackground />
      {/* Navbar */}
      <header className="ml-20 p-4 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/ims/home")}
            className="flex items-center gap-2 hover:text-blue-400 transition-colors pl-12"
          >
            <FiArrowLeft className="text-xl" />
            <span className="font-semibold">Back</span>
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-blue-400">Stock Management</h1>
          </div>

          <button
            onClick={() => router.push("/ims/inventory-spent")}
            className="flex items-center gap-2 hover:text-blue-400 transition-colors pr-12"
          >
            <FiActivity className="text-xl" />
            <span className="font-semibold">View Spent Inventory</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <section className="rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700 m-6 p-6 w-full max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-white">
            <FiShoppingCart className="text-blue-400" />
            Current Stock List
          </h2>
          <input
            type="text"
            placeholder="Search products..."
            className="p-3 bg-gray-700 rounded-lg w-full md:w-64 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead className="bg-gray-700">
              <tr>
                {["Product", "Category", "Quantity", "Unit Price"].map((header, i) => (
                  <th key={i} className="p-4 text-left min-w-[120px] text-white">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-400">
                    Loading stock data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              ) : paginatedStocks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-400">
                    No matching stock items found
                  </td>
                </tr>
              ) : (
                paginatedStocks.map((stock) => (
                  <tr 
                    key={stock.stock_id} 
                    className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors text-white"
                  >
                    <td className="p-4">{stock.item_name}</td>
                    <td className="p-4">{stock.category_name}</td>
                    <td className="p-4">{stock.quantity}</td>
                    <td className="p-4">₹{stock.price_pu}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* New Pagination Component */}
        {filteredStocks.length > itemsPerPage && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </section>

      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-900/50 rounded-xl border border-red-700">
          <div className="flex items-center gap-2 text-red-300">
            <FiX className="cursor-pointer" onClick={() => setError("")} />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
