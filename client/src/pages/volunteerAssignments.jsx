import React, { useState, useEffect } from "react";
import axios from "axios";
import VolunteerNavbar from "../components/volunteerNavbar";
import { motion } from "framer-motion";
import { X } from "lucide-react";

function VolunteerAssignments() {
  const [isOpen, setIsOpen] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [assignedEvents, setAssignedEvents] = useState([]);
  const volunteerId = "volunteer-1"; // Set the volunteer ID dynamically based on login

  useEffect(() => {
    if (isOpen) {
      axios
        .get(`http://localhost:5001/api/volunteerAssignments?volunteerId=${volunteerId}`)
        .then((response) => {
          setAssignedEvents(response.data);
        })
        .catch((error) => {
          console.error("Error fetching assigned events:", error);
        });
    }
  }, [isOpen]);

  const handleClick = () => {
    setIsOpen(true);
    setTimeout(() => setShowEvents(true), 600);
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      <h2 className="text-3xl ml-76 mt-12 font-semibold">Find Your Assigned Events!</h2>
      <VolunteerNavbar />

      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 p-10 flex flex-col relative">
          <div className="flex justify-center items-end h-full pb-20 relative">
            {showEvents && (
              <motion.div
                className="absolute top-12 bg-white p-6 rounded-lg shadow-lg max-w-md w-100 text-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Assigned Events</h2>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowEvents(false);
                    }}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    <X size={24} className="cursor-pointer" />
                  </button>
                </div>

                <ul className="space-y-3">
                  {assignedEvents.length > 0 ? (
                    assignedEvents.map((event, index) => (
                      <motion.li
                        key={event.id}
                        className="p-3 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <p className="font-semibold">{event.name}</p>
                        <p className="text-sm text-gray-600">
                          {event.date} - {event.city}, {event.state}
                        </p>
                      </motion.li>
                    ))
                  ) : (
                    <p className="text-gray-600">No assigned events found.</p>
                  )}
                </ul>
              </motion.div>
            )}

            <motion.div
              className="relative w-40 h-40 top-24 cursor-pointer flex items-center justify-center"
              onClick={handleClick}
            >
              <div className="absolute w-full h-full bg-emerald-600 rounded-md flex items-center justify-center">
                <div className="absolute w-6 h-full bg-white rounded-md"></div>
              </div>

              <motion.div
                className="absolute w-44 h-12 bg-emerald-600 rounded-t-md top-0 flex items-center justify-center origin-left"
                animate={
                  isOpen
                    ? {
                        rotateZ: -45,
                        x: -20,
                        y: -20,
                      }
                    : {
                        rotateZ: 0,
                        x: 0,
                        y: 0,
                      }
                }
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="absolute w-6 h-full bg-white rounded-md"></div>
              </motion.div>

              <motion.div
                className="absolute top-[-30px] flex justify-center"
                animate={
                  isOpen
                    ? {
                        rotateZ: -45,
                        x: -20,
                        y: -20,
                      }
                    : {
                        rotateZ: 0,
                        x: 0,
                        y: 0,
                      }
                }
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VolunteerAssignments;
