import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import StarryBackground from "@/components/StarryBackground";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { Link } from "@heroui/react";
import Image from "next/image";

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
        router.push("/ims/home");
      } else {
        router.push("/ims/home");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center">
      <StarryBackground/>
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
      <div className="bg-white bg-opacity-10 p-8 rounded-lg shadow-xl w-96 transform transition duration-300 hover:scale-105 hover:shadow-[0px_4px_20px_rgba(0,255,255,0.5)] hover:backdrop-blur-lg">
        <h2 className="text-3xl font-semibold text-center text-white mb-6">Login</h2>
        
        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-bold mb-2">Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded bg-white text-black"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-white text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded bg-white text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-bold mb-2">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-2 border border-gray-300 rounded bg-white text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="mt-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="mr-2"
              />
              <label htmlFor="showPassword" className="text-white text-sm">Show Password</label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white p-3 rounded-md font-semibold transition ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:from-teal-500 hover:to-blue-600"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
       <footer className="w-full backdrop-blur-sm text-white py-4 text-center fixed bottom-0 left-0">
              <ul className="example-1">
                <li className="icon-content">
                  <a 
                    href="https://www.facebook.com/ukshati/" 
                    className="link" 
                    data-social="facebook"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FaFacebook className="text-2xl" />
                    <span className="tooltip">Facebook</span>
                  </a>
                </li>
                <li className="icon-content">
                  <a 
                    href="https://www.instagram.com/ukshati/" 
                    className="link" 
                    data-social="instagram"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FaInstagram className="text-2xl" />
                    <span className="tooltip">Instagram</span>
                  </a>
                </li>
                <li className="icon-content">
                  <a 
                    href="https://www.linkedin.com/company/ukshati-technologies/" 
                    className="link" 
                    data-social="linkedin"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin className="text-2xl" />
                    <span className="tooltip">LinkedIn</span>
                  </a>
                </li>
                <li className="icon-content">
                  <a 
                    href="https://twitter.com/ukshati/" 
                    className="link" 
                    data-social="twitter"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FaTwitter className="text-2xl" />
                    <span className="tooltip">Twitter</span>
                  </a>
                </li>
              </ul>
              <p className="text-sm mt-4">Contact: +91 7259439998 | Email: ukshati365@gmail.com</p>
            </footer>
      
            <style jsx global>{`
              /* Original Button Styles */
              .next-button {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50px;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
              }
      
              .arrow-container {
                display: inline-block;
                overflow: hidden;
                width: 0;
                transition: all 0.3s ease;
              }
      
              .arrow-icon {
                transform: translateX(-10px);
                opacity: 0;
                transition: all 0.3s ease;
              }
      
              .next-button:hover .arrow-container {
                width: 24px;
              }
      
              .next-button:hover .arrow-icon {
                transform: translateX(0);
                opacity: 1;
              }
      
              .next-button__line {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background: rgba(255,255,255,0.3);
                transform: scaleX(0);
                transform-origin: right;
                transition: transform 0.3s ease;
              }
      
              .next-button:hover .next-button__line {
                transform: scaleX(1);
                transform-origin: left;
              }
      
              /* Updated Footer Styles */
              .example-1 {
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #000;
                border-radius: 30px;
                padding: 10px;
                height: 60px;
                width: 300px;
                margin: 0 auto;
              }
      
              .icon-content {
                margin: 0 10px;
                position: relative;
              }
      
              .tooltip {
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #fff;
                color: #000;
                padding: 6px 10px;
                border-radius: 5px;
                opacity: 0;
                visibility: hidden;
                font-size: 14px;
                transition: all 0.3s ease;
              }
      
              .icon-content:hover .tooltip {
                opacity: 1;
                visibility: visible;
                top: -50px;
              }
      
              .link {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                color: #fff;
                background-color: #000;
                transition: all 0.3s ease-in-out;
              }
      
              .link:hover {
                box-shadow: 3px 2px 45px 0px rgba(0,0,0,0.12);
              }
      
              .link[data-social="facebook"]:hover { color: #1877f2; }
              .link[data-social="instagram"]:hover { color: #e4405f; }
              .link[data-social="linkedin"]:hover { color: #0a66c2; }
              .link[data-social="twitter"]:hover { color: #1da1f2; }
            `}</style>
    </div>
  );
}