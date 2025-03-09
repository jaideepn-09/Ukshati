"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaPlus, FaEye, FaEdit, FaTrash, FaUserPlus, FaCheck, FaUsers, FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";

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
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState(null);

  const inventoryCards = [
    { id: 1, title: "Add Stock", Icon: FaPlus, color: "bg-blue-600", route: "/ims/stocks" },
    { id: 2, title: "View Stock", Icon: FaEye, color: "bg-green-600", route: "/ims/view-stock" },
    { id: 3, title: "Update Stock", Icon: FaEdit, color: "bg-yellow-600", route: "/ims/update-stock" },
    { id: 4, title: "Inventory Spent", Icon: FaTrash, color: "bg-red-600", route: "/ims/inventory-spent" }
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      router.push('/ims/login');
    } else {
      setLoggedInUser(user);
      if (user.role === 'admin') {
        fetchEmployees();
      }
    }
  }, []);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Server returned invalid response format');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch employees');
      }

      // Handle different response structures
      const employeeData = Array.isArray(data) ? data : data.employees;

      if (!Array.isArray(employeeData)) {
        throw new Error('Invalid employee data structure received');
      }

      // Validate employee object structure
      const isValidData = employeeData.every(emp => 
        typeof emp?.id === 'number' &&
        typeof emp?.name === 'string' &&
        typeof emp?.email === 'string' &&
        typeof emp?.role === 'string'
      );

      if (!isValidData) {
        throw new Error('Received invalid employee data format');
      }

      setEmployees(employeeData);
    } catch (error) {
      console.error('Employee fetch error:', error);
      setError(error.message);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create employee');
      }

      setFormData({ name: "", email: "", phone: "", role: "", password: "" });
      setShowEmployeeModal(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      fetchEmployees();
    } catch (error) {
      console.error('Error adding employee:', error);
      setError(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push("/dashboard");
  };

  if (!loggedInUser) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Success Message */}
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

      {/* Hamburger Menu */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 transition-all duration-200"
      >
        {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* Right Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-64 bg-gray-800 text-white shadow-lg transform transition-transform duration-200 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Profile</h2>
            <div className="flex items-center space-x-3">
              <FaUser className="text-2xl" />
              <div>
                <p className="text-sm font-medium">{loggedInUser.name}</p>
                <p className="text-xs text-gray-400">{loggedInUser.email}</p>
                <p className="text-xs text-gray-400 capitalize">{loggedInUser.role}</p>
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

          {loggedInUser.role === 'admin' && (
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
                  <h2 className="text-lg font-semibold mb-4">Employee List</h2>
                  <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                    {loadingEmployees ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                        <p className="text-sm mt-2">Loading employees...</p>
                      </div>
                    ) : error ? (
                      <div className="p-2 text-red-400 text-sm">{error}</div>
                    ) : employees.length === 0 ? (
                      <div className="p-2 text-gray-400 text-sm">No employees found</div>
                    ) : (
                      employees.map((employee) => (
                        <div key={employee.id} className="p-2 hover:bg-gray-700 rounded-lg">
                          <p className="text-sm font-medium">{employee.name}</p>
                          <p className="text-xs text-gray-400">{employee.email}</p>
                          {employee.phone && <p className="text-xs text-gray-400">{employee.phone}</p>}
                          <p className="text-xs text-gray-400 capitalize">{employee.role}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center flex-grow p-6 pt-20">
        <h1 className="text-4xl font-bold mb-12 text-center">Inventory Management System</h1>

        {/* Accordion-Style Cards */}
        <div className="w-full max-w-7xl px-4">
          <div className="flex gap-4 h-[500px]">
            {inventoryCards.map((card) => (
              <motion.div
                key={card.id}
                className={`relative ${card.color} rounded-2xl overflow-hidden cursor-pointer shadow-xl`}
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
                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <card.Icon className="text-4xl mb-4" />
                  <motion.h2 
                    className="text-xl font-bold text-center"
                    animate={{ 
                      fontSize: activeCard === card.id ? "1.5rem" : "1.1rem",
                      marginBottom: activeCard === card.id ? "1.5rem" : "1rem"
                    }}
                  >
                    {card.title}
                  </motion.h2>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-800 text-white py-4 text-center mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} Inventory System</p>
      </footer>

      {/* Add Employee Modal */}
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}