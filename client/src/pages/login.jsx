import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all fields");
      return;
    }
 
    try {
      const response = await axios.post("https://four353-group11-sp25.onrender.com/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data && response.data.userId) {
        // Store ObjectId in a Cookie
        Cookies.set("userId", response.data.userId, { expires: 7, path: "/" }); // Expires in 7 days
        console.log("User ID stored in cookie:", response.data.userId);
      }

      // Redirect user
      navigate(response.data.redirectPath);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <>
      <div className="absolute top-0 left-0 z-[-2] h-full w-full rotate-180 transform bg-gradient-to-b from-emerald-500 to-emerald-900"></div>
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[#F8F9FA] p-8 shadow-emerald-900/50 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="**********"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition duration-300 cursor-pointer"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account yet?{" "}
            <Link to="/signup" className="text-emerald-700 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
