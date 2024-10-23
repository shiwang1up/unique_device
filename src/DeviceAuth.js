import React, { useState, useEffect } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const DeviceAuth = () => {
  const [fingerprint, setFingerprint] = useState(null);
  const [email, setEmail] = useState(""); // Changed from username to email to match backend
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Generate the fingerprint for the device
    const initFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);
      } catch (error) {
        console.error("Error generating fingerprint:", error);
        setMessage("Error generating device fingerprint");
      }
    };

    initFingerprint();
  }, []);

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fingerprint || !email || !password) {
      setMessage("Please fill in all fields and wait for device verification");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://da-poc.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            deviceId: fingerprint, // Changed to match backend expectation
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage(data.message);
    } catch (error) {
      setMessage(error.message || "Error during registration");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!fingerprint || !email || !password) {
      setMessage("Please fill in all fields and wait for device verification");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://da-poc.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            deviceId: fingerprint, // Changed to match backend expectation
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store the token
      localStorage.setItem("authToken", data.token);
      setMessage("Login successful");
    } catch (error) {
      setMessage(error.message || "Error during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Device-Based Authentication</h2>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Register"}
          </button>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Login"}
          </button>
        </div>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded ${
            message.includes("Error") || message.includes("failed")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default DeviceAuth;
