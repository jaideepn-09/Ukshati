"use client";
import { useEffect, useState } from "react";
import StarryBackground from "@/components/StarryBackground";
import { FiArrowLeft, FiSearch, FiEdit, FiX, FiActivity } from "react-icons/fi";
import { useRouter } from "next/navigation";

// Custom Pagination Component
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

export default function StockUpdate() {
  const router = useRouter();
  const [userRole, setUserRole] = useState(""); // Changed from "admin" to empty string
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust as necessary

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "";
    console.log("User role:", role);
    setUserRole(role);
    fetchStocks();
  }, []);

  useEffect(() => {
    const filtered = stocks.filter((stock) =>
      stock.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStocks(filtered);
  }, [stocks, searchTerm]);

  const fetchStocks = async () => {
    try {
      const token = localStorage.getItem("token"); // Retrieve token
      if (!token) throw new Error("No token found");

      const response = await fetch("/api/stocks", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch stocks");
      const data = await response.json();
      setStocks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateStock = async () => {
    // Case-insensitive role check
    if (userRole?.toLowerCase() !== "admin") { 
      alert("Admin access required to update stock");
      return;
    }

    try {
      const quantity = prompt("Enter quantity to add:");
      if (!quantity || isNaN(quantity)) 
        throw new Error("Invalid quantity");

      const price = prompt("Enter price to add:");
      if (!price || isNaN(price)) 
        throw new Error("Invalid price");

      // Retrieve the token from localStorage
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch("/api/updateStock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Send token in the Authorization header
        },
        body: JSON.stringify({
          stockId: currentStock.stock_id,
          quantity: Number(quantity),
          price: parseFloat(price)
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      alert("Stock updated successfully!");
      fetchStocks(); // Refresh stock list
      setIsModalOpen(false); // Close modal
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const openModal = (stock) => {
    setCurrentStock(stock);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStocks = filteredStocks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);

  return (
    <div className="min-h-screen text-gray-100">
      <StarryBackground />
      
      {/* Header */}
      <header className="ml-6 p-4 backdrop-blur-sm shadow-lg sticky top-0 z-10">
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
            onClick={() => router.push("/ims/view-stock")}
            className="flex mr-8 items-center gap-2 hover:text-blue-400 transition-colors"
          >
            <FiActivity className="text-xl" />
            <span className="font-semibold">View Inventory</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 space-y-8">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Stock List */}
        <section className="rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiEdit className="text-blue-400" />
              Update Stock
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  {["Product", "Category", "Quantity", "Price", "Actions"].map((header, i) => (
                    <th
                      key={i}
                      className={`p-3 text-sm font-semibold ${
                        header === "Product" ? "text-left" : "text-center"
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {paginatedStocks.map((stock) => (
                  <tr
                    key={stock.stock_id}
                    className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="p-3 text-left">{stock.item_name}</td>
                    <td className="p-3 text-center">{stock.category_name}</td>
                    <td className="p-3 text-center">{stock.quantity}</td>
                    <td className="p-3 text-center">₹{stock.price_pu || "0.00"}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => openModal(stock)}
                        className={`px-4 py-2 rounded ${
                          userRole?.toLowerCase() === "admin"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 cursor-not-allowed"
                        }`}
                        disabled={userRole?.toLowerCase() !== "admin"}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Custom Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900/50 rounded-xl border border-red-700">
            <div className="flex items-center gap-2 text-red-300">
              <FiX className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && currentStock && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg w-80">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Update Stock</h2>
            <p className="text-gray-300"><strong>Product:</strong> {currentStock.item_name}</p>
            <p className="text-gray-300"><strong>Quantity:</strong> {currentStock.quantity}</p>
            <p className="text-gray-300"><strong>Price:</strong> ₹{currentStock.price_pu || "0.00"}</p>
            <div className="mt-4">
              <button
                onClick={handleUpdateStock}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
            <button
              onClick={closeModal}
              className="w-full mt-2 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}