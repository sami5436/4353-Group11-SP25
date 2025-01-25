import { Routes, Route } from 'react-router-dom';
import History from './pages/history';
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import Profile from './pages/profile';
import Navbar from './components/navbar';
function App() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="profile" element={<Profile />} />
        <Route path="history" element={<History />} />
      </Routes>
    </>
  );
}

export default App;