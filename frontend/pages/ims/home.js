"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaPlus, FaEye, FaEdit, FaTrash, FaUserPlus, FaCheck, FaUsers, FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import StarryBackground from "@/components/StarryBackground";

export default function Home() {
  const router = useRouter();
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: ""
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState({});
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const startTime = Date.now();
      const response = await fetch('/api/employees');
      
      console.log('Fetch response:', {
        status: response.status,
        timeTaken: `${Date.now() - startTime}ms`
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
  
      const data = await response.json();
      console.log('Received employees:', data.employees);
      
      if (!Array.isArray(data.employees)) {
        throw new Error('Invalid employee data format');
      }
  
      setEmployees(data.employees);
      setError(null);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const toggleEmployeeDetails = (employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };
  
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedRole = localStorage.getItem("userRole");
        
        if (!storedUser || !storedRole) {
          router.push("/ims/login");
          return;
        }
  
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser?.email) throw new Error("Invalid user data");
        
        setUserData({
          name: parsedUser.name,
          email: parsedUser.email,
          phone: parsedUser.phone || 'N/A'
        });
        
        setUserRole(storedRole.toLowerCase());
      } catch (error) {
        console.error("Session load error:", error);
        router.push("/ims/login");
      } } 
      loadUserData();}, [router]);

  
  const inventoryCards = [
    { 
      id: 1, 
      title: "Add Stock", 
      Icon: FaPlus, 
      colors: ["#1e40af", "#3b82f6", "#93c5fd", "#3b82f6", "#1e40af"], // Dark → Light → Dark
      route: "/ims/stocks", 
      image: "https://cdni.iconscout.com/illustration/premium/thumb/inventory-management-6114065-5059489.png" 
    },
    { 
      id: 2, 
      title: "View Stock", 
      Icon: FaEye, 
      colors: ["#065f46", "#10b981", "#6ee7b7", "#10b981", "#065f46"], // Dark → Light → Dark
      route: "/ims/view-stock", 
      image: "https://www.pngmart.com/files/8/Inventory-PNG-HD.png" 
    },
    { 
      id: 3, 
      title: "Update Stock",
      Icon: FaEdit, 
      colors: ["#854d0e", "#ca8a04", "#fde047", "#ca8a04", "#854d0e"], // Dark → Light → Dark
      route: "/ims/update-stock", 
      image: "https://png.pngtree.com/png-clipart/20230825/original/pngtree-inventory-control-vector-warehouse-industry-picture-image_8773876.png" 
    },
    { 
      id: 4, 
      title: "Inventory Spent", 
      Icon: FaTrash, 
      colors: ["#7f1d1d", "#dc2626", "#f87171", "#dc2626", "#7f1d1d"], // Dark → Light → Dark
      route: "/ims/inventory-spent", 
      image: "https://www.deskera.com/blog/content/images/2021/06/InventoryManagement_Hero@3x.png" 
    }
  ];

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create employee');
      }
  
      const newEmployee = await response.json();
      setEmployees(prev => [...prev, newEmployee]);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setFormData({ name: "", email: "", phone: "", role: "", password: "" });
      setShowEmployeeModal(false);
    } catch (error) {
      setError(error.message);
      console.error("Submission error:", error);
    } finally {
      setFormSubmitting(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    router.push("/ims/login");
  };

  return (
    <div 
      className="flex flex-col min-h-screen bg-cover text-black">
        <StarryBackground/>
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 z-50 shadow-lg"
        >
          <FaCheck className="text-xl" />
          <span>Account created successfully!</span>
        </motion.div>
      )}

      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 transition-all duration-200"
      >
        {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      <div className={`fixed inset-y-0 right-0 w-64 bg-gray-800 text-white shadow-lg transform transition-transform duration-200 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"} z-40`}>
        <div className="p-6">
          {/* Profile Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Profile</h2>
            <div className="flex items-center space-x-3">
              <FaUser className="text-2xl" />
              <div>
    <p className="text-sm font-medium">{userData?.name || 'Unknown User'}</p>
    <p className="text-xs text-gray-400">{userData?.email || 'No email'}</p>
    <p className="text-xs text-gray-400 capitalize">{userRole || 'unknown'}</p>
  </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 mb-6"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </button>

          {userRole === 'admin' &&(
            <>
              
              <button
                onClick={() => setShowEmployeeDetails(!showEmployeeDetails)}
                className="w-full flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 mb-4"
              >
                <FaUsers className="text-lg" />
                <span>Employee Details</span>
              </button>
              <button
                onClick={() => setShowEmployeeModal(true)}
                className="w-full flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 mb-4"
              >
                <FaUserPlus className="text-lg" />
                <span>Add Employee</span>
              </button>
               
              {showEmployeeDetails && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Employee List</h2>
                    <button 
                      onClick={fetchEmployees}
                      className="text-blue-400 text-sm hover:text-blue-300"
                    >
                      Refresh List
                    </button>
                  </div>

                  {loadingEmployees && (
                    <div className="flex items-center justify-center space-x-2 py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-gray-400 text-sm">Loading employees...</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-800/50 rounded-lg">
                      <p className="text-red-400 text-sm">Error: {error}</p>
                    </div>
                  )}

                  {!loadingEmployees && employees.length === 0 && !error && (
                    <div className="text-center py-6">
                      <p className="text-gray-400 mb-2">No employees found</p>
                      <button
                        onClick={fetchEmployees}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {!loadingEmployees && employees.length > 0 && !error && (
                    <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                      {employees.map((employee) => (
                        <div 
                          key={employee.id} 
                          className="border-b border-gray-700"
                        >
                          <motion.div
                            className="p-3 hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                            onClick={() => setExpandedEmployee(prev => 
                              prev === employee.id ? null : employee.id
                            )}
                            initial={false}
                          >
                            <span className="font-medium">{employee.name}</span>
                            <motion.span
                              animate={{ rotate: expandedEmployee === employee.id ? 180 : 0 }}
                              className="text-gray-400 text-sm"
                            >
                              ▼
                            </motion.span>
                          </motion.div>

                          <AnimatePresence initial={false}>
                            {expandedEmployee === employee.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-gray-800 px-4 pb-3"
                              >
                                <div className="space-y-2 pt-2">
                                  <div className="flex items-center text-sm">
                                    <span className="text-gray-300 break-all">{employee.email}</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <span className="text-gray-300">
                                      {employee.phone || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <span className="text-gray-300 capitalize">
                                      {employee.role}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center flex-grow p-6 pt-20">
        <h1 className="text-4xl font-bold mb-16 mt-16 text-center text-white">Inventory Management System</h1>

        <div className="w-full max-w-7xl px-4">
          <motion.div
            className="flex gap-4 h-[500px]"
            animate={{
              marginRight: isMenuOpen ? "16rem" : "0",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {inventoryCards.map((card) => (
              <motion.div
                key={card.id}
                className="relative rounded-2xl overflow-hidden cursor-pointer shadow-xl"
                initial={{ flex: 0.7 }}
                animate={{ 
                  flex: activeCard === card.id ? 2 : 0.7,
                  scale: activeCard === card.id ? 1.03 : 1 
                }}
                onHoverStart={() => setActiveCard(card.id)}
                onHoverEnd={() => setActiveCard(null)}
                onClick={() => router.push(card.route)}
                transition={{ 
                  type: "spring", 
                  stiffness: 260,
                  damping: 20
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(45deg, ${card.colors.join(', ')})`,
                    backgroundSize: "400% 400%"
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />

                <motion.div 
                  className="absolute inset-0 bg-black/20 transition-all duration-300"
                  style={{ 
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                  animate={{
                    opacity: activeCard === card.id ? 1 : 0
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <motion.h2 
                    className="text-2xl font-bold text-center whitespace-nowrap"
                    animate={{ 
                      fontSize: activeCard === card.id ? "2rem" : "1.5rem",
                      marginBottom: activeCard === card.id ? "1.5rem" : "1rem",
                      rotate: activeCard === card.id ? 0 : -90,
                      transformOrigin: "center"
                    }}
                  >
                    {card.title}
                  </motion.h2>
                  <motion.div
                    animate={{
                      opacity: activeCard === card.id ? 1 : 0
                    }}
                  >
                    <card.Icon className="text-4xl mb-4" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <footer className="w-full bg-gray-800 text-white py-4 text-center mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} Inventory System</p>
      </footer>

      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-8 rounded-xl w-96"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Add New Employee</h2>
            <form onSubmit={handleAddEmployee}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
        type="submit"
        disabled={formSubmitting}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-800 disabled:cursor-not-allowed"
      >
        {formSubmitting ? 'Creating...' : 'Create Account'}
      </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}