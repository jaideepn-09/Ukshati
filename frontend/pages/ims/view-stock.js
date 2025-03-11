import { useEffect, useState } from "react";
import Link from "next/link";
import StarryBackground from "@/components/StarryBackground";

export default function ViewStock() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch("/api/view");
        const data = await response.json();
        setStocks(data);
      } catch (error) {
        console.error("Error fetching stocks:", error);
      }
    };
    fetchStocks();
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen bg-cover bg-center p-6 text-black">
        <StarryBackground/>
      <h1 className="text-3xl font-bold text-center mb-6 text-black">Stock Details</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto w-full bg-opacity-90">
        {stocks.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Product Name</th>
                <th className="border border-gray-300 p-2">Category</th>
                <th className="border border-gray-300 p-2">Remaining Quantity</th>
                <th className="border border-gray-300 p-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.stock_id} className="text-center text-black">
                  <td className="border border-gray-300 p-2">{stock.productName}</td>
                  <td className="border border-gray-300 p-2">{stock.categoryName}</td>
                  <td className="border border-gray-300 p-2">{stock.quantity}</td>
                  <td className="border border-gray-300 p-2">{stock.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-600">No stocks available.</p>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <Link href="/ims/home">
          <button className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
