import React, { useState } from "react";
import VolunteerNavbar from "../components/volunteerNavbar";
import { Check } from 'lucide-react';

const VolunteerNotifications = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'event_reminder',
            message: 'Upcoming Event: Charity Gala tomorrow',
            timestamp: '2025-02-07T10:00:00',
            read: false,
            details: 'Don\'t forget to attend at 123 Main St, 6 PM'            
        },
        {
            id: 2,
            type: 'schedule_change',
            message: 'Your volunteer shift has been updated',
            timestamp: '2025-01-24T15:00:00',
            read: false,
            details: 'New time: 2 PM - 5 PM'

        },
        {
            id: 3,
            type: 'new_event',
            message: 'New volunteer opportunity available',
            timestamp: '2025-01-08T17:00:00',
            read: false,
            details: 'Community Arts and Crafts needs volunteers'
        }
    ]);

    const [filter, setFilter] = useState('all');

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notif.read;
        return notif.type === filter;
    });

    const markAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, read: true})));
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
        )); 
    };

    const filterTypes = [
        'all',
        'unread',
        'event_reminder',
        'schedule_change',
        'new_event'
    ];

    const formatFilterLabel = (filterType) => {
        if (filterType === 'all') return 'All';
        if (filterType === 'unread') return 'Unread';
        return filterType.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div  className="w-64 fixed">
                <VolunteerNavbar />
            </div>

            <div className="flex-1 ml-64 p-8">
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-semibold mb-6">My Notifications</h1>
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 text-md text-emerald-600 hover:text-emerald-800 cursor-pointer"
                            >
                                Mark all as read
                            </button>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {filterTypes.map(filterType => (
                                <button
                                    key={filterType}
                                    onClick={() => setFilter(filterType)}
                                    className={`px-4 py-2 rounded-md ${
                                        filter === filterType
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {formatFilterLabel(filterType)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {filteredNotifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`p-6 ${!notification.read ? 'bg-emerald-50' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {notification.message}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {notification.details}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-500">
                                            {new Date(notification.timestamp).toLocaleString()}
                                        </span>
                                        {!notification.read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="p-1 hover:bg-emerald-100 cursor-pointer rounded-full transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check className="w-5 h-5 text-emerald-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default VolunteerNotifications