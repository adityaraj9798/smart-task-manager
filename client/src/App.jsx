import { useState } from "react";
import Tasks from "./pages/Tasks";
import Login from "./pages/Login";

function App() {
  const [auth, setAuth] = useState(
    !!localStorage.getItem("token")
  );

  return auth ? (
    <Tasks />
  ) : (
    <Login onAuth={() => setAuth(true)} />
  );
}

export default App;
