import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import AdminNavbar from "./adminNavbar";

const EventHistory = () => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editedEvent, setEditedEvent] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const newEvent = {
        eventName: '',
        date: '',
        street: '',
        city: '',
        state: '',
        status: 'Upcoming',
        description: ''
    };

    const eventHistory = [
        {
            eventName: 'Toy Drive',
            date: '2025-07-15',
            street: '3600 S Las Vegas Blvd',
            city: 'Las Vegas',
            state: 'Nevada',
            status: 'Upcoming',
            description: 'Annual toy drive to collect toys for children in need during the holiday season.',
            lat: '36.113960',
            lng: '-115.173080'
        },
        {
            eventName: 'Tree Planting',
            date: '2025-03-22',
            street: '3 NRG Pkwy',
            city: 'Houston',
            state: 'Texas',
            status: 'Upcoming',
            description: 'Community event to plant trees in local parks and neighborhoods.'
        },
        {
            eventName: 'Charity Gala',
            date: '2025-01-13',
            street: '18400 Avalon Blvd',
            city: 'Carson',
            state: 'California',
            status: 'Cancelled',
            description: 'Annual fundraising gala to support local charitable initiatives.'
        }
    ];

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
    };

    const handleEventChange = (field, value) => {
        setEditedEvent(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        console.log('Saving event changes: ', editedEvent);
        handleClose();
    };

    // Map styles
    const containerStyle = {
        width: "100%",
        height: "400px",
        borderRadius: "8px",
        overflow: "hidden"
    };

    const defaultCenter = { lat: 39.8283, lng: -98.5795 };

    const EventsMap = ({ events }) => {
        return (
            <div className="bg-white shadow-md p-4 rounded-lg">
                <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                    <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={4}>
                        {events.map((event, index) => (
                            <Marker
                                key={index}
                                position={{
                                    lat: parseFloat(event.lat),
                                    lng: parseFloat(event.lng),
                                }}
                                label={event.eventName[0]}
                            />
                        ))}
                    </GoogleMap>
                </LoadScript>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md fixed h-full">
                <AdminNavbar />
            </div>

            {/* Main Content */}
            <div className="flex-grow ml-64 p-8 overflow-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Event History</h2>
                    <button
                        onClick={handleCreateEvent}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center"
                    >
                        + Create New Event
                    </button>
                </div>

                {/* Map Container */}
                <div className="mb-6">
                    <EventsMap events={eventHistory} />
                </div>

                {/* Event Table */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <table className="w-full border border-gray-300 shadow-md">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-3 text-left">Event Name</th>
                                <th className="p-3 text-left">Date</th>
                                <th className="p-3 text-left">Street</th>
                                <th className="p-3 text-left">City</th>
                                <th className="p-3 text-left">State</th>
                                <th className="p-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventHistory.map((event, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleEventClick(event)}>
                                    <td className="p-3">{event.eventName}</td>
                                    <td className="p-3">{event.date}</td>
                                    <td className="p-3">{event.street}</td>
                                    <td className="p-3">{event.city}</td>
                                    <td className="p-3">{event.state}</td>
                                    <td className={`p-3 ${
                                            event.status === 'Completed' ? 'text-green-700' :
                                            event.status === 'Upcoming' ? 'text-yellow-500' :
                                            event.status === 'Cancelled' ? 'text-red-600' : ''
                                        }`}
                                    >
                                        {event.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal for editing events */}
                {selectedEvent && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">
                                    {isCreating ? 'Create New Event' : 'Edit Event'}
                                </h3>
                                <button 
                                    onClick={handleClose}
                                    className="text-lg text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Event Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editedEvent.eventName}
                                        onChange={(e) => handleEventChange('eventName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editedEvent.date}
                                        onChange={(e) => handleEventChange('date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

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
                                    {isCreating ? 'Create Event' : 'Save Changes'}
                                </button>
                            </div>
                        </div>                 
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventHistory;
