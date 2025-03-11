"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import StarryBackground from "@/components/StarryBackground";

export default function InventorySpent() {
  const [spentStocks, setSpentStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center  p-6 text-black">
      <StarryBackground/>
      <h1 className="text-3xl font-bold mb-6 text-white">Inventory Spent</h1>

      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Spent Stock List</h2>
        {spentStocks.length === 0 ? (
          <p className="text-gray-500">No spent stock available.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-3">Product</th>
                <th className="border border-gray-300 p-3">Quantity</th>
                <th className="border border-gray-300 p-3">Spent Cost</th>
                <th className="border border-gray-300 p-3">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {spentStocks.map((spent, index) => (
                <tr key={index} className="text-center">
                  <td className="border border-gray-300 p-3">{spent.productName}</td>
                  <td className="border border-gray-300 p-3">{spent.quantity}</td>
                  <td className="border border-gray-300 p-3">₹{spent.price}</td>
                  <td className="border border-gray-300 p-3">{spent.remark || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6">
        <Link href="/ims/home">
          <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}