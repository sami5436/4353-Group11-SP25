import React, { useState } from 'react';
import AdminNavbar from '../components/adminNavbar';
import { Check } from 'lucide-react';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'volunteer_signup',
            message: 'New volunteer signup: Jane Smith',
            timestamp: '2025-02-07T10:00:00',
            read: false,
            details: 'Contact: jane.smith@gmail.com'
        },
        {
            id: 2,
            type: 'event_update',
            message: 'Event "Charity Gala" has been modified',
            timestamp: '2025-01-24T15:00:00',
            read: false,
            details: 'New date approved'
        },
        {
            id: 3,
            type: 'event_creation',
            message: 'Event "Toy Drive" has been created',
            timestamp: '2025-01-24T17:00:00',
            read: false,
            details: 'Admin John Doe has initiated the creation'
        }
    ]);

    const [filter, setFilter] = useState('all');

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notif.read;
        return notif.type === filter;
    });

    const markAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, read:true })));
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
        ));
    };

    const formatFilterLabel = (filterType) => {
        if (filterType === 'all') return 'All';
        if (filterType === 'unread') return 'Unread';
        return filterType.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const filterTypes = [
        'all',
        'unread',
        'volunteer_signup',
        'event_update',
        'event_creation'
    ];


    return (
        <div className="flex h-screen bg-gray-100">
            <div  className="w-64 fixed">
                <AdminNavbar />
            </div>

            <div className="flex-1 ml-64 p-8">
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-semibold mb-6">Notifications</h1>
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 text-md text-emerald-600 hover:text-emerald-800 cursor-pointer"
                            >
                                Mark all as read
                            </button>
                        </div>

                        {/* this filtering is happening at the front end but eventually will need to be an implemented back end logic */}
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

export default AdminNotifications;