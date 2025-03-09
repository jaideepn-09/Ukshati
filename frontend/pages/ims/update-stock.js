import { useEffect, useState } from "react";
import Link from "next/link";

export default function StockUpdate() {
  const [userRole, setUserRole] = useState("");
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust as necessary

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    console.log("User role:", role); // Debugging
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
      const response = await fetch("/api/stocks");
      if (!response.ok) throw new Error("Failed to fetch stocks");
      const data = await response.json();
      setStocks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateStock = async () => {
    if (userRole?.toLowerCase() !== "admin") return;

    try {
      const quantity = prompt("Enter quantity to add:");
      if (!quantity || isNaN(quantity)) 
        throw new Error("Invalid quantity");

      const price = prompt("Enter price to add:");
      if (!price || isNaN(price)) 
        throw new Error("Invalid price");

      const token = localStorage.getItem("token");
      const response = await fetch("/api/updateStock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
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
    <div className="min-h-screen flex flex-col items-center bg-cover bg-center p-6"
      style={{ backgroundImage: "url('https://img.freepik.com/premium-photo/automated-inventory-management-system-wallpaper_987764-40035.jpg')" }}>
      
      <h1 className="text-3xl font-bold mb-6 text-white">Stock Management</h1>

      <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg w-full max-w-4xl text-black">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Search by product name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="mb-4 p-2 w-full border border-gray-300 rounded"
        />

        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">Product Name</th>
              <th className="p-3 border">Quantity</th>
              <th className="p-3 border">Price</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStocks.map((stock) => (
              <tr key={stock.stock_id} className="hover:bg-gray-50">
                <td className="p-3 border">{stock.item_name}</td>
                <td className="p-3 border text-center">{stock.quantity}</td>
                <td className="p-3 border text-center">
                  ₹{stock.price_pu ? stock.price_pu : "0.00"}
                </td>
                <td className="p-3 border text-center">
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

        {filteredStocks.length === 0 && !error && (
          <p className="text-center text-gray-500 mt-4">No stock items found</p>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      </div>

      {/* Back Button */}
      <Link href="/ims/home" className="mt-6">
        <button className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">
          Back to Home
        </button>
      </Link>

      {/* Modal */}
      {isModalOpen && currentStock && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 text-black">
          <div className="bg-white p-6 rounded-lg w-80">
            <h2 className="text-xl font-bold mb-4">Update Stock</h2>
            <p><strong>Product:</strong> {currentStock.item_name}</p>
            <p><strong>Quantity:</strong> {currentStock.quantity}</p>
            <p><strong>Price:</strong> ₹{currentStock.price_pu || "0.00"}</p>
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
