"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiArrowLeft, FiActivity } from "react-icons/fi";
import StarryBackground from "@/components/StarryBackground";

// Pagination Component (same style as in ViewStock)
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center p-4 border-t border-gray-700">
      <div className="flex items-center bg-gray-900 rounded-full px-6 py-3 shadow-md">
        {/* Previous Button */}
        <button
          className={`text-gray-400 px-3 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {"<"}
        </button>

        {/* Page Numbers */}
        <div className="flex gap-6">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((num) => (
            <button
              key={num}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-lg ${
                currentPage === num ? "bg-purple-600 text-white" : "text-gray-300"
              }`}
              onClick={() => onPageChange(num)}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          className={`text-gray-400 px-3 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default function InventorySpent() {
  const [router, setRouter] = useState(useRouter());
  const [spentStocks, setSpentStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchSpentStocks = async () => {
      try {
        const response = await fetch("/api/inventory_spent");
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setSpentStocks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSpentStocks();
  }, []);

  const filteredStocks = spentStocks.filter((stock) => {
    const name = String(stock?.productName || "").toLowerCase();
    const term = String(searchQuery || "").toLowerCase();
    return name.includes(term);
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

      {/* Header */}
      <header className="ml-6 p-4 backdrop-blur-sm shadow-lg sticky top-0 z-10">
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
                  onClick={() => router.push("/ims/view-stock")}
                  className="flex items-center gap-2 hover:text-blue-400 transition-colors pr-12"
                >
                  <FiActivity className="text-xl" />
                  <span className="font-semibold">View Stocks</span>
                </button>
              </div>
            </header>

      {/* Main Content */}
      <section className="rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700 m-6 p-6 w-full max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-white">Spent Stock List</h2>
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

        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading spent stock data...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-400">Error: {error}</div>
        ) : paginatedStocks.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No spent stock available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base border-collapse">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-4 text-left min-w-[120px] text-white">Product</th>
                  <th className="p-4 text-left min-w-[120px] text-white">Quantity</th>
                  <th className="p-4 text-left min-w-[120px] text-white">Spent Cost</th>
                  <th className="p-4 text-left min-w-[120px] text-white">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStocks.map((spent, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors text-white"
                  >
                    <td className="p-4">{spent.productName}</td>
                    <td className="p-4">{spent.quantity}</td>
                    <td className="p-4">₹{spent.price}</td>
                    <td className="p-4">{spent.remark || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredStocks.length > itemsPerPage && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </section>
    </div>
  );
}
