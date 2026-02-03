import { useState } from "react";
import axios from "axios";

export default function Register({ onAuth, goLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");

    if (!name || !email || !password) {
      setError("All fields required");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/register",
        { name, email, password }
      );

      localStorage.setItem("token", res.data.token);
      onAuth(); // ✅ login ho jayega after register
    } catch (err) {
      setError(
        err.response?.data?.message || "Register failed"
      );
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-semibold mb-4">Register</h2>

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <input
          placeholder="Name"
          className="w-full mb-2 border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          Register
        </button>

        <p
          onClick={goLogin}
          className="text-sm text-blue-600 mt-3 cursor-pointer text-center"
        >
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}
