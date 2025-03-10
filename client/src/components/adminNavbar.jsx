import React from "react";
import { Link } from "react-router-dom";
import { Home, Users, Calendar, ClipboardList, LogOut, BarChart2 } from "lucide-react";
import NotificationDropdown from "./notificationDropdown";
import { useProfile } from "../context/adminProfileContext";

function AdminNavbar() {
  const { profileData } = useProfile();
  const fullySignedUp = profileData.fullySignedUp;

  return (
    <div className="w-64 bg-gradient-to-b from-emerald-900 to-emerald-600 text-white h-screen fixed top-0 left-0">
      <div className="p-4 flex items-center space-x-2">
        <Link
          to="/"
          className="flex items-center space-x-2 text-gray-300 hover:text-white w-full hover:cursor-pointer"
        >
          <span className="text-xl font-bold">Group 11</span>
        </Link>
        <NotificationDropdown userRole="admin" />
      </div>

      <div className="p-4">
        <h2 className="text-3xl font-semibold">MANAGEMENT</h2>
        <h3 className="text-xl font-semibold text-[#82faa2] mb-7">DASHBOARD</h3>
        <nav className="space-y-8">
          <Link
            to="/admin/profile"
            className="flex items-center space-x-2 text-gray-300 hover:text-white"
          >
            <Home size={20} />
            <span>My Profile</span>
          </Link>

          {fullySignedUp ? (
            <>
              <Link
                to="/admin/manage-volunteers"
                className="flex items-center space-x-2 text-gray-300 hover:text-white"
              >
                <Users size={20} />
                <span>Manage Volunteers</span>
              </Link>

              <Link
                to="/admin/manage-events"
                className="flex items-center space-x-2 text-gray-300 hover:text-white"
              >
                <Calendar size={20} />
                <span>Manage Events</span>
              </Link>

              <Link
                to="/admin/events-report"
                className="flex items-center space-x-2 text-gray-300 hover:text-white"
              >
                <BarChart2 size={20} />
                <span>Events Report</span>
              </Link>
          </>
          ) : (
            <p className="text-sm text-gray-300">Complete your profile to unlock features.</p>
          )}

          <Link
            to="/logout"
            className="flex items-center space-x-2 text-gray-300 hover:text-white"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default AdminNavbar;
