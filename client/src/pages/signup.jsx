import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    termsAgreed: false,
    role: "volunteer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setFormData((prevState) => ({
      ...prevState,
      role,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(formData.email)) {
      setError("Invalid email format");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError(
        "Password must be at least 8 characters long and contain uppercase, lowercase, and number"
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.termsAgreed) {
      setError("You must agree to the terms and conditions");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5001/api/auth/signup", formData);
      console.log(response.data);
      navigate("/email-validate", { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <>
      <div className="absolute top-0 left-0 z-[-2] h-full w-full rotate-180 transform bg-gradient-to-b from-emerald-500 to-emerald-900"></div>
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[#F8F9FA] p-8 shadow-emerald-900/50 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create your account</h2>

          <div className="flex items-center justify-center mb-6">
            <button
              onClick={() => handleRoleChange("volunteer")}
              className={`px-4 py-2 rounded-l-md ${formData.role === "volunteer" ? "bg-emerald-600 text-white" : "bg-gray-200 text-black cursor-pointer"}`}
            >
              Volunteer
            </button>
            <button
              onClick={() => handleRoleChange("admin")}
              className={`px-4 py-2 rounded-r-md ${formData.role === "admin" ? "bg-emerald-600 text-white" : "bg-gray-200 text-black cursor-pointer"}`}
            >
              Admin
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="**********"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <span className="text-gray-500">Hide</span>
                  ) : (
                    <span className="text-gray-500">Show</span>
                  )}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="**********"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <span className="text-gray-500">Hide</span>
                  ) : (
                    <span className="text-gray-500">Show</span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="termsAgreed"
                  checked={formData.termsAgreed}
                  onChange={handleChange}
                  className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="#" className="text-emerald-700 hover:underline">
                    terms and conditions
                  </a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition duration-300 cursor-pointer"
            >
              Sign up
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-emerald-700 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Signup;
