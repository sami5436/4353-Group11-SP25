import React, { useState } from "react";
import VolunteerNavbar from "../components/volunteerNavbar";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const assignedEvents = [
  {
    id: 1,
    name: "Community Cleanup",
    date: "2024-01-10",
    location: "Houston, TX",
  },
  { id: 2, name: "Food Drive", date: "2024-03-15", location: "Austin, TX" },
  {
    id: 3,
    name: "Animal Shelter Support",
    date: "2024-05-20",
    location: "Dallas, TX",
  },
];

function volunteerAssignments() {
  const [isOpen, setIsOpen] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  const handleClick = () => {
    setIsOpen(true);
    setTimeout(() => setShowEvents(true), 600);
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      <h2 className="text-3xl ml-76 mt-12 font-semibold">Find Your Assigned Events!</h2>
      {/* <h2 className="ml-76 mt-12 font-semibold">Click on the</h2> */}
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
                  {assignedEvents.map((event, index) => (
                    <motion.li
                      key={event.id}
                      className="p-3 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <p className="font-semibold">{event.name}</p>
                      <p className="text-sm text-gray-600">
                        {event.date} - {event.location}
                      </p>
                    </motion.li>
                  ))}
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

export default volunteerAssignments;