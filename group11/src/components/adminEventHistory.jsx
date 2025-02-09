import React , { useState } from "react";
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
    }

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
        },
        {
            eventName: "Children's Outreach",
            date: '2024-12-20',
            street: '3418 Aurora Ave',
            city: 'El Paso',
            state: 'Texas',
            status: 'Completed',
            description: 'Educational and recreational activities for underprivileged children.'
        },
        {
            eventName: "Community Arts and Crafts",
            date: '2025-01-11',
            street: '200 Reading Rd',
            city: 'Mason',
            state: 'Ohio',
            status: 'Completed',
            description: 'Educational and recreational activities for underprivileged children.'
        }
    ];

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setEditedEvent({...event });
        setIsCreating(false);
    };

    const handleCreateEvent = () => {
        setSelectedEvent(newEvent);
        setEditedEvent({...newEvent});
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
        {/* this is where i'll send the update to the backend to save the new event info */}
        console.log('Saving event changes: ', editedEvent);
        handleClose();
    };



    {/* adding map would be fun to show events and understand visually */}
    {/* NEEDS TO BE FIXED */}
    const containerStyle = {
        width: "100%",
        height: "400px",
    };
    
    // Default center of the US
    const defaultCenter = { lat: 39.8283, lng: -98.5795 };
    
    const EventsMap = ({ events }) => {
        return (
            <LoadScript googleMapsApiKey="AIzaSyBNl1aAfBwzKsNFnjnSXpMiQ7Z-gh_x45U">
                <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={4}>
                    {events.map((event, index) => (
                        <Marker
                            key={index}
                            position={{
                                lat: parseFloat(event.latitude),
                                lng: parseFloat(event.longitude),
                            }}
                            label={event.eventName[0]}
                        />
                    ))}
                </GoogleMap>
            </LoadScript>
        );
    };
    


    return (
<div className="flex">
    {/* Sidebar (Assumed fixed width) */}
    

    {/* Main content */}
    <div className="p-6 relative ml-[260px] w-full">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold mb-6">Event History</h2>
            <button
                onClick={handleCreateEvent}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center"
            >
                + Create New Event
            </button>
        </div>

        <EventsMap events={eventHistory} />

        {/* Table without unnecessary margins */}
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

        {/* Modal Centering Fix */}
        {selectedEvent && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
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
                    
                    {/* Form */}
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Street
                            </label>
                            <input
                                type="text"
                                value={editedEvent.street}
                                onChange={(e) => handleEventChange('street', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <input
                                type="text"
                                value={editedEvent.city}
                                onChange={(e) => handleEventChange('city', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State
                            </label>
                            <input
                                type="text"
                                value={editedEvent.state}
                                onChange={(e) => handleEventChange('state', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={editedEvent.status}
                                onChange={(e) => handleEventChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value='Upcoming'>Upcoming</option>
                                <option value='Completed'>Completed</option>
                                <option value='Cancelled'>Cancelled</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={editedEvent.description}
                                    onChange={(e) => handleEventChange('description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    rows="4"
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
    <AdminNavbar />
</div>

    );
};


export default EventHistory;