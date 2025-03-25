import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EditButton({ project, fetchProjects }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [userRole, setUserRole] = useState(""); //changed
  const [loggedInUserEmail, setLoggedInUserEmail] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedEmail = localStorage.getItem("userEmail") || "";

    console.log("Fetching stored email:", storedEmail);
    setUserRole(storedRole);
    setLoggedInUserEmail(storedEmail);

    if (project) {
      const formatDateForInput = (date) => {
        if (!date) return "";
        const parts = date.split("-");
        return parts.length === 3
          ? `${parts[2]}-${parts[1]}-${parts[0]}`
          : date;
      };

      setEditedProject({
        projectName: project?.pname || "",
        clientName: project?.cname || "",
        startDate: formatDateForInput(project?.start_date),
        endDate: formatDateForInput(project?.end_date),
        amount: project?.total_amount || "",
        comments: project?.comments || "",
      });
    }
  }, [project]);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole"); //changed

    console.log("Fetching stored email:", localStorage.getItem("userEmail"));
    setUserRole(localStorage.getItem("userRole") || "");

    setUserRole(storedRole);

    if (project) {
      const formatDateForInput = (date) => {
        if (!date) return "";
        const parts = date.split("-");
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD //changes
      };

      setEditedProject({
        projectName: project.pname || "",
        clientName: project.cname || "",
        startDate: formatDateForInput(project.start_date),
        endDate: formatDateForInput(project.end_date),
        amount: project.total_amount || "",
        comments: project.comments || "",
      });
    }
  }, [project]);

  const handleEditClick = () => {
    if (localStorage.getItem("userRole").toLowerCase() !== "admin") {
      //changes
      alert("Editing is only allowed for admin users.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setEditedProject({
      ...editedProject,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      // Reload values from localStorage
      const userRole = localStorage.getItem("userRole") || "";
      const loggedInUserEmail = localStorage.getItem("userEmail") || "";

      console.log("🔍 User Role:", userRole); // Debugging
      console.log("📧 Logged-in User Email:", loggedInUserEmail); // Debugging

      if (!loggedInUserEmail) {
        alert("User email not found. Please login again.");
        return;
      }

      if (!userRole) {
        alert("User role not found. Please login again.");
        return;
      }

      if (userRole.toLowerCase() !== "admin") {
        alert("Only admins can save changes.");
        return;
      }

      // Proceed with saving the project
      const response = await fetch("/api/updateProject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loggedInUserEmail, // Ensure email is passed correctly
          projectName: editedProject.projectName,
          clientName: editedProject.clientName,
          startDate: editedProject.startDate,
          endDate: editedProject.endDate,
          amount: editedProject.amount,
          comments: editedProject.comments,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update project");
      }

      alert(result.message || "Project updated successfully!");
      setIsModalOpen(false);

      if (fetchProjects) {
        fetchProjects(); // Refresh projects
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("❌ Error updating project:", error);
      alert("Error updating project: " + error.message);
    }
  };

  return (
    <>
      <button
        onClick={handleEditClick}
        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm text-sm"
      >
        Edit
      </button>

      <AnimatePresence>
        {isModalOpen && editedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative flex flex-col max-h-screen overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Edit Expense
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={editedProject.projectName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-500 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={editedProject.clientName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-500 text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={editedProject.startDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-500 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={editedProject.endDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-500 text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={editedProject.amount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-500 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comments
                  </label>
                  <textarea
                    name="comments"
                    value={editedProject.comments}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-500 text-gray-800"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
