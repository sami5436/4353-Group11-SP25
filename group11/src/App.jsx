import { Routes, Route, useLocation } from "react-router-dom";
import History from "./pages/history";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Profile from "./pages/profile";
import AdminDashboard from "./pages/adminDashboard";
import Navbar from "./components/navbar";


function App() {
  const location = useLocation();
  const hideNavbarPaths = ['/adminDashboard'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
    
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="profile" element={<Profile />} />
        <Route path="adminDashboard" element={<AdminDashboard />} />
        <Route path="history" element={<History />} />
      </Routes>
    </>
  );
}

export default App;
