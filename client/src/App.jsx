import { useState } from "react";
import Tasks from "./pages/Tasks";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [auth, setAuth] = useState(
    !!localStorage.getItem("token")
  );
  const [page, setPage] = useState("login"); // login | register

  if (auth) return <Tasks />;

  return page === "login" ? (
    <Login
      onAuth={() => setAuth(true)}
      goRegister={() => setPage("register")}
    />
  ) : (
    <Register
      onAuth={() => setAuth(true)}
      goLogin={() => setPage("login")}
    />
  );
}

export default App;
