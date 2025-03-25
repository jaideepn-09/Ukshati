import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import StarryBackground from "@/components/StarryBackground";
import { FiArrowUp } from "react-icons/fi";
import BackButton from "@/components/BackButton";
import { Scroll } from "lucide-react";
import ScrollToTopButton from "@/components/scrollup";

export default function AddExpense() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [comments, setComments] = useState("");
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id) {
      setEmployeeId(user.id); // Autofill employeeId from logged-in user
    } else {
      setMessage("User not logged in. Please log in first.");
      router.push("/expense/login"); // Redirect to login if no user found
    }
  }, [router]);

  useEffect(() => {
    if (projectStatus) {
      fetch(`/api/projects?status=${projectStatus}`)
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then((data) => setProjects(data))
        .catch((err) => {
          console.error("Error fetching projects:", err);
          setProjects([]);
        });
    } else {
      setProjects([]);
    }
  }, [projectStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/addExpense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, employeeId, projectId, amount, comments }),
    });
    const data = await response.json();
    setMessage(
      response.status === 201
        ? `Expense added successfully with ID: ${data.expenseId}`
        : data.message || "Failed to add expense"
    );
  };

  return (
    <>
    <div>
    <BackButton route="/expense/home" Icon={FiArrowUp} />
    
      <div className="min-h-screen flex justify-center items-center relative bg-cover bg-center">
        <StarryBackground />

        {/* Scroll to Top Button */}
        <ScrollToTopButton/>
        {/* Glass Card */}
        <div className="glass-card w-full mb-14 max-w-md p-8 rounded-3xl text-center space-y-6 bg-white bg-opacity-10 backdrop-blur-lg border border-gray-200 border-opacity-20">
          <h1 className="text-4xl font-extrabold text-white add-expense-heading">
            Add Expense
          </h1>

          <form
            className="add-expense-form flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col">
              <label className="text-white font-semibold">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-gray-100 bg-opacity-50 text-white border border-gray-300 focus:border-blue-500 focus:bg-opacity-70"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-white font-semibold">Employee ID:</label>
              <input
                type="number"
                value={employeeId}
                readOnly // Make it read-only since it's autofilled
                required
                className="w-full p-3 rounded-lg bg-gray-300 bg-opacity-50 text-white border border-gray-300 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-white font-semibold">
                Project Status:
              </label>
              <select
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-gray-100 bg-opacity-50 text-white border border-gray-300 focus:border-blue-500 focus:bg-opacity-70"
              >
                <option value="">Select Status</option>
                <option value="Ongoing">Ongoing</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-white font-semibold">Project:</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                disabled={!projectStatus}
                className="w-full p-3 rounded-lg bg-gray-100 bg-opacity-50 text-white border border-gray-300 focus:border-blue-500 focus:bg-opacity-70 disabled:bg-gray-400 disabled:bg-opacity-50"
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.pid} value={project.pid}>
                    {project.pname} (ID: {project.pid})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-white font-semibold">Amount:</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-gray-100 bg-opacity-50 text-white border border-gray-300 focus:border-blue-500 focus:bg-opacity-70"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-white font-semibold">Comments:</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-100 bg-opacity-50 text-white border border-gray-300 focus:border-blue-500 focus:bg-opacity-70"
              />
            </div>
            <button
              type="submit"
              className="glass-btn bg-gradient-to-br from-blue-400 to-blue-300 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 rounded-xl shadow-md transition-all"
            >
              Add Expense
            </button>
          </form>

          {message && <p className="text-white mt-4">{message}</p>}
        </div>
      </div>
      </div>
      {/* Embedded CSS */}
      <style jsx>{`
        /* Glass Card */
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Glass Button */
        .glass-btn {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
        }

        /* Form Heading */
        .add-expense-heading {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          text-align: center;
          margin-bottom: 25px;
          position: relative;
        }

        .add-expense-heading::after {
          content: "";
          display: block;
          width: 60px;
          height: 4px;
          background: linear-gradient(90deg, #007bff, #00c6ff);
          margin: 10px auto 0;
          border-radius: 2px;
        }

        /* Form Fields */
        .add-expense-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .add-expense-form label {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 5px;
        }

        .add-expense-form input,
        .add-expense-form textarea,
        .add-expense-form select {
          width: 100%;
          padding: 12px;
          font-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: black;
          transition: all 0.3s ease;
        }

        .add-expense-form input:focus,
        .add-expense-form textarea:focus,
        .add-expense-form select:focus {
          border-color: #60a5fa;
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 8px rgba(0, 123, 255, 0.2);
          outline: none;
        }

        .add-expense-form textarea {
          resize: vertical;
          min-height: 100px;
        }

        .add-expense-form select:disabled {
          background: rgba(255, 255, 255, 0.05);
          color: #a0aec0;
          cursor: not-allowed;
        }

        /* Submit Button */
        .add-expense-form button {
          background: linear-gradient(135deg, #007bff, #00c6ff);
          color: white;
          font-size: 16px;
          font-weight: 600;
          padding: 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
        }

        .add-expense-form button:hover {
          background: linear-gradient(135deg, #0056b3, #0099cc);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 123, 255, 0.3);
        }

        .add-expense-form button:active {
          transform: translateY(0);
          box-shadow: 0 3px 10px rgba(0, 123, 255, 0.3);
        }
      `}</style>
    </>
  );
}
