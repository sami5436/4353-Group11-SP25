import { Routes, Route, useLocation } from "react-router-dom";
import History from "./pages/history"; // volunteer history
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Profile from "./pages/profile"; // volunteer profile
import AdminDashboard from "./pages/adminDashboard";
import AdminNotifications from "./pages/adminNotifications";
import VolunteerNotifications from "./pages/volunteerNotifications";
import Navbar from "./components/navbar";
import EventHistory from "./components/adminEventHistory";
import VolunteerAssignments from "./pages/volunteerAssignments"; // volunteer assignments
import AdminManageVolunteers from "./pages/adminManageVolunteers";
import AdminEventsReport from "./pages/adminEventsReport";
import Contactus from "./pages/contactus";
import Aboutus from "./pages/aboutus";
import EmailValidate from "./pages/EmailValidate";
import { ProfileProvider } from "./context/adminProfileContext";
import { VolunteerProfileProvider } from "./context/volunteerProfileContext";

function App() {
  const location = useLocation();
  const hideNavbarPaths = [
    "/admin/profile",
    "/volunteer/history",
    "/volunteer/profile",
    "/admin/manage-events",
    "/volunteer/assignments",
    "/admin/manage-volunteers",
    "/admin/notifications",
    "/volunteer/notifications",
    "/admin/events-report",
  ];

  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="email-validate" element={<EmailValidate />} />
        <Route path="contact-us" element={<Contactus />} />
        <Route path="about-us" element={<Aboutus />} />
        {/* <Route path="volunteer/profile" element={<Profile />} />
        <Route path="volunteer/history" element={<History />} />
        <Route path="volunteer/assignments" element={<VolunteerAssignments />} /> */}
        {/* <Route path="volunteer/notifications" element={<VolunteerNotifications />} /> */}

        <Route
          path="/admin/*"
          element={
            <ProfileProvider>
              <Routes>
                <Route path="profile" element={<AdminDashboard />} />
                <Route
                  path="manage-volunteers"
                  element={<AdminManageVolunteers />}
                />
                <Route path="manage-events" element={<EventHistory />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="events-report" element={<AdminEventsReport />} />
              </Routes>
            </ProfileProvider>
          }
        />

        <Route
          path="volunteer/*"
          element={
            <VolunteerProfileProvider>
              <Routes>
                <Route path="profile" element={<Profile />} />
                <Route path="history" element={<History />} />
                <Route path="assignments" element={<VolunteerAssignments />} />
                <Route path="notifications" element={<VolunteerNotifications />} />
              </Routes>
            </VolunteerProfileProvider>
          }
        />

      </Routes>
    </>
  );
}

export default App;