import { useState, useEffect } from "react";

export default function ExpenseDetails({ projectId, setExpenseData }) {
  const [expenses, setExpenses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [cid, setCid] = useState(null);
  const [cname, setCname] = useState("");
  const [pid, setPid] = useState(null);
  const [pname, setPname] = useState("");
  const [extraExpenses, setExtraExpenses] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);

  // Fetch data when projectId changes
  useEffect(() => {
    if (projectId) {
      // Fetch expenses and handle possible nested array
      fetch(`/api/expenses/${projectId}`)
        .then((res) => res.json())
        .then((data) => {
          const expensesData = Array.isArray(data) ? data : data?.expenses || [];
          setExpenses(expensesData);
        })
        .catch((err) => console.error("Error fetching expenses:", err));

      // Fetch inventory and handle possible nested array
      fetch(`/api/inventory/${projectId}`)
        .then((res) => res.json())
        .then((data) => {
          const inventoryData = Array.isArray(data) ? data : data?.inventory || [];
          setInventory(inventoryData);
        })
        .catch((err) => console.error("Error fetching inventory:", err));

      // Fetch project details and set customer info directly from project data
      fetch(`/api/projects/${projectId}`)
        .then((res) => res.json())
        .then((project) => {
          if (project) {
            setPid(project.pid);
            setPname(project.pname || "Unknown Project");
            setCid(project.cid || null);
            // Set customer name directly from project data if available
            setCname(project.cname || "Unknown Customer");
          }

          // Fetch additional customer details if needed
          if (project.cid) {
            fetch(`/api/customer/${project.cid}`)
              .then((res) => res.json())
              .then((customerData) => {
                setCustomer(customerData);
                // Update customer name only if not already set from project
                setCname((prev) => prev || customerData.customer_name || "Unknown Customer");
              })
              .catch((err) => console.error("Error fetching customer:", err));
          }
        })
        .catch((err) => console.error("Error fetching project:", err));
    } else {
      resetState();
    }
  }, [projectId]);

  const resetState = () => {
    setExpenses([]);
    setInventory([]);
    setCustomer(null);
    setExtraExpenses([]);
    setPname("");
    setCid(null);
    setCname("");
    setGrandTotal(0);
  };

  // Calculate totals using correct numeric conversion
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const totalInventoryCost = inventory.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const totalExtraExpense = extraExpenses.reduce((sum, exp) => sum + (exp.quantity * exp.unitPrice || 0), 0);

  useEffect(() => {
    setGrandTotal(totalExpenses + totalInventoryCost + totalExtraExpense);
  }, [totalExpenses, totalInventoryCost, totalExtraExpense]);

  useEffect(() => {
    setExpenseData({ expenses, inventory, customer, extraExpenses, pid, pname, cid, cname, grandTotal });
  }, [expenses, inventory, customer, extraExpenses, pid, pname, cid, cname, grandTotal]);

  return (
    <div className="p-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-6">
        Expense Overview
      </h1>
  
      {/* Project & Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="space-y-2 bg-gray-900/30 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 text-blue-400">
            <span className="text-sm font-semibold">Project ID:</span>
            <span className="font-mono text-purple-300">{pid || '--'}</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400">
            <span className="text-sm font-semibold">Project Name:</span>
            <span className="text-white/90">{pname || 'Unnamed Project'}</span>
          </div>
        </div>
  
        <div className="space-y-2 bg-gray-900/30 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 text-green-400">
            <span className="text-sm font-semibold">Customer ID:</span>
            <span className="font-mono text-purple-300">{cid || '--'}</span>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <span className="text-sm font-semibold">Customer Name:</span>
            <span className="text-white/90">{cname || 'Unknown Customer'}</span>
          </div>
        </div>
      </div>
  
      {/* Expense Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
          <p className="text-sm text-red-400 mb-1">Total Expense</p>
          <p className="text-2xl font-bold text-red-400">₹{totalExpenses}</p>
        </div>
        <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
          <p className="text-sm text-green-400 mb-1">Inventory Cost</p>
          <p className="text-2xl font-bold text-green-400">₹{totalInventoryCost}</p>
        </div>
        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
          <p className="text-sm text-blue-400 mb-1">Extra Expenses</p>
          <p className="text-2xl font-bold text-blue-400">₹{totalExtraExpense}</p>
        </div>
        <div className="bg-purple-500/20 p-4 rounded-lg border border-purple-500/30 shadow-lg">
          <p className="text-sm text-purple-400 mb-1">Grand Total</p>
          <p className="text-2xl font-bold text-purple-300">₹{grandTotal}</p>
        </div>
      </div>
  
      {/* Extra Expenses Section */}
      <div className="space-y-4">
        <button
          onClick={() => setExtraExpenses([...extraExpenses, { item: "", quantity: 1, unitPrice: 0 }])}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02]"
        >
          ➕ Add New Expense Item
        </button>
  
        {extraExpenses.length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-white/80 border-b border-white/10 pb-2">
              Manage Extra Expenses
            </h2>
            {extraExpenses.map((expense, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-black/20 p-4 rounded-lg border border-white/10">
                <input
                  type="text"
                  placeholder="Item name"
                  value={expense.item}
                  onChange={(e) => {
                    const newExtraExpenses = [...extraExpenses];
                    newExtraExpenses[index].item = e.target.value;
                    setExtraExpenses(newExtraExpenses);
                  }}
                  className="w-full md:flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={expense.quantity}
                  onChange={(e) => {
                    const newExtraExpenses = [...extraExpenses];
                    newExtraExpenses[index].quantity = Number(e.target.value);
                    setExtraExpenses(newExtraExpenses);
                  }}
                  className="w-24 bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Unit price"
                  value={expense.unitPrice || ""}
                  onChange={(e) => {
                    const newExtraExpenses = [...extraExpenses];
                    newExtraExpenses[index].unitPrice = Number(e.target.value);
                    setExtraExpenses(newExtraExpenses);
                  }}
                  className="w-32 bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={() => setExtraExpenses(extraExpenses.filter((_, i) => i !== index))}
                  className="w-full md:w-auto bg-red-600/30 hover:bg-red-600/40 text-red-300 px-4 py-2 rounded transition-all border border-red-500/30"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}