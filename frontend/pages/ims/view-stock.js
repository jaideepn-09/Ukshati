"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import StarryBackground from "@/components/StarryBackground";
import ScrollToTopButton from "@/components/scrollup";
import { FiShoppingCart, FiActivity, FiSearch, FiX, FiUser, FiMapPin, FiAlertTriangle,FiArrowLeft } from "react-icons/fi";
import BackButton from "@/components/BackButton";

export default function StockDetails() {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [spendQty, setSpendQty] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [location, setLocation] = useState("");
  const [remark, setRemark] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
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
      setErrors([]);
    } catch (error) {
      setErrors(["Failed to load data: " + error.message]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stock notification system - now triggers at <= 2 quantity
  useEffect(() => {
    const checkStockLevels = () => {
      const criticalStocks = stocks.filter(stock => stock.quantity <= 2);
      
      criticalStocks.forEach(stock => {
        if(!notifications.find(n => n.id === stock.stock_id)) {
          const timeoutId = setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== stock.stock_id));
          }, 8000);

          setNotifications(prev => [
            ...prev,
            {
              id: stock.stock_id,
              type: stock.quantity === 0 ? 'error' : 'warning',
              message: `${stock.item_name} - ${stock.quantity === 0 ? 'Stock depleted!' : 'Low stock warning!'}`,
              timeoutId,
              quantity: stock.quantity
            }
          ]);
        }
      });
    };

    if (stocks.length > 0) checkStockLevels();
  }, [stocks]);

  const openModal = (stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
    setErrors([]);
    setSpendQty("");
    setSelectedProject("");
    setSelectedEmployee("");
    setLocation("");
    setRemark("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSpendStock = async () => {
    const newErrors = [];
    
    if (!selectedProject) newErrors.push("Project is required");
    if (!selectedEmployee) newErrors.push("Employee is required");
    if (!spendQty || spendQty <= 0) newErrors.push("Valid quantity is required");
    
    const availableQty = Number(selectedStock?.quantity);
    const requestedQty = Number(spendQty);
    
    if (requestedQty > availableQty) {
      newErrors.push(`Quantity exceeds available stock (${availableQty})`);
    }
    
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
          spentQty: requestedQty,
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

      // Refresh data without full page reload
      await fetchData();
      closeModal();

      // Show success notification
      setNotifications(prev => [
        ...prev,
        {
          id: Date.now(),
          type: 'success',
          message: `${requestedQty} ${selectedStock.item_name} spent successfully`,
          timeoutId: setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== Date.now()));
          }, 3000)
        }
      ]);

    } catch (error) {
      setErrors([error.message]);
    }
  };

  const filteredStocks = stocks.filter(stock => 
    stock.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.category_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen text-gray-100">
      <StarryBackground />
      <ScrollToTopButton />
      
      {/* Notifications Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
        <AnimatePresence>
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`p-3 rounded-lg flex items-start transition duration-300 ease-in-out cursor-pointer shadow-lg
                ${notification.type === 'error' 
                  ? 'bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-700 text-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800'
                  : notification.type === 'warning'
                    ? 'bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                    : 'bg-green-100 dark:bg-green-900 border-l-4 border-green-500 dark:border-green-700 text-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800'}
              `}
              onClick={() => {
                clearTimeout(notification.timeoutId);
                setNotifications(prev => prev.filter(n => n.id !== notification.id));
              }}
            >
              <div className={`mt-0.5 flex-shrink-0 ${
                notification.type === 'error' ? 'text-red-600' : 
                notification.type === 'warning' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {notification.type === 'error' || notification.type === 'warning' ? (
                  <FiAlertTriangle className="h-5 w-5" />
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
                {notification.quantity !== undefined && (
                  <p className="text-xs mt-1">Current quantity: {notification.quantity}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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
      
                <h1 className="text-2xl pr-10 font-bold text-blue-400 mx-auto">
                  Spent Inventory
                </h1>
      
                <div className="absolute right-6">
                  <button
                    onClick={() => router.push("/ims/inventory-spent")}
                    className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                  >
                    <FiActivity className="text-xl" />
                    <span className="font-semibold">View Inventory Spent</span>
                  </button>
                </div>
              </div>
            </header>

      <main className="max-w-7xl mx-auto p-4 space-y-8">
        <section className="rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiShoppingCart className="text-blue-400" />
              Current Stock List
            </h2>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products or categories..."
                className="pl-10 pr-4 py-2 bg-gray-700 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    <tr 
                      key={stock.stock_id} 
                      className={`
                        border-t border-gray-700 
                        ${stock.quantity === 0 
                          ? "bg-red-900/20 hover:bg-red-900/30" 
                          : stock.quantity <= 2
                            ? "bg-yellow-900/20 hover:bg-yellow-900/30"
                            : "hover:bg-gray-700/50"
                        }
                      `}
                    >
                      <td className="p-3">
                        <div className="flex items-center">
                          {stock.item_name}
                          {stock.quantity === 0 ? (
                            <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full animate-pulse">
                              Out of Stock
                            </span>
                          ) : stock.quantity <= 2 ? (
                            <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full animate-pulse">
                              Low Stock
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-3">{stock.category_name}</td>
                      <td className="p-3 font-mono">{stock.quantity}</td>
                      <td className="p-3 font-mono">₹{stock.price_pu}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => openModal(stock)} 
                          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            stock.quantity === 0
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                          disabled={stock.quantity === 0}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
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
        <AnimatePresence>
          {isModalOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-400">
                    Spend {selectedStock?.item_name}
                  </h2>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
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
                      className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                      className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                      onChange={(e) => setSpendQty(Number(e.target.value))}
                      className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                      className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter location where stock is being used"
                      required
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
                      className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Additional notes (optional)"
                      rows="3"
                    />
                  </div>

                  {/* Error Messages */}
                  {errors.length > 0 && (
                    <div className="p-3 bg-red-900/20 rounded-lg text-red-400 text-sm space-y-1">
                      {errors.map((error, i) => (
                        <p key={i} className="flex items-start">
                          <FiAlertTriangle className="flex-shrink-0 mt-0.5 mr-1.5" />
                          <span>{error}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={handleSpendStock}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
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
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}