import React, { useState, useEffect } from "react";
import axios from "axios";
import VolunteerNavbar from "../components/volunteerNavbar";
import { X } from "lucide-react";

function History() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const volunteerId = "67cd130e640aa5caa84fac56";
    
    axios.get(`http://localhost:5001/api/volunteers/volunteer/${volunteerId}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Error fetching volunteer events:", err));
  }, []);
  const openModal = (event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <VolunteerNavbar />

      <div className="flex-1 ml-64 p-10">
        <div className="text-2xl text-gray-800 font-bold mb-6">
          Thank you for your help, John.
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-bold mb-6">Volunteer History</h2>

          <table className="w-full border border-gray-300 text-gray-800 bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr className="text-lg">
                <th className="py-3 px-4 border-b border-gray-300 text-left">Event Name</th>
                <th className="py-3 px-4 border-b border-gray-300 text-left">Date</th>
                <th className="py-3 px-4 border-b border-gray-300 text-left">Location</th>
                <th className="py-3 px-4 border-b border-gray-300 text-left">Status</th>
                <th className="py-3 px-4 border-b border-gray-300 text-left">Volunteered</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-100 cursor-pointer" onClick={() => openModal(event)}>
                    <td className="py-3 px-4 border-b border-gray-300">{event.name}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{event.date}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{event.address}, {event.city}, {event.state}</td>
                    <td className={`py-3 px-4 border-b border-gray-300 font-semibold ${
                      event.status === "Upcoming" ? "text-green-600" : "text-gray-600"
                    }`}>{event.status}</td>
                    <td className={`py-3 px-4 border-b border-gray-300 font-semibold ${
                      event.volunteered ? "text-blue-600" : "text-red-600"
                    }`}>{event.volunteered ? "Yes" : "No"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">No events available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedEvent.name}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-700 mb-2"><strong>Date:</strong> {selectedEvent.date}</p>
            <p className="text-gray-700 mb-2"><strong>Location:</strong> {selectedEvent.address},{selectedEvent.city}, {selectedEvent.state}</p>
            <p className="text-gray-700 mb-2"><strong>Status:</strong> {selectedEvent.status}</p>
            <p className="text-gray-700 mb-2"><strong>Volunteered:</strong> {selectedEvent.volunteered ? "Yes" : "No"}</p>
            <p className="text-gray-700"><strong>Description:</strong> {selectedEvent.description}</p>
            <div className="mt-6 flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
