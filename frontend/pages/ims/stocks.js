"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import StarryBackground from "@/components/StarryBackground";
import { FiUploadCloud, FiFilePlus, FiShoppingCart, FiX, FiArrowLeft, FiCheck, FiArrowUp, FiActivity } from "react-icons/fi";

export default function StockDetails() {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ categoryId: "", productName: "", quantity: "", price: "" });
  const [csvData, setCsvData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [spendQty, setSpendQty] = useState({});
  const [showScrollButton, setShowScrollButton] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enhanced CSV parsing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const lowerHeader = header.toLowerCase().trim();
        const headerMap = {
          'category': 'category',
          'cat': 'category',
          'category name': 'category',
          'product': 'product',
          'product name': 'product',
          'item': 'product',
          'quantity': 'quantity',
          'qty': 'quantity',
          'price': 'price',
          'unit price': 'price',
          'unitprice': 'price'
        };
        return headerMap[lowerHeader] || lowerHeader;
      },
      dynamicTyping: true,
      complete: (results) => {
        const validEntries = [];
        const invalidEntries = [];

        results.data.forEach((row, index) => {
          const quantity = Number(row.quantity) || 0;
          const price = Number(row.price) || 0;
          const category = (row.category || '').toString().trim();
          const product = (row.product || '').toString().trim();

          const errors = [];
          if (!category) errors.push("Missing category");
          if (!product) errors.push("Missing product name");
          if (isNaN(quantity) || quantity <= 0) errors.push("Invalid quantity");
          if (isNaN(price) || price <= 0) errors.push("Invalid price");

          if (errors.length === 0) {
            validEntries.push({
              categoryName: category,
              productName: product,
              quantity: quantity,
              price: price
            });
          } else {
            invalidEntries.push({
              row: index + 2,
              errors: errors,
              data: row
            });
          }
        });

        setCsvData(validEntries);
        
        if (validEntries.length === 0) {
          setErrors([
            "No valid entries found. Common issues:",
            ...invalidEntries.slice(0, 5).map(entry => 
              `Row ${entry.row}: ${entry.errors.join(', ')}`
            )
          ]);
        } else if (invalidEntries.length > 0) {
          setErrors([
            `Found ${validEntries.length} valid entries (${invalidEntries.length} invalid):`,
            ...invalidEntries.slice(0, 5).map(entry => 
              `Row ${entry.row}: ${entry.errors.join(', ')}`
            )
          ]);
        } else {
          setErrors([]);
        }
      },
      error: (error) => {
        setErrors([`CSV Error: ${error.message}`]);
      }
    });
  };

  const handleBulkUpload = async () => {
    if (!csvData.length) {
      setErrors(["Please select a valid CSV file first"]);
      return;
    }

    try {
      setUploadProgress(10);
      setErrors([]);
      
      const response = await fetch("/api/upload-stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks: csvData }),
      });

      const contentType = response.headers.get("content-type");
      const result = contentType?.includes("application/json") 
        ? await response.json()
        : null;

      if (!response.ok) {
        const errorMessage = result?.error || 
                            result?.message || 
                            `HTTP Error ${response.status}: ${await response.text()}`;
        throw new Error(errorMessage);
      }

      setUploadProgress(70);
      const updatedStocks = result.processedStocks.map(stock => ({
        ...stock,
        price_pu: Number(stock.price_pu)
      }));
      
      setStocks(prev => [...updatedStocks, ...prev]);
      setUploadProgress(100);
      
      setTimeout(() => {
        setCsvData([]);
        setUploadProgress(0);
      }, 1500);

    } catch (error) {
      setUploadProgress(0);
      setErrors([error.message]);
      console.error("Upload error:", {
        error: error.message,
        stack: error.stack,
        csvData: csvData.slice(0, 3)
      });
    }
    window.location.reload();
  };

  // Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    setIsDragging(e.type === 'dragover');
  };

  // Form Submission
  const handleAddStock = async (e) => {
    e.preventDefault();
    const { categoryId, productName, quantity, price } = formData;
    
    try {
      const response = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, productName, quantity, price })
      });

      if (!response.ok) throw new Error("Failed to add stock");
      
      const newStock = await response.json();
      setStocks(prev => [newStock, ...prev]);
      setFormData({ categoryId: "", productName: "", quantity: "", price: "" });
    } catch (error) {
      setErrors([error.message]);
    }
    window.location.reload();
  };

  // Spend Stock
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
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 p-3 bg-blue-600 rounded-full shadow-lg hover:bg-blue-500 transition-colors"
      >
        <FiArrowUp className="text-xl" />
      </button>

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
        <section className="grid md:grid-cols-2 gap-6">
          <div 
            className={`p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 ${
              isDragging ? 'border-blue-400' : 'border-gray-700'
            } transition-all`}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrag}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <FiUploadCloud className="text-4xl text-blue-400" />
              <h2 className="text-xl font-semibold">Bulk CSV Upload</h2>
              
              <label className="w-full cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  {csvData.length > 0 ? (
                    <div className="text-green-400">
                      <FiCheck className="inline mr-2" />
                      {csvData.length} items ready
                    </div>
                  ) : (
                    "Drag & drop CSV or click to browse"
                  )}
                </div>
              </label>

              {uploadProgress > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-400 h-2.5 rounded-full transition-all" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <button
                onClick={handleBulkUpload}
                disabled={!csvData.length}
                className="w-full py-2 px-4 bg-blue-600 rounded-lg font-medium hover:bg-blue-500 
                  disabled:bg-gray-700 disabled:text-gray-400 transition-colors"
              >
                {uploadProgress === 100 ? "Upload Complete!" : "Process CSV"}
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700">
            <div className="flex flex-col items-center space-y-4">
              <FiFilePlus className="text-4xl text-green-400" />
              <h2 className="text-xl font-semibold">Add Stock Manually</h2>
              
              <form onSubmit={handleAddStock} className="w-full space-y-4">
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Product Name"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400"
                    min="1"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400"
                    min="0.01"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-green-600 rounded-lg font-medium hover:bg-green-500 transition-colors"
                >
                  Add Stock Item
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700">
          <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiShoppingCart className="text-blue-400" />
              Current Stock List
            </h2>
            <input
              type="text"
              placeholder="Search products..."
              className="p-2 bg-gray-700 rounded-lg w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                      <td className="p-3">{stock.category_name}</td>
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