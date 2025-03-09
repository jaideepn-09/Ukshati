"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { 
  FaUsers, 
  FaBoxOpen, 
  FaMoneyBillWave, 
  FaFileInvoiceDollar, 
  FaFileContract, 
  FaPhone, 
  FaEnvelope, 
  FaChevronDown,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter
} from "react-icons/fa";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import Image from "next/image";

// Bubble Transition Component
const Bubbles = () => {
  return (
    <div id="bubbles">
      <div
        style={{ animationDuration: `1200ms`, background: "#8f44fd" }}
        className="bubbles__first"
      />
      <div
        style={{ animationDuration: `1200ms`, background: "#ffffff" }}
        className="bubbles__second"
      />
    </div>
  );
};

const AccordionItem = ({ title, children, isOpen, onClick }) => (
  <div className="w-full">
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-4 py-2 text-gray-100 bg-gray-700/50 rounded-lg"
    >
      <span className="text-sm font-medium">{title}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <FaChevronDown className="text-sm" />
      </motion.div>
    </button>
    <motion.div
      initial={false}
      animate={{ height: isOpen ? "auto" : 0 }}
      className="overflow-hidden"
    >
      <div className="px-4 pt-2 pb-4 text-sm text-gray-200">
        {children}
      </div>
    </motion.div>
  </div>
);

export default function Dashboard() {
  const features = [
    { 
      name: "CRM", 
      path: "/crm", 
      icon: <FaUsers className="text-5xl" />, 
      gradient: "bg-gradient-to-r from-red-400 to-orange-600", 
      description: "Manage customer relationships.",
      imageDescription: "Customer Relationship Overview",
      stats: { main: "7,209", secondary: "75" },
      filedBy: "nithin.10__ and others",
      accordion: [
        { title: "Customer Management", content: "Track customer interactions and history." },
        { title: "Analytics", content: "View customer engagement metrics and insights." }
      ],
      image: "https://img.freepik.com/free-vector/flat-customer-support-illustration_23-2148899114.jpg"
    },
    { 
      name: "Inventory", 
      path: "/ims/login", 
      icon: <FaBoxOpen className="text-5xl" />, 
      gradient: "bg-gradient-to-r from-green-400 to-teal-500", 
      description: "Track stock and supplies.",
      imageDescription: "Inventory Management System",
      stats: { main: "5,432", secondary: "89" },
      filedBy: "stock.manager__ and others",
      accordion: [
        { title: "Stock Levels", content: "Monitor real-time stock availability." },
        { title: "Supplies", content: "Manage and reorder supplies efficiently." }
      ],
      image: "https://img.freepik.com/premium-vector/warehouse-workers-check-inventory-levels-items-shelves-inventory-management-stock-control-vector-illustration_327176-1435.jpg"
    },
    { 
      name: "Expense", 
      path: "/expense", 
      icon: <FaMoneyBillWave className="text-5xl" />, 
      gradient: "bg-gradient-to-r from-red-400 to-pink-500", 
      description: "Monitor business expenses.",
      imageDescription: "Expense Tracking Dashboard",
      stats: { main: "3,876", secondary: "42" },
      filedBy: "finance.team__ and others",
      accordion: [
        { title: "Expense Tracking", content: "Track all business expenses in one place." },
        { title: "Reports", content: "Generate detailed expense reports." }
      ],
      image: "https://www.itarian.com/assets-new/images/time-and-expense-tracking.png" 
    },
    { 
      name: "Billing", 
      path: "/billing", 
      icon: <FaFileInvoiceDollar className="text-5xl" />, 
      gradient: "bg-gradient-to-r from-purple-400 to-indigo-500", 
      description: "Generate and manage invoices.",
      imageDescription: "Billing Management System",
      stats: { main: "9,123", secondary: "67" },
      filedBy: "billing.team__ and others",
      accordion: [
        { title: "Invoice Creation", content: "Create and customize invoices." },
        { title: "Payment Tracking", content: "Track payments and due dates." }
      ],
      image: "https://img.freepik.com/free-vector/invoice-concept-illustration_114360-2805.jpg"
    },
    { 
      name: "Quotation", 
      path: "/quotation", 
      icon: <FaFileContract className="text-5xl" />, 
      gradient: "bg-gradient-to-r from-orange-400 to-yellow-500", 
      description: "Create and send quotations.",
      imageDescription: "Quotation Management System",
      stats: { main: "4,567", secondary: "34" },
      filedBy: "sales.team__ and others",
      accordion: [
        { title: "Quotation Templates", content: "Use pre-built templates for quotations." },
        { title: "Client Management", content: "Manage client-specific quotations." }
      ],
      image: "https://png.pngtree.com/thumb_back/fh260/background/20221006/pngtree-money-concept-quotation-on-chalkboard-background-learn-investment-market-photo-image_22951928.jpg" 
    },
  ];

  const [flipped, setFlipped] = useState(Array(features.length).fill(false));
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isContactUsOpen, setIsContactUsOpen] = useState(false);

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

  const handleFlip = (index) => {
    setFlipped(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const openAboutUs = () => triggerBubbleTransition(() => setIsAboutUsOpen(true));
  const closeAboutUs = () => triggerBubbleTransition(() => setIsAboutUsOpen(false));
  const openContactUs = () => triggerBubbleTransition(() => setIsContactUsOpen(true));
  const closeContactUs = () => triggerBubbleTransition(() => setIsContactUsOpen(false));

  return (
    <div 
      className="flex flex-col min-h-screen bg-cover bg-center text-gray-900"
      style={{ 
        background: "linear-gradient(125deg, #0a0a0a 0%, #2d1b4e 29%, #1a0b2e 67%, #0a0a0a 100%)",
        backgroundSize: "200% 200%",
        animation: "gradientFlow 15s ease infinite"
      }}
    >
      <Bubbles />

      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar className="bg-gray-800 py-4 shadow-lg">
          <NavbarBrand>
            <Image src="/lg.png" alt="Ukshati Logo" width={180} height={120} />
          </NavbarBrand>
          <NavbarContent className="hidden sm:flex gap-6" justify="center">
            <NavbarItem>
              <button onClick={openAboutUs} className="text-blue-400 hover:text-blue-300 transition-colors">About Us</button>
            </NavbarItem>
            <NavbarItem>
              <button onClick={openContactUs} className="text-blue-400 hover:text-blue-300 transition-colors">Contact Us</button>
            </NavbarItem>
          </NavbarContent>
          <NavbarContent className="absolute left-1/2 transform -translate-x-1/2" justify="center">
            <NavbarItem>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Dashboard</h1>
            </NavbarItem>
          </NavbarContent>
          <NavbarContent justify="end"></NavbarContent>
        </Navbar>
      </div>

      {/* About Us Content */}
      {isAboutUsOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white">
          <div className="p-8 max-w-3xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">About Us</h2>
            <p className="text-gray-700 mb-4">
              At Ukshati Technologies Pvt Ltd, we have created a platform for automating plant watering. Our mission is to simplify watering while reducing water waste.
            </p>
            <p className="text-gray-700 mb-4">
              Our customizable solutions work for both large gardens and small balconies. We offer water tank-based systems for areas without direct water access, with optional aesthetic enclosures. Our waterproof models withstand various weather conditions, integrating with existing home water systems.
            </p>
            <button onClick={closeAboutUs} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Contact Us Content */}
      {isContactUsOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white">
          <div className="p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Contact Us</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <FaPhone className="text-blue-600 mr-3 text-xl" />
                <span className="text-gray-700">+91 7259439998</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-red-600 mr-3 text-xl" />
                <a href="mailto:ukshati365@gmail.com" className="text-gray-700 hover:text-blue-600">
                  ukshati365@gmail.com
                </a>
              </div>
            </div>
            <button onClick={closeContactUs} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow pt-24">
        <div className="mb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-8 w-full max-w-6xl px-4 perspective-1000 lg:h-[500px]">
          {features.map((feature, index) => (
            <Tilt
              key={index}
              tiltMaxAngleX={15}
              tiltMaxAngleY={15}
              perspective={1500}
              glareEnable={true}
              glareMaxOpacity={0.3}
              glareColor="#ffffff"
              glarePosition="all"
              glareBorderRadius="1rem"
              scale={1.05}
              transitionSpeed={800}
              tiltReverse={true}
              trackOnWindow={true}
              gyroscope={true}
              className={`relative ${
                index === 1 ? 'lg:h-[500px]' : 'h-[180px] sm:h-[240px]'
              } ${
                index === 0 ? 'lg:col-start-1 lg:row-start-1' :
                index === 1 ? 'lg:col-start-2 lg:row-start-1 lg:row-span-2' :
                index === 2 ? 'lg:col-start-3 lg:row-start-1' :
                index === 3 ? 'lg:col-start-1 lg:row-start-2' :
                'lg:col-start-3 lg:row-start-2'
              }`}
            >
              <motion.div
                className="cursor-pointer w-full h-full"
                onClick={() => handleFlip(index)}
                onMouseLeave={() => setFlipped(prev => {
                  const newFlipped = [...prev];
                  newFlipped[index] = false;
                  return newFlipped;
                })}
                whileHover={{ 
                  y: index === 1 ? -20 : -10, 
                  scale: index === 1 ? 1.02 : 1.05,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {/* Front Side */}
                <motion.div
                  className={`absolute w-full h-full flex flex-col items-center justify-center p-4 rounded-2xl shadow-2xl ${feature.gradient} border-2 border-white/20`}
                  initial={false}
                  animate={{ rotateY: flipped[index] ? 180 : 0, scale: flipped[index] ? 0.95 : 1 }}
                  transition={{ duration: 0.6, type: "spring", bounce: 0.25 }}
                  style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
                >
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                    {feature.icon}
                  </motion.div>
                  <h2 className="text-xl sm:text-2xl font-bold mt-4 text-white drop-shadow-md">
                    {feature.name}
                  </h2>
                </motion.div>

                {/* Back Side */}
                <motion.div
                  className={`absolute w-full h-full flex flex-col items-center justify-center p-4 rounded-2xl shadow-2xl ${feature.gradient} border-2 border-white/20`}
                  initial={false}
                  animate={{ rotateY: flipped[index] ? 0 : -180, scale: flipped[index] ? 1 : 0.95 }}
                  transition={{ duration: 0.6, type: "spring", bounce: 0.25 }}
                  style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
                >
                  <div className={`w-full ${index === 1 ? 'h-64' : 'h-32'} mb-4 relative`}>
                    <Image
                      src={feature.image}
                      alt={feature.imageDescription}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                  <Link href={feature.path} className="w-full flex justify-center">
                    <motion.button 
                      className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Access {feature.name}
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            </Tilt>
          ))}
        </div>
      </div>

      {/* Footer */}
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