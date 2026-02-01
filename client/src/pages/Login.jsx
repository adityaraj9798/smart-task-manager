import { useState } from "react";
import axios from "axios";

export default function Login({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");

    if (!email || !password) {
      setError("Email and password required");
      return;
    }

    try {
      console.log("LOGIN CLICKED", email, password);

      const res = await axios.post(
        "http://localhost:5001/api/auth/login",
        { email, password }
      );

      console.log("LOGIN RESPONSE", res.data);

      localStorage.setItem("token", res.data.token);

      onAuth(); // 🔥 THIS WAS THE MAIN THING
    } catch (err) {
      console.error("LOGIN ERROR", err);
      setError(
        err.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-semibold mb-4">Login</h2>

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-2 border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
