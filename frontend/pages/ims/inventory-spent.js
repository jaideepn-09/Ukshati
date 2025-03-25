"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiArrowLeft, FiActivity, FiSearch } from "react-icons/fi";
import StarryBackground from "@/components/StarryBackground";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center p-4 border-t border-gray-700">
      <div className="flex items-center bg-gray-900 rounded-full px-6 py-3 shadow-md">
        <button
          className={`text-gray-400 px-3 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {"<"}
        </button>

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
  const router = useRouter();
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
    const searchString = `${stock.item_name} ${stock.project_name} ${stock.employee_name}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

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

      <header className="p-4 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative px-6">
          <div className="absolute left-6">
            <button
              onClick={() => router.push("/ims/home")}
              className="flex items-center gap-2 hover:text-blue-400 transition-colors"
            >
              <FiArrowLeft className="text-xl" />
              <span className="font-semibold">Back</span>
            </button>
          </div>

          <h1 className="text-2xl font-bold text-blue-400 mx-auto">
            Spent Inventory
          </h1>

          <div className="absolute right-6">
            <button
              onClick={() => router.push("/ims/view-stock")}
              className="flex items-center gap-2 hover:text-blue-400 transition-colors"
            >
              <FiActivity className="text-xl" />
              <span className="font-semibold">View Stocks</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-8">
        <section className="rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-white">Spent Stock Records</h2>
              <div className="flex items-center space-x-2 w-full md:w-96">
                <FiSearch className="text-blue-400" />
                <input
                  type="text"
                  placeholder="Search products, projects, or employees..."
                  className="p-2 bg-gray-700 rounded-lg w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-400">Loading spent stock data...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-400">Error: {error}</div>
            ) : paginatedStocks.length === 0 ? (
              <div className="p-6 text-center text-gray-400">No matching records found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-4 text-left min-w-[220px]">Product</th>
                      <th className="p-4 text-left min-w-[120px]">Quantity</th>
                      <th className="p-4 text-left min-w-[150px]">Total Cost</th>
                      <th className="p-4 text-left min-w-[200px]">Project</th>
                      <th className="p-4 text-left min-w-[200px]">Recorded By</th>
                      <th className="p-4 text-left min-w-[300px]">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStocks.map((spent, index) => (
                      <tr
                        key={index}
                        className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="p-4 font-medium">{spent.item_name}</td>
                        <td className="p-4">{spent.quantity_used}</td>
                        <td className="p-4 text-blue-400">₹{spent.total_price}</td>
                        <td className="p-4">
                          <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                            {spent.project_name || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4">{spent.employee_name || 'Unknown'}</td>
                        <td className="p-4 text-gray-400">
                          {spent.remark || (
                            <span className="italic text-gray-500">No remarks provided</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredStocks.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}