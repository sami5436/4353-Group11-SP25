import React from "react";
import { Link } from "react-router-dom";
import { Home, ClipboardList, Calendar, LogOut } from "lucide-react";
import NotificationDropdown from "./notificationDropdown";

function VolunteerNavbar() {
  return (
    <div className="w-64 bg-gradient-to-b from-emerald-900 to-emerald-600 text-white h-screen fixed top-0 left-0">
      <div className="p-4 flex items-center space-x-2">
        <Link
          to="/"
          className="flex items-center space-x-2 text-gray-300 hover:text-white w-full hover:cursor-pointer"
        >
          <span className="text-xl font-bold">Group 11</span>
        </Link>
        <NotificationDropdown userRole="volunteer" />
      </div>

      <div className="p-4">
        <h2 className="text-3xl font-semibold">VOLUNTEER</h2>
        <h3 className="text-xl font-semibold text-[#82faa2] mb-7">DASHBOARD</h3>
        <nav className="space-y-8">
          <Link
            to="/volunteer/profile"
            className="flex items-center space-x-2 text-gray-300 hover:text-white"
          >
            <Home size={20} />
            <span>My Profile</span>
          </Link>



          <Link
            to="/volunteer/assignments"
            className="flex items-center space-x-2 text-gray-300 hover:text-white"
          >
            <ClipboardList size={20} />
            <span>Volunteer Assignments</span>
          </Link>
          <Link
            to="/volunteer/history"
            className="flex items-center space-x-2 text-gray-300 hover:text-white"
          >
            <Calendar size={20} />
            <span>Volunteer History</span>
          </Link>

          <Link
            to="/"
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

export default VolunteerNavbar;
