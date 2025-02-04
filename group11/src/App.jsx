import { Routes, Route, useLocation } from "react-router-dom";
import History from "./pages/history";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Profile from "./pages/profile";
import AdminDashboard from "./pages/adminDashboard";
import Navbar from "./components/navbar";
import EventHistory from "./components/adminEventHistory";
function App() {
  const location = useLocation();
  const hideNavbarPaths = ["/admin/profile", "/volunteer/history","/volunteer/profile", "/admin/history"];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="volunteer/profile" element={<Profile />} />
        <Route path="admin/profile" element={<AdminDashboard />} />
        <Route path="volunteer/history" element={<History />} />
        <Route path="admin/history" element={<EventHistory />} />
      </Routes>
    </>
  );
}

export default App;
