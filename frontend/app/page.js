"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import StarryBackground from '@/components/StarryBackground';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import Image from "next/image";

// Bubble Transition Component
const Bubbles = () => {
  return (
    <div id="bubbles">
      <div
        style={{ animationDuration: "1200ms", background: "#8f44fd" }}
        className="bubbles__first"
      />
      <div
        style={{ animationDuration: "1200ms", background: "#ffffff" }}
        className="bubbles__second"
      />
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);

  const triggerBubbleTransition = (callback) => {
    const bubbles = document.getElementById("bubbles");
    bubbles?.classList.add("show");
    setTimeout(() => {
      callback();
      bubbles?.classList.remove("show");
      bubbles?.classList.add("hide");
    }, 1000);
    setTimeout(() => bubbles?.classList.remove("hide"), 2400);
  };

  const openAboutUsModal = () => triggerBubbleTransition(() => setIsAboutUsOpen(true));
  const closeAboutUsModal = () => triggerBubbleTransition(() => setIsAboutUsOpen(false));

  const handleHelpClick = () => {
    const mailtoLink = `mailto:reethurithesh734@gmail.com?subject=Help `;
    window.location.href = mailtoLink;
  };

  return (
    <div className="flex flex-col min-h-screen text-gray-900 p-6 gradient-bg">
     <StarryBackground/>

      {/* Bubbles Transition */}
      <Bubbles />

      {/* Header (Dashboard Navbar) */}
      <div className="fixed top-0 left-0 w-full z-50">
      <Navbar className="bg-gray-800 py-4 shadow-lg navbar-glow">
      <NavbarBrand>
            <Image src="/lg.png" alt="Ukshati Logo" width={180} height={120} />
          </NavbarBrand>
          <NavbarContent className="hidden sm:flex gap-6" justify="center">
            <NavbarItem>
              <button onClick={openAboutUsModal} className="text-blue-400 hover:text-blue-300 transition-colors">About Us</button>
            </NavbarItem>
            <NavbarItem>
              <button onClick={handleHelpClick} className="text-blue-400 hover:text-blue-300 transition-colors">Help</button>
            </NavbarItem>
          </NavbarContent>
          <NavbarContent className="absolute left-1/2 transform -translate-x-1/2" justify="center">
            <NavbarItem>
              <h1 className="text-3xl sm:text-4xl font-bold text-white"></h1>
            </NavbarItem>
          </NavbarContent>
          <NavbarContent justify="end">
            {/* Empty for alignment */}
          </NavbarContent>
        </Navbar>
      </div>

      {/* About Us Modal with Floating Animation */}
      {isAboutUsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-md">
        <motion.div
            initial={{ rotateY: 90, scale: 0.5, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1, y: [0, -10, 0] }}
            transition={{ 
              rotateY: { type: "spring", stiffness: 100, damping: 20 },
              scale: { type: "spring", stiffness: 100, damping: 20 },
              opacity: { duration: 0.3 },
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="bg-white rounded-lg shadow-2xl p-8 max-w-3xl w-full mx-4 overflow-y-auto max-h-[90vh] transform-style-preserve-3d"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">About Us</h2>
            <p className="text-gray-700 mb-4">
              At Ukshati Technologies Pvt Ltd, we have created a platform for automating plant watering. Our mission is to simplify watering while reducing water waste. Our system features an internet-connected tap device that conserves energy, operating on alkaline batteries lasting 6+ months. The companion app notifies users about low batteries or empty water tanks, with watering history stored on our backend.
            </p>
            <p className="text-gray-700 mb-4">
              Our customizable solutions work for both large gardens and small balconies. We offer water tank-based systems for areas without direct water access, with optional aesthetic enclosures. Our waterproof models withstand various weather conditions, integrating with existing home water systems.
            </p>
            <button onClick={closeAboutUsModal} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow pt-24">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-lg w-full">
      <h1 className="text-4xl font-bold mb-4 animate-fade-in text-gray-700">
            Inventory Management System
          </h1>
          <p className="text-lg text-gray-700 mb-6 animate-fade-in">
            Welcome to the IMS Dashboard. Manage your inventory efficiently.
          </p>

          {/* Dual-Layer Gradient Button */}
          <motion.button
            onClick={() => router.push("/dashboard")}
            className="relative px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <span className="relative z-10">Go to Login</span>
            
            {/* Primary Gradient Layer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 opacity-0"
              initial={{ opacity: 0, x: "-100%" }}
              animate={{
                opacity: [100, 100, 100],
                x: ["-100%", "100%", "100%"]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Secondary Gradient Layer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-l from-green-400 to-blue-500 opacity-0"
              initial={{ opacity: 0, x: "100%" }}
              animate={{
                opacity: [100, 100, 100],
                x: ["100%", "-100%", "-100%"]
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4
              }}
            />
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-4 text-center fixed bottom-0 left-0 footer-animated footer-glow">
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