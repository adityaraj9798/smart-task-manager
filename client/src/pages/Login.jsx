import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("LOGIN CLICKED");

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE FULL:", res);
      console.log("LOGIN RESPONSE DATA:", res.data);

      // 🔴 IMPORTANT SAFETY CHECK
      if (!res.data || !res.data.token) {
        console.error("❌ TOKEN NOT FOUND IN RESPONSE");
        alert("Login failed: token missing");
        return;
      }

      // ✅ SAVE TOKEN
      localStorage.setItem("token", res.data.token);

      console.log(
        "✅ TOKEN SAVED:",
        localStorage.getItem("token")
      );

      // ✅ GO TO DASHBOARD
      navigate("/dashboard");

    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err.response?.data || err.message
      );
      alert("Login failed");
    }
  };

  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
