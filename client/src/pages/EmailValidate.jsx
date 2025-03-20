import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function EmailValidate() {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleChange = (e) => {
    // Only allow digits and limit to 6 characters
    const input = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(input);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate that the code is exactly 6 digits
    if (!/^\d{6}$/.test(verificationCode)) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsSubmitting(true);

    // For demo purposes, we'll simulate verification
    // In a real app, you would send this to your backend
    setTimeout(() => {
      setIsSubmitting(false);

      // Redirect to login page after "verification"
      navigate("/login");
    }, 2000);
  };

  return (
    <>
      <div className="absolute top-0 left-0 z-[-2] h-full w-full rotate-180 transform bg-gradient-to-b from-emerald-500 to-emerald-900"></div>
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[#F8F9FA] p-8 shadow-emerald-900/50 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Verify Your Email
          </h2>

          <p className="text-center text-gray-600 mb-6">
            We've sent a 6-digit verification code to
            <br />
            <span className="font-medium">{email}</span>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={handleChange}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition duration-300 cursor-pointer flex justify-center items-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Didn't receive the code?{" "}
                <button
                  type="button"
                  className="text-emerald-700 hover:underline"
                  onClick={() => {
                    // In a real app, this would trigger resending the code
                    alert("A new code has been sent.");
                  }}
                >
                  Resend
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EmailValidate;
