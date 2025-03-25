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
      fetch(`/api/expenses/${projectId}`)
        .then((res) => res.json())
        .then((data) => setExpenses(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching expenses:", err));

      fetch(`/api/inventory/${projectId}`)
        .then((res) => res.json())
        .then((data) => setInventory(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching inventory:", err));

      fetch(`/api/projects/${projectId}`)
        .then((res) => res.json())
        .then((project) => {
          if (project) {
            setPid(project.pid);
            setPname(project.pname || "Unknown Project");
            setCid(project.cid || null);
          }

          if (project.cid) {
            fetch(`/api/customer/${project.cid}`)
              .then((res) => res.json())
              .then((customerData) => {
                setCustomer(customerData);
                setCname(customerData.customer_name || "Unknown Customer");
              })
              .catch((err) => console.error("Error fetching customer:", err));
          }
        })
        .catch((err) => console.error("Error fetching project:", err));
    } else {
      resetState();
    }
  }, [projectId]);

  // Reset state when projectId changes
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

  // Calculate total expenses
  const totalExpenses = (expenses?.reduce((sum, exp) => sum + parseFloat(exp.Amount || 0), 0)) || 0;
  const totalInventoryCost = inventory.reduce((sum, item) => sum + Number(item.total_cost || 0), 0);
  const totalExtraExpense = extraExpenses.reduce((sum, exp) => sum + (exp.quantity * exp.unitPrice || 0), 0);

  // Calculate Grand Total
  useEffect(() => {
    setGrandTotal(totalExpenses + totalInventoryCost + totalExtraExpense);
  }, [totalExpenses, totalInventoryCost, totalExtraExpense]);

  useEffect(() => {
    setExpenseData({ expenses, inventory, customer, extraExpenses, pid, pname, cid, cname, grandTotal });
  }, [expenses, inventory, customer, extraExpenses, pid, pname, cid, cname, grandTotal]);

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h1 className="text-lg font-medium mb-2">Expense Details</h1>

      {pid ? <p className="text-gray-700">Project ID: {pid}</p> : <p className="text-red-500">Project ID not found</p>}
      {pname ? <p className="text-gray-700">Project Name: {pname}</p> : <p className="text-red-500">Project Name not found</p>}
      {cid ? <p className="text-gray-700">Customer ID: {cid}</p> : <p className="text-red-500">Customer ID not found</p>}
      {cname ? <p className="text-gray-700">Customer Name: {cname}</p> : <p className="text-red-500">Customer Name not found</p>}

      <p className="font-bold text-red-600">Total Expense: ₹{totalExpenses}</p>
      <p className="font-bold text-green-600">Total Inventory Cost: ₹{totalInventoryCost}</p>
      <p className="font-bold text-blue-600">Total Extra Expense: ₹{totalExtraExpense}</p>
      <p className="font-bold text-purple-600 text-xl">Grand Total: ₹{grandTotal}</p>

      <button
        onClick={() => setExtraExpenses([...extraExpenses, { item: "", quantity: 1, unitPrice: 0 }])}
        className="bg-blue-600 text-white p-2 rounded my-2"
      >
        ➕ Add Extra Expense
      </button>

      {extraExpenses.length > 0 && (
        <div className="mt-4">
          <h2 className="text-md font-medium">Extra Expenses</h2>
          {extraExpenses.map((expense, index) => (
            <div key={index} className="flex space-x-2 items-center mb-2">
              <input
                type="text"
                placeholder="Item Name"
                value={expense.item}
                onChange={(e) => {
                  const newExtraExpenses = [...extraExpenses];
                  newExtraExpenses[index].item = e.target.value;
                  setExtraExpenses(newExtraExpenses);
                }}
                className="border p-1"
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
                className="border p-1 w-16"
              />
              <input
                type="number"
                placeholder="Unit Price"
                value={expense.unitPrice}
                onChange={(e) => {
                  const newExtraExpenses = [...extraExpenses];
                  newExtraExpenses[index].unitPrice = Number(e.target.value);
                  setExtraExpenses(newExtraExpenses);
                }}
                className="border p-1 w-20"
              />
              <button
                onClick={() => setExtraExpenses(extraExpenses.filter((_, i) => i !== index))}
                className="bg-red-500 text-white p-1 rounded"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
