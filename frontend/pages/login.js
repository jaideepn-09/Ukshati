import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import StarryBackground from "@/components/StarryBackground";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter} from "react-icons/fa";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Clear previous session on component mount
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password.trim(),
          role: role.toLowerCase().trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      // Store authentication data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userRole", data.user.role); // Store role separately

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center">
      <StarryBackground />
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar className="backdrop-blur-sm py-4 shadow-lg">
        <NavbarBrand>
            <Link href="/">
              <Image 
                src="/lg.png" 
                alt="Ukshati Logo" 
                width={180} 
                height={120} 
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          </NavbarBrand>
          <NavbarContent justify="end"></NavbarContent>
        </Navbar>
      </div>
      {/* Enhanced Header */}
      
      {/* Main Login Container */}
      <div className="bg-white bg-opacity-10 p-8 rounded-lg shadow-xl w-96 transform transition duration-300 hover:scale-105 hover:shadow-[0px_4px_20px_rgba(0,255,255,0.5)] hover:backdrop-blur-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-gray-300 mt-2">Please login to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/50 rounded-lg border border-red-700">
            <p className="text-red-300 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            {/* Role Selection */}
            <div className="group relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all"
              >
                <option value="employee">Employee</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {/* Email Input */}
            <div className="group relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="group relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="mt-3 flex items-center">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="h-4 w-4 border-gray-300 rounded focus:ring-blue-500 text-blue-600"
                />
                <label htmlFor="showPassword" className="ml-2 text-sm text-gray-300">
                  Show Password
                </label>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
              loading 
                ? "bg-gray-600 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:shadow-lg"
            } text-white`}
          >
            {loading ? "Authenticating..." : "Login to System"}
          </button>
        </form>
      </div>

      {/* Enhanced Footer */}
       <Footer/>
    </div>
  );
}