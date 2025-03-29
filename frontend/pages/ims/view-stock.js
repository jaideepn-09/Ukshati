"use client";
import { useState, useEffect, useRef, useCallback,useMemo  } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import ScrollToTopButton from "@/components/scrollup";
import { 
  FiShoppingCart, FiActivity, FiSearch, FiX, 
  FiUser, FiMapPin, FiAlertTriangle, FiArrowLeft, 
  FiFilter, FiUpload, FiDownload 
} from "react-icons/fi";
import Papa from "papaparse";

export default function StockDetails() {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [spendQty, setSpendQty] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [location, setLocation] = useState("");
  const [remark, setRemark] = useState("");
   
  const StarryBackground = dynamic(
    () => import("@/components/StarryBackground"),
    { ssr: false }
  );

  // Memoized fetch function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [stockRes, projRes, empRes, catRes] = await Promise.all([
        fetch("/api/stocks"),
        fetch("/api/projects"),
        fetch("/api/employees"),
        fetch("/api/categories")
      ]);

      if (!stockRes.ok || !projRes.ok || !empRes.ok || !catRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [stockData, projData, empData, catData] = await Promise.all([
        stockRes.json(),
        projRes.json(),
        empRes.json(),
        catRes.json()
      ]);

      setStocks(stockData);
      setProjects(projData);
      setEmployees(empData.employees || []);
      setCategories(catData.categories || []);
      setErrors([]);

      // Update notifications
      setNotifications(prev => [
        ...prev.filter(n => n.type === 'success'),
        ...stockData
          .filter(stock => stock.quantity <= 2)
          .map(stock => ({
            id: stock.stock_id,
            type: stock.quantity === 0 ? 'error' : 'warning',
            message: `${stock.item_name} - ${stock.quantity === 0 ? 'Stock depleted!' : 'Low stock warning!'}`,
            quantity: stock.quantity
          }))
      ]);
    } catch (error) {
      console.error("Fetch error:", error);
      setErrors(["Failed to load data: " + error.message]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized filtered stocks
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      const categoryMatch = selectedCategory === "all" || stock.category_name === selectedCategory;
      const searchString = `${stock.item_name} ${stock.category_name}`.toLowerCase();
      const searchMatch = searchString.includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [stocks, selectedCategory, searchQuery]);

  // Modal handlers
  const openModal = useCallback((stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
    setErrors([]);
    setSpendQty("");
    setSelectedProject("");
    setSelectedEmployee("");
    setLocation("");
    setRemark("");
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // CSV handling
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    setCsvErrors([]);
    setUploadProgress(0);
    
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setCsvErrors(results.errors.map(err => `Row ${err.row}: ${err.message}`));
          return;
        }
        
        const validationErrors = [];
        const validatedData = results.data.map((row, index) => {
          const rowErrors = [];
          
          if (!row['product name']) rowErrors.push("Product name is required");
          if (!row.quantity || isNaN(row.quantity)) rowErrors.push("Valid quantity is required");
          if (!row['project name']) rowErrors.push("Project name is required");
          if (!row['employee name']) rowErrors.push("Employee name is required");
          if (!row.location) rowErrors.push("Location is required");
          
          if (rowErrors.length > 0) {
            validationErrors.push(`Row ${index + 2}: ${rowErrors.join(", ")}`);
            return null;
          }
          
          const stockItem = stocks.find(s => 
            s.item_name.toLowerCase() === row['product name'].toLowerCase().trim()
          );
          
          const projectItem = projects.find(p => 
            p.pname.toLowerCase() === row['project name'].toLowerCase().trim()
          );
          
          const employeeItem = employees.find(e => 
            e.name.toLowerCase() === row['employee name'].toLowerCase().trim()
          );
          
          if (!stockItem) {
            validationErrors.push(`Row ${index + 2}: Product not found - ${row['product name']}`);
            return null;
          }
          
          if (!projectItem) {
            validationErrors.push(`Row ${index + 2}: Project not found - ${row['project name']}`);
            return null;
          }
          
          if (!employeeItem) {
            validationErrors.push(`Row ${index + 2}: Employee not found - ${row['employee name']}`);
            return null;
          }
          
          return {
            stockId: stockItem.stock_id,
            productName: stockItem.item_name,
            spentQty: parseFloat(row.quantity),
            used_for: projectItem.pid,
            projectName: projectItem.pname,
            recorded_by: employeeItem.id,
            employeeName: employeeItem.name,
            location: row.location,
            remark: row.remarks || ""
          };
        }).filter(Boolean);
        
        if (validationErrors.length > 0) {
          setCsvErrors(validationErrors);
          return;
        }
        
        setCsvData(validatedData);
      },
      error: (error) => {
        setCsvErrors([`Error parsing CSV: ${error.message}`]);
      }
    });
  }, [stocks, projects, employees]);

  const handleBulkSpend = useCallback(async () => {
    if (csvData.length === 0) {
      setCsvErrors(["No valid data to upload"]);
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const batchSize = 5;
      let successfulCount = 0;
      let failedItems = [];
      
      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize);
        
        try {
          const response = await fetch("/api/spend/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: batch })
          });
          
          const result = await response.json();
          
          if (response.ok) {
            successfulCount += result.successful.length;
            failedItems = [...failedItems, ...result.failed];
          } else {
            throw new Error(result.error || "Bulk upload failed");
          }
        } catch (error) {
          failedItems = [...failedItems, ...batch.map(item => ({
            ...item,
            error: error.message
          }))];
        }
        
        setUploadProgress(Math.min(100, ((i + batchSize) / csvData.length) * 100));
      }
      
      const notificationId = Date.now();
      setNotifications(prev => [
        ...prev,
        {
          id: notificationId,
          type: 'success',
          message: `Bulk upload completed: ${successfulCount} successful, ${failedItems.length} failed`,
          timeoutId: setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
          }, 10000)
        }
      ]);
      
      if (failedItems.length > 0) {
        setCsvErrors(failedItems.map(item => 
          `${item.productName}: ${item.error || "Unknown error"}`
        ));
      } else {
        closeBulkModal();
        fetchData();
      }
    } catch (error) {
      setCsvErrors([`Bulk upload failed: ${error.message}`]);
    } finally {
      setIsUploading(false);
    }
  }, [csvData, fetchData]);

  const closeBulkModal = useCallback(() => {
    setIsBulkModalOpen(false);
    setCsvData([]);
    setCsvErrors([]);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const downloadTemplate = useCallback(() => {
    const template = [{
      'product name': 'Wrench',
      'quantity': '5',
      'project name': 'Greenhouse Automation',
      'employee name': 'John Doe',
      'location': 'Main Warehouse',
      'remarks': 'For assembly'
    }];
    
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "spend_stock_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleSpendStock = useCallback(async () => {
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

      await fetchData();
      closeModal();

      const notificationId = Date.now();
      setNotifications(prev => [
        ...prev,
        {
          id: notificationId,
          type: 'success',
          message: `${requestedQty} ${selectedStock.item_name} spent successfully`,
          timeoutId: setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
          }, 15000)
        }
      ]);

    } catch (error) {
      setErrors([error.message]);
    }
  }, [selectedStock, selectedProject, selectedEmployee, spendQty, location, remark, fetchData, closeModal]);

  // Remove expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.filter(n => n.type === 'error' || n.type === 'warning')
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-gray-100">
      <StarryBackground />
      <ScrollToTopButton />

      {/* Notifications Container */}
      <div className="fixed z-50">
        {/* Success Notifications - Top Right */}
        <div className="fixed top-4 right-4 w-80 space-y-2">
          <AnimatePresence>
            {notifications.filter(n => n.type === 'success').map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="p-3 rounded-lg flex items-start transition duration-300 ease-in-out cursor-pointer shadow-lg
                          bg-green-100 dark:bg-green-900 border-l-4 border-green-500 dark:border-green-700 
                          text-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800"
                onClick={() => {
                  clearTimeout(notification.timeoutId);
                  setNotifications(prev => prev.filter(n => n.id !== notification.id));
                }}
              >
                <svg className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium">{notification.message}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Error/Warning Notifications - Bottom Right */}
        <div className="fixed bottom-4 right-4 w-80 space-y-2">
          <AnimatePresence>
            {notifications.filter(n => n.type !== 'success').map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className={`p-3 rounded-lg flex items-start transition duration-300 ease-in-out cursor-pointer shadow-lg
                  ${notification.type === 'error' 
                    ? 'bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-700 text-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800'
                    : 'bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-yellow-800'}`}
                onClick={() => {
                  setNotifications(prev => prev.filter(n => n.id !== notification.id));
                }}
              >
                <FiAlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                  notification.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                }`} />
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
          
          <div className="absolute right-6 flex gap-4">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 hover:text-blue-400 transition-colors"
            >
              <FiUpload className="text-xl" />
              <span className="font-semibold">Bulk Upload</span>
            </button>
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
          <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiShoppingCart className="text-blue-400" />
              Current Stock List
            </h2>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex items-center w-full md:w-64">
                <FiSearch className="absolute left-3 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search products or categories..."
                  className="pl-10 pr-4 py-2 bg-gray-700 rounded-lg w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative flex items-center w-full md:w-64">
                <FiFilter className="absolute left-3 text-blue-400" />
                <select
                  className="pl-10 pr-4 py-2 bg-gray-700 rounded-lg w-full appearance-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_name}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  {["Product", "Category", "Quantity", "Unit Price", "Total Price", "Actions"].map((header, i) => (
                    <th key={i} className="p-3 text-left text-sm font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading stock data...</td></tr>
                ) : filteredStocks.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-400">No matching stock items found</td></tr>
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
                      <td className="p-3">
                        <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                          {stock.category_name}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{stock.quantity}</td>
                      <td className="p-3 font-mono">₹{stock.price_pu}</td>
                      <td className="p-3 font-mono">₹{(stock.quantity * stock.price_pu).toFixed(2)}</td>
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

        {/* Bulk Upload Modal */}
        <AnimatePresence>
          {isBulkModalOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={closeBulkModal}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-400">
                    Bulk Spend Stocks
                  </h2>
                  <button 
                    onClick={closeBulkModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FiUpload className="w-12 h-12 text-blue-400" />
                      <p className="text-gray-300">
                        Upload a CSV file with stock spending details
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Select CSV File
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv"
                        className="hidden"
                      />
                      <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <FiDownload className="w-4 h-4" />
                        Download CSV Template
                      </button>
                    </div>
                  </div>

                  {csvData.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-300 mb-3">
                        Preview ({csvData.length} items)
                      </h3>
                      <div className="overflow-auto max-h-60">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-700">
                            <tr>
                              <th className="p-2">Product</th>
                              <th className="p-2">Quantity</th>
                              <th className="p-2">Project</th>
                              <th className="p-2">Employee</th>
                              <th className="p-2">Location</th>
                            </tr>
                          </thead>
                          <tbody>
                            {csvData.slice(0, 5).map((item, i) => (
                              <tr key={i} className="border-b border-gray-700">
                                <td className="p-2">{item.productName}</td>
                                <td className="p-2">{item.spentQty}</td>
                                <td className="p-2">{item.projectName}</td>
                                <td className="p-2">{item.employeeName}</td>
                                <td className="p-2">{item.location}</td>
                              </tr>
                            ))}
                            {csvData.length > 5 && (
                              <tr>
                                <td colSpan="5" className="p-2 text-center text-gray-400">
                                  + {csvData.length - 5} more items
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {csvErrors.length > 0 && (
                    <div className="p-3 bg-red-900/20 rounded-lg text-red-400 text-sm space-y-1 max-h-40 overflow-auto">
                      <h4 className="font-medium">Validation Errors:</h4>
                      {csvErrors.map((error, i) => (
                        <p key={i} className="flex items-start">
                          <FiAlertTriangle className="flex-shrink-0 mt-0.5 mr-1.5" />
                          <span>{error}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={handleBulkSpend}
                      disabled={csvData.length === 0 || isUploading}
                      className={`flex-1 py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        csvData.length === 0 || isUploading
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Confirm Bulk Spend"
                      )}
                    </button>
                    <button
                      onClick={closeBulkModal}
                      disabled={isUploading}
                      className={`flex-1 py-3 px-6 rounded-lg transition-colors ${
                        isUploading
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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