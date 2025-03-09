"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen bg-cover bg-center text-gray-900 p-6"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/premium-photo/automated-inventory-management-system-wallpaper_987764-40035.jpg')",
      }}
    >
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
          >
            <motion.div className="w-64 h-3 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "linear" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {!loading && (
        <div className="flex flex-col items-center justify-center flex-grow">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            className="bg-white bg-opacity-40 p-8 rounded-lg shadow-lg text-center max-w-lg w-full"
          >
            <h1 className="text-4xl font-bold mb-4">Inventory Management System</h1>
            <p className="text-lg text-gray-700 mb-6">
              Welcome to the IMS Dashboard. Manage your inventory efficiently.
            </p>

            <motion.button
              onClick={() => router.push("/dashboard")}
              whileHover={{ scale: 1.1 }}
              className="px-6 py-3 bg-blue-600 text-white text-lg rounded-full shadow-md transition-transform transform hover:bg-blue-700"
            >
              Go to Login
            </motion.button>
          </motion.div>
        </div>
      )}
       {/* Footer - Sticks to Bottom & Spans Full Width */}
       <footer className="w-full bg-gray-900 text-white py-4 text-center fixed bottom-0 left-0">
        <div className="flex justify-center space-x-6 mb-2">
          <a href="https://www.facebook.com/ukshati/" target="_blank" rel="noopener noreferrer">
            <FaFacebook className="text-2xl hover:text-blue-500" />
          </a>
          <a href="https://www.instagram.com/ukshati/" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="text-2xl hover:text-pink-500" />
          </a>
          <a href="https://www.linkedin.com/company/ukshati-technologies/" target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="text-2xl hover:text-blue-700" />
          </a>
          <a href="https://twitter.com/ukshati/" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="text-2xl hover:text-blue-400" />
          </a>
        </div>
        <p className="text-sm">Contact: +91 7259439998 | Email: ukshati365@gmail.com</p>
      </footer>
    </div>
  );
}
