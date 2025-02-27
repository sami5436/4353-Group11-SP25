import React, { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import AdminNavbar from "../components/adminNavbar";

const initialEventAssignments = {
  "Community Cleanup": [
    { id: "volunteer-1", name: "Sami Hamdalla" },
    { id: "volunteer-2", name: "Yusuf Khan" },
  ],
  "Food Drive": [{ id: "volunteer-3", name: "lalalala" }],
  "Animal Shelter Support": [],
  "For Fun": [],
  "Hey": [],
  "New Event": [],
};

function DraggableItem({ id, name }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

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
      {name}
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
          <DraggableItem key={vol.id} id={vol.id} name={vol.name} />
        ))
      ) : (
        <span className="text-gray-500">Drop volunteers here</span>
      )}
    </div>
  );
}

function AdminManageVolunteers() {
  const [eventAssignments, setEventAssignments] = useState(initialEventAssignments);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || !over.id) return;

    const volunteerId = active.id;
    let sourceEventId = null;
    let volunteer = null;

    for (const eventId in eventAssignments) {
      const volunteers = eventAssignments[eventId];
      const foundVolunteer = volunteers.find((v) => v.id === volunteerId);
      if (foundVolunteer) {
        sourceEventId = eventId;
        volunteer = foundVolunteer;
        break;
      }
    }

    if (!volunteer || sourceEventId === over.id) return;

    setEventAssignments((prev) => {
      const newAssignments = { ...prev };

      newAssignments[sourceEventId] = newAssignments[sourceEventId].filter(
        (v) => v.id !== volunteerId
      );

      newAssignments[over.id] = [...newAssignments[over.id], volunteer];

      return newAssignments;
    });
  };

  return (
    <>
      <AdminNavbar />
      <h2 className="text-2xl ml-72 mt-10 font-bold">Manage Volunteers</h2>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="p-6 mt-12 ml-80">
          <div className="grid grid-cols-3 gap-12">
            {Object.entries(eventAssignments).map(([eventId, volunteers]) => (
              <DroppableArea
                key={eventId}
                id={eventId}
                name={eventId}
                assignedVolunteers={volunteers}
              />
            ))}
          </div>
        </div>
      </DndContext>
    </>
  );
}

export default AdminManageVolunteers;
