import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';

const NotificationDropdown = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'volunteer_signup',
            message: 'New volunteer signup: Jane Smith',
            timestamp: '2025-02-07T10:00:00',
            read: false
        },
        {
            id: 2,
            type: 'event_update',
            message: 'Event "Charity Gala" has been modified',
            timestamp: '2025-01-24T15:00:00',
            read: false
        },
        {
            id: 3,
            type: 'event_creation',
            message: 'Event "Toy Drive" has been created',
            timestamp: '2025-01-24T17:00:00',
            read: false
        }
    ]);

    const unreadCount = notifications.filter(notif => !notif.read).length;

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, read:true } : notif
        ));
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="relative">
            <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 text-gray-400 hover:text-gray-500 cursor-pointer focus:outline-none">
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 right-auto mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-black">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div
                                 key={notification.id}
                                 className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                                    !notification.read ? 'bg-emerald-50' : ''
                                 }`}
                                 onClick={() => markAsRead(notification.id)}
                                >
                                    <p className="text-sm mb-1 text-gray-800">{notification.message}</p>
                                    <p className="text-xs text-gray-500">
                                        {formatTime(notification.timestamp)}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">
                                No notifications
                            </div>
                        )}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200">
                        <button
                            className="text-sm text-emerald-600 hover:text-emerald-800 cursor-pointer"
                            onClick={() => navigate('/admin/notifications')}
                        >
                            View all
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;