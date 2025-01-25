import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <>
      <nav className="fixed top-0 left-0 w-full p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="text-xl font-bold text-black-400 hover:text-gray-500"
          >
            Group 11
          </Link>
          <ul className="flex space-x-9">
            <li>
              <Link to="/" className=" text-black-400 ">
                Home
              </Link>
            </li>
            <li>
              <Link to="login" className=" text-black hover:text-gray-500">
                Login
              </Link>
            </li>
            <li>
              <Link to="signup" className=" text-black hover:text-gray-500">
                Sign Up
              </Link>
            </li>
            <li>
              <Link to="profile" className=" text-black hover:text-gray-500">
                Profile Management
              </Link>
            </li>
            <li>
              <Link to="history" className=" ">
                History
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
