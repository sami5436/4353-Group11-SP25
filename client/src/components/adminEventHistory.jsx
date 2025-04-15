import React, { useState, useEffect } from "react";
import AdminNavbar from "./adminNavbar";
import Cookies from "js-cookie";

const EventHistory = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editedEvent, setEditedEvent] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState({});
  const [eventHistory, setEventHistory] = useState([]);

  const API_BASE_URL = "http://localhost:5001/api";

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();

      const transformedData = data.map((event) => ({
        id: event._id,
        eventName: event.name,
        date: event.date,
        street: event.address,
        city: event.city,
        state: event.state,
        zipCode: event.zipCode || "", // Add zipCode field with default empty string
        status: event.status,
        urgency: event.urgency || "Medium", // Default if not provided
        skills: event.skills || [], // Ensure skills is always an array
        description: event.description,
        volunteers: event.volunteers || [],
      }));

      setEventHistory(transformedData);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const newEvent = {
    eventName: "",
    date: "",
    street: "",
    city: "",
    state: "",
    zipCode: "", // Add zipCode field to the new event template
    status: "Upcoming",
    urgency: "Medium",
    skills: [],
    description: "",
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEditedEvent({ ...event });
    setIsCreating(false);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(newEvent);
    setEditedEvent({ ...newEvent });
    setIsCreating(true);
  };

  const handleClose = () => {
    setSelectedEvent(null);
    setEditedEvent(null);
    setIsCreating(false);
    setErrors({});
  };

  const handleEventChange = (field, value) => {
    setEditedEvent((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear the error message when the user types something
    if (value.trim !== undefined && value.trim() !== "") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: null,
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const requiredFields = [
      "eventName",
      "date",
      "street",
      "city",
      "state",
      "zipCode", // Add zipCode to required fields
      "status",
      "urgency",
    ];
    let newErrors = {};

    // Check required fields
    requiredFields.forEach((field) => {
      if (!editedEvent[field] || editedEvent[field].trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    // Check if at least one skill is selected
    if (editedEvent.skills.length === 0) {
      newErrors.skills = "At least one skill must be selected";
    }

    // If errors exist, update state and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Prepare data for backend format - ensure consistent naming
      const eventData = {
        name: editedEvent.eventName,
        date: editedEvent.date,
        city: editedEvent.city,
        state: editedEvent.state,
        zipCode: editedEvent.zipCode, // Add zipCode to eventData
        address: editedEvent.street,
        status: editedEvent.status,
        urgency: editedEvent.urgency,
        description: editedEvent.description,
        skills: editedEvent.skills,
        volunteers: editedEvent.volunteers || [],
      };

      // Log request details for debugging
      console.log(
        "Saving event:",
        isCreating ? "Creating new" : `Updating ID: ${editedEvent.id}`
      );
      console.log("Event data:", eventData);

      // If creating a new event
      if (isCreating) {
        const response = await fetch(`${API_BASE_URL}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to create event: ${response.status} ${response.statusText}`
          );
        }

        // Refresh events list
        fetchEvents();
      } else {
        // Update existing event
        const response = await fetch(
          `${API_BASE_URL}/events/${editedEvent.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(eventData),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to update event: ${response.status} ${response.statusText}`
          );
        }

        // Refresh events list
        fetchEvents();
      }

      handleClose();
      window.location.reload();
    } catch (error) {
      console.error("Error saving event:", error);
      // Display error message to user
      setErrors({
        submit: `Failed to save event: ${error.message}`,
      });
    }
  };

  // For adding volunteers to events
  const addVolunteerToEvent = async (
    eventId,
    volunteerName,
    volunteerEmail
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/addVolunteer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          volunteerName,
          volunteerEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add volunteer");
      }

      // Refresh events to get updated volunteer list
      fetchEvents();
    } catch (error) {
      console.error("Error adding volunteer:", error);
    }
  };

  const containerStyle = {
    width: "100%",
    height: "400px",
  };

  // Default center of the US
  const defaultCenter = { lat: 39.8283, lng: -98.5795 };

  const availableSkills = [
    "Arts & Crafts",
    "Language Translation",
    "First Aid & CPR",
    "Manual Labor",
    "Public Speaking",
    "Event Coordination",
    "Teaching",
    "Food Services",
    "Technical Support",
  ];

  const EventsMap = ({ events }) => {
    // Add fallback coordinates for demo purposes
    // In a real application, you would geocode the addresses to get lat/lng
    const eventsWithCoordinates = events.map((event, index) => ({
      ...event,
      // Mock coordinates - in real app, you would geocode the address
      latitude: event.latitude || 39.8283 + index * 0.5,
      longitude: event.longitude || -98.5795 + index * 0.5,
    }));


  };

  return (
    <div className="flex">
      {/* Main content */}
      <div className="p-6 relative ml-[260px] w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold mb-6">Event History</h2>
          <button
            onClick={handleCreateEvent}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center cursor-pointer"
          >
            + Create New Event
          </button>
        </div>

        <EventsMap events={eventHistory} />

        {/* Table without unnecessary margins */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <table className="w-full border border-gray-200 shadow-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Event Name</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Street</th>
                <th className="p-3 text-left">City</th>
                <th className="p-3 text-left">State</th>
                <th className="p-3 text-left">Zip Code</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Volunteers</th>
              </tr>
            </thead>
            <tbody>
              {eventHistory.map((event, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <td className="p-3">{event.eventName}</td>
                  <td className="p-3">{event.date}</td>
                  <td className="p-3">{event.street}</td>
                  <td className="p-3">{event.city}</td>
                  <td className="p-3">{event.state}</td>
                  <td className="p-3">{event.zipCode}</td>
                  <td
                    className={`p-3 ${
                      event.status === "Completed"
                        ? "text-green-700"
                        : event.status === "Upcoming"
                          ? "text-yellow-500"
                          : event.status === "Cancelled"
                            ? "text-red-600"
                            : ""
                    }`}
                  >
                    {event.status}
                  </td>
                  <td className="p-3">
                    {event.volunteers ? event.volunteers.length : 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Centering Fix */}
        {selectedEvent && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {isCreating ? "Create New Event" : "Edit Event"}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-lg text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                >
                  ×
                </button>
              </div>

              {/* Form */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={editedEvent.eventName}
                    onChange={(e) =>
                      handleEventChange("eventName", e.target.value)
                    }
                    className={`w-full px-3 py-2 border ${
                      errors.eventName ? "border-red-500" : "border-gray-300"
                    } rounded-md`}
                  />
                  {errors.eventName && (
                    <p className="text-red-500 text-sm">{errors.eventName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editedEvent.date}
                    onChange={(e) => handleEventChange("date", e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      errors.date ? "border-red-500" : "border-gray-300"
                    } rounded-md`}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm">{errors.date}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street
                  </label>
                  <input
                    type="text"
                    value={editedEvent.street}
                    onChange={(e) =>
                      handleEventChange("street", e.target.value)
                    }
                    className={`w-full px-3 py-2 border ${
                      errors.street ? "border-red-500" : "border-gray-300"
                    } rounded-md`}
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm">{errors.street}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editedEvent.city}
                    onChange={(e) => handleEventChange("city", e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    } rounded-md`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={editedEvent.state}
                    onChange={(e) => handleEventChange("state", e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      errors.state ? "border-red-500" : "border-gray-300"
                    } rounded-md`}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm">{errors.state}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={editedEvent.zipCode}
                    onChange={(e) => handleEventChange("zipCode", e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      errors.zipCode ? "border-red-500" : "border-gray-300"
                    } rounded-md`}
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-sm">{errors.zipCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editedEvent.status}
                    onChange={(e) =>
                      handleEventChange("status", e.target.value)
                    }
                    className={`w-full px-3 py-2 border ${
                      errors.status ? "border-red-500" : "border-gray-300"
                    } rounded-md`}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  {errors.status && (
                    <p className="text-red-500 text-sm">{errors.status}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Skills
                  </label>

                  <div className="mb-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a new skill..."
                        id="newSkill"
                        className={`flex-1 px-3 py-2 border ${
                          errors.skills ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.target.value.trim()) {
                            e.preventDefault();
                            if (
                              !editedEvent.skills.includes(
                                e.target.value.trim()
                              )
                            ) {
                              handleEventChange("skills", [
                                ...editedEvent.skills,
                                e.target.value.trim(),
                              ]);
                            }
                            e.target.value = "";
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById("newSkill");
                          if (input.value.trim()) {
                            if (
                              !editedEvent.skills.includes(input.value.trim())
                            ) {
                              handleEventChange("skills", [
                                ...editedEvent.skills,
                                input.value.trim(),
                              ]);
                            }
                            input.value = "";
                          }
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div
                    className={`space-y-2 border ${
                      errors.skills ? "border-red-500" : "border-gray-300"
                    } rounded-md p-3 max-h-32 overflow-y-auto`}
                  >
                    {availableSkills.map((skill) => (
                      <div key={skill} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`skill-${skill}`}
                          checked={editedEvent.skills.includes(skill)}
                          onChange={(e) => {
                            const updatedSkills = e.target.checked
                              ? [...editedEvent.skills, skill]
                              : editedEvent.skills.filter((s) => s !== skill);
                            handleEventChange("skills", updatedSkills);
                          }}
                          className="h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                        />
                        <label
                          htmlFor={`skill-${skill}`}
                          className="text-sm text-gray-700"
                        >
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>

                  {editedEvent.skills.length > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Selected Skills
                        </span>
                        <button
                          onClick={() => handleEventChange("skills", [])}
                          className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editedEvent.skills.map((skill) => (
                          <div
                            key={skill}
                            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-emerald-100 text-emerald-800 rounded-md"
                          >
                            <span>{skill}</span>
                            <button
                              onClick={() => {
                                const updatedSkills = editedEvent.skills.filter(
                                  (s) => s !== skill
                                );
                                handleEventChange("skills", updatedSkills);
                              }}
                              className="text-emerald-600 hover:text-emerald-800"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.skills && (
                    <p className="text-red-500 text-sm">{errors.skills}</p>
                  )}
                </div>

                {/* Display custom skills section */}
                {editedEvent.skills &&
                  editedEvent.skills.some(
                    (skill) => !availableSkills.includes(skill)
                  ) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Skills
                      </label>
                      <div className="border border-gray-300 rounded-md p-3 max-h-32 overflow-y-auto">
                        {editedEvent.skills
                          .filter((skill) => !availableSkills.includes(skill))
                          .map((skill, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-1"
                            >
                              <span className="text-sm">{skill}</span>
                              <button
                                onClick={() => {
                                  const updatedSkills =
                                    editedEvent.skills.filter(
                                      (s) => s !== skill
                                    );
                                  handleEventChange("skills", updatedSkills);
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={editedEvent.urgency}
                    onChange={(e) =>
                      handleEventChange("urgency", e.target.value)
                    }
                    className={`w-full px-3 py-2 border ${
                      errors.urgency ? "border-red-500" : "border-gray-300"
                    } rounded-md`}
                    required
                  >
                    <option value="Select Urgency" hidden>
                      Select urgency
                    </option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  {errors.urgency && (
                    <p className="text-red-500 text-sm">{errors.urgency}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editedEvent.description}
                    onChange={(e) =>
                      handleEventChange("description", e.target.value)
                    }
                    className={`w-full px-3 py-2 border ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    } rounded-md min-h-20`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  )}
                </div>

                {/* Display volunteers if editing an existing event */}
                {!isCreating && editedEvent.volunteers && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Volunteers ({editedEvent.volunteers.length})
                    </label>
                    <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                      {editedEvent.volunteers &&
                      editedEvent.volunteers.length > 0 ? (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-1">Name</th>
                              <th className="text-left p-1">Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editedEvent.volunteers.map((volunteer, idx) => (
                              <tr
                                key={volunteer.id || idx}
                                className="border-b border-gray-100"
                              >
                                <td className="p-1">{volunteer.name}</td>
                                <td className="p-1">{volunteer.email}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-gray-500 text-center py-2">
                          No volunteers yet
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {errors.submit && (
                <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 cursor-pointer"
                >
                  {isCreating ? "Create Event" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <AdminNavbar />
    </div>
  );
};

export default EventHistory;