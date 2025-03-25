"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StarryBackground from "@/components/StarryBackground";
import ScrollToTopButton from "@/components/scrollup";
import { FiShoppingCart, FiActivity, FiSearch, FiX, FiUser, FiMapPin } from "react-icons/fi";
import BackButton from "@/components/BackButton";

export default function StockDetails() {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [spendQty, setSpendQty] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [location, setLocation] = useState("");
  const [remark, setRemark] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stockRes, projRes, empRes] = await Promise.all([
          fetch("/api/stocks"),
          fetch("/api/projects"),
          fetch("/api/employees"),
        ]);

        if (!stockRes.ok || !projRes.ok || !empRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const stockData = await stockRes.json();
        const projData = await projRes.json();
        const empData = await empRes.json();

        setStocks(stockData);
        setProjects(projData);
        setEmployees(empData.employees);
      } catch (error) {
        setErrors(["Failed to load data: " + error.message]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = (stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
    setErrors([]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSpendQty("");
    setSelectedProject("");
    setSelectedEmployee("");
    setLocation("");
    setRemark("");
    setErrors([]);
    // Full page reload
    window.location.reload();
  };

  const handleSpendStock = async () => {
    const newErrors = [];
    
    if (!selectedProject) newErrors.push("Project is required");
    if (!selectedEmployee) newErrors.push("Employee is required");
    if (!spendQty || spendQty <= 0) newErrors.push("Valid quantity is required");
    if (spendQty > selectedStock?.quantity) newErrors.push(`Quantity exceeds available stock (${selectedStock?.quantity})`);
    if (!location) newErrors.push("Location is required");
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch("/api/spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockId: selectedStock.stock_id,
          spentQty: Number(spendQty),
          used_for: Number(selectedProject),
          recorded_by: Number(selectedEmployee),
          location,
          remark
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update stock");
      }

      closeModal();

    } catch (error) {
      setErrors([error.message]);
    }
  };

  const filteredStocks = stocks.filter(stock => 
    stock.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen text-gray-100">
      <StarryBackground />
      <ScrollToTopButton />
      
      <header className="ml-8 p-4 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="pb-2 pr-5 mr-4">
        <BackButton route="/ims/home" />
        </div>
          <h1 className="text-2xl font-bold text-blue-400 text-center">Stock Management</h1>
          <button
            onClick={() => router.push("/ims/inventory-spent")}
            className="flex items-center gap-2 hover:text-blue-400 transition-colors mr-8"
          >
            <FiActivity className="text-xl mt-2 mr-2" />
            <span className="font-semibold mt-3 mr-2">View Spent Inventory</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-8">
        <section className="rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiShoppingCart className="text-blue-400" />
              Current Stock List
            </h2>
            <input
              type="text"
              placeholder="Search products..."
              className="p-2 bg-gray-700 rounded-lg w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  {["Product", "Category", "Quantity", "Unit Price", "Actions"].map((header, i) => (
                    <th key={i} className="p-3 text-left text-sm font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading stock data...</td></tr>
                ) : filteredStocks.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">No matching stock items found</td></tr>
                ) : (
                  filteredStocks.map((stock) => (
                    <tr key={stock.stock_id} className="border-t border-gray-700 hover:bg-gray-700/50">
                      <td className="p-3">{stock.item_name}</td>
                      <td className="p-3">{stock.category_name}</td>
                      <td className="p-3">{stock.quantity}</td>
                      <td className="p-3">₹{stock.price_pu}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => openModal(stock)} 
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"/>
                          </svg>
                          <span>Spend</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Spend Stock Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-400">
                  Spend {selectedStock?.item_name}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Project Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project
                  </label>
                  <select
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    <option value="">Select Project</option>
                    {projects.map(proj => (
                      <option key={proj.pid} value={proj.pid}>
                        {proj.pname}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FiUser className="inline mr-2" />
                    Recorded By
                  </label>
                  <select
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantity (Available: {selectedStock?.quantity})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedStock?.quantity}
                    value={spendQty}
                    onChange={(e) => setSpendQty(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quantity"
                  />
                </div>

                {/* Location Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FiMapPin className="inline mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter location"
                  />
                </div>

                {/* Remarks Textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes"
                    rows="3"
                  />
                </div>

                {/* Error Messages */}
                {errors.length > 0 && (
                  <div className="text-red-400 text-sm space-y-1">
                    {errors.map((error, i) => (
                      <p key={i}>⚠️ {error}</p>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleSpendStock}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Confirm Spend
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}