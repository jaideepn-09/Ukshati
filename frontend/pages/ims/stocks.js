"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import StarryBackground from "@/components/StarryBackground";
import { FiUploadCloud, FiFilePlus, FiShoppingCart, FiX, FiArrowLeft, FiFile, FiUpload, FiActivity, FiSearch, FiCheckCircle, FiFilter } from "react-icons/fi";
import ScrollToTopButton from "@/components/scrollup";

export default function StockDetails() {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ categoryName: "", productName: "", quantity: "", price: "" });
  const [csvData, setCsvData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, stockRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/stocks")
        ]);
        
        const [categoriesData, stocksData] = await Promise.all([
          catRes.json(),
          stockRes.json()
        ]);
        
        setCategories(categoriesData.categories || []);
        setStocks((stocksData || []).sort((a, b) => b.stock_id - a.stock_id));
      } catch (error) {
        setErrors(["Failed to load initial data"]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // Apply category filter
  const filteredStocks = stocks.filter(stock => {
    // Apply category filter
    const categoryMatch = selectedCategory === "all" || stock.category_name === selectedCategory;
    
    // Apply search filter
    const itemName = String(stock?.item_name || '').toLowerCase();
    const searchTerm = String(searchQuery || '').toLowerCase();
    const searchMatch = itemName.includes(searchTerm);
    
    return categoryMatch && searchMatch;
  });

  // Enhanced drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        handleFileUpload({ target: { files } });
      } else {
        setErrors(["Only CSV files are allowed"]);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
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

  const handleAddStock = async (e) => {
    e.preventDefault();
    const { categoryName, productName, quantity, price } = formData;
    
    try {
      const response = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          category_name: categoryName,
          productName,
          quantity: Number(quantity),
          price: Number(price)
        })
      });
      window.location.reload();
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add stock");
      }
      
      setStocks(prev => [{
        stock_id: result.stockId || Date.now(),
        item_name: productName,
        category_name: categoryName,
        quantity: Number(quantity),
        price_pu: Number(price)
      }, ...prev]);
      
      setFormData({ categoryName: "", productName: "", quantity: "", price: "" });
    } catch (error) {
      setErrors([error.message]);
    }
  };

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
            onClick={() => router.push("/ims/view-stock")}
            className="flex items-center gap-2 hover:text-blue-400 transition-colors mr-8"
          >
            <FiActivity className="text-xl" />
            <span className="font-semibold">View Inventory</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-8">
        <section className="grid md:grid-cols-2 gap-6">
          <div 
            className={`relative group p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border-2 ${
              isDragging ? 'border-blue-400/80' : 'border-gray-700'
            } transition-all duration-300 shadow-xl hover:shadow-blue-500/10`}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="absolute -inset-2 bg-blue-500/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <FiUploadCloud className="text-4xl text-blue-400 transform group-hover:scale-110 transition-transform" />
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Bulk Data Upload
                </h2>
                <p className="text-gray-400 text-sm">
                  Supported format: CSV (Max 100 records)
                </p>
              </div>

              <label className="w-full cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center space-y-3
                  ${isDragging ? 'border-blue-400 bg-blue-500/10' : 'border-gray-600 hover:border-blue-400'}
                  transition-all duration-200`}>
                  {csvData.length > 0 ? (
                    <>
                      <FiCheckCircle className="text-3xl text-green-400 animate-pulse" />
                      <div className="text-center">
                        <p className="font-medium">{csvData.length} records loaded</p>
                        <p className="text-sm text-gray-400 mt-1">Click to change file</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <FiFile className="text-3xl text-blue-400" />
                      <div className="text-center">
                        <p className="font-medium">Drag & drop files</p>
                        <p className="text-gray-400 text-sm mt-1">or click to browse</p>
                      </div>
                    </>
                  )}
                </div>
              </label>

              {uploadProgress > 0 && (
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Progress:</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleBulkUpload}
                disabled={!csvData.length}
                className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2
                  ${csvData.length ? 
                    'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/30' :
                    'bg-gray-700 text-gray-400 cursor-not-allowed'}
                  ${uploadProgress === 100 && 'bg-green-500 hover:bg-green-400'}`}
              >
                {uploadProgress === 100 ? (
                  <>
                    <FiCheckCircle className="text-xl" />
                    <span>Upload Complete!</span>
                  </>
                ) : (
                  <>
                    <FiUpload className="text-xl" />
                    <span>Process Data</span>
                  </>
                )}
              </button>
            </div>

            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-float"></div>
              <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-float-delayed"></div>
            </div>
          </div>

          {/* Manual Entry Form */}
          <div className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700">
            <div className="flex flex-col items-center space-y-4">
              <FiFilePlus className="text-4xl text-green-400" />
              <h2 className="text-xl font-semibold">Add Stock Manually</h2>
              
              <form onSubmit={handleAddStock} className="w-full space-y-4">
                <select
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.category_id} value={category.category_name}>
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
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="flex items-center space-x-2 w-full md:w-64">
                <FiSearch className="text-blue-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="p-2 bg-gray-700 rounded-lg w-full"
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
                  {["Product", "Category", "Quantity", "Unit Price", "Total Price"].map((header, i) => (
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
                      <td className="p-3">
                        <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                          {stock.category_name}
                        </span>
                      </td>
                      <td className="p-3">{stock.quantity}</td>
                      <td className="p-3">₹{stock.price_pu}</td>
                      <td className="p-3">₹{(stock.quantity * stock.price_pu).toFixed(2)}</td>
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
