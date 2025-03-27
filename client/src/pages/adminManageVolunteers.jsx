import React, { useState, useEffect } from "react";
import axios from "axios";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import AdminNavbar from "../components/adminNavbar";

function DraggableItem({ id, name }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="p-3 bg-emerald-600 text-white rounded-2xl cursor-grab shadow-lg"
      style={style}
    >
      {name || "Unknown Volunteer"}
    </div>
  );
}

function DroppableArea({ id, name, assignedVolunteers }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`p-6 border-2 border-dashed rounded-lg w-60 min-h-[150px] flex flex-col items-center space-y-2 ${
        isOver ? "border-green-500 bg-green-100" : "border-gray-300"
      }`}
    >
      <h3 className="font-bold">{name}</h3>
      {assignedVolunteers.length > 0 ? (
        assignedVolunteers.map((vol) => (
          <DraggableItem
            key={`${id}-${vol.id}`}
            id={`${id}-${vol.id}`} // Make ID unique per event
            name={vol.name}
          />
        ))
      ) : (
        <span className="text-gray-500">Drop volunteers here</span>
      )}
    </div>
  );
}

function AdminManageVolunteers() {
  const [events, setEvents] = useState([]);
  const [volunteerDetails, setVolunteerDetails] = useState({});
  const [eventAssignments, setEventAssignments] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    axios
      .get("http://localhost:5001/api/events/allVolunteers")
      .then((res) => {
        console.log("All volunteers data:", res.data);

        const volunteersMap = {};
        res.data.forEach((volunteer) => {
          volunteersMap[volunteer.id] = volunteer; // Store full volunteer details
        });

        setVolunteerDetails(volunteersMap);
      })
      .catch((err) => console.error("Error fetching volunteers:", err));
  }, []); // Run once on component mount

  useEffect(() => {
    if (Object.keys(volunteerDetails).length === 0) return; // Prevent running with empty data

    axios
      .get("http://localhost:5001/api/events")
      .then((res) => {
        console.log("Events data:", res.data);
        setEvents(res.data);

        const assignments = res.data.reduce((acc, event) => {
          const formattedVolunteers = (event.volunteers || []).map(
            (volunteerId) => {
              const details = volunteerDetails[volunteerId] || {};
              console.log("volunteer: ", details);

              return {
                id: volunteerId,
                name:
                  details.firstName +
                    " " +
                    details.lastName +
                    " ID: " +
                    volunteerId.substring(0, 6) ||
                  `Volunteer ${volunteerId.substring(0, 6)}...`,
                email: details.email || "",
                originalEventId: event._id,
              };
            }
          );

          acc[event.name] = formattedVolunteers;
          return acc;
        }, {});

        setEventAssignments(assignments);
        console.log("Formatted assignments:", assignments);
      })
      .catch((err) => console.error("Error fetching events:", err))
      .finally(() => setIsLoading(false));
  }, [volunteerDetails]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || !over.id || active.id === over.id) return;

    const [sourceEventName, volunteerId] = active.id.split("-");

    const volunteers = eventAssignments[sourceEventName];
    const volunteer = volunteers.find((v) => v.id === volunteerId);
    const sourceEventId = volunteer?.originalEventId;

    if (!volunteer || sourceEventName === over.id) return;

    const targetEvent = events.find((e) => e.name === over.id);
    if (!targetEvent) {
      console.error("Target event not found:", over.id);
      return;
    }

    setEventAssignments((prev) => {
      const newAssignments = { ...prev };

      // Remove from the source event
      newAssignments[sourceEventName] = newAssignments[sourceEventName].filter(
        (v) => v.id !== volunteerId
      );

      // Add to the target event with updated originalEventId
      newAssignments[over.id] = [
        ...newAssignments[over.id],
        {
          ...volunteer,
          firstName: volunteer.firstName || "Unknown Volunteer",
          originalEventId: targetEvent._id,
        },
      ];

      return newAssignments;
    });

    // Send update to backend with source event ID for removal
    axios
      .post("http://localhost:5001/api/events/addVolunteer", {
        eventId: targetEvent._id,
        volunteerId: volunteerId,
        sourceEventId: sourceEventId,
      })
      .then((res) => {
        console.log("Volunteer moved successfully:", res.data);
      })
      .catch((err) => {
        console.error("Error moving volunteer:", err);
        setEventAssignments((prev) => {
          const originalAssignments = { ...prev };
          originalAssignments[sourceEventName] = [
            ...originalAssignments[sourceEventName],
            volunteer,
          ];
          originalAssignments[over.id] = originalAssignments[over.id].filter(
            (v) => v.id !== volunteerId
          );
          return originalAssignments;
        });
      });
  };

  if (isLoading) {
    return (
      <>
        <AdminNavbar />
        <div className="ml-72 mt-10 p-6">
          <h2 className="text-2xl font-bold">Manage Volunteers</h2>
          <p className="mt-4">Loading data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="ml-72 mt-10 p-6">
        <h2 className="text-2xl font-bold">Manage Volunteers</h2>

        {Object.keys(eventAssignments).length === 0 ? (
          <p className="mt-4">No events found. Please create events first.</p>
        ) : (
          <DndContext onDragEnd={handleDragEnd}>
            <div className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(eventAssignments).map(
                  ([eventName, volunteers]) => (
                    <DroppableArea
                      key={eventName}
                      id={eventName}
                      name={eventName}
                      assignedVolunteers={volunteers}
                    />
                  )
                )}
              </div>
            </div>
          </DndContext>
        )}
      </div>
    </>
  );
}

export default AdminManageVolunteers;
