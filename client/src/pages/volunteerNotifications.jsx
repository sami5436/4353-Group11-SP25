import React, { useState, useEffect } from "react";
import axios from 'axios';
import VolunteerNavbar from "../components/volunteerNavbar";
import { Check } from 'lucide-react';
import Cookies from "js-cookie";

const VolunteerNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    
    const recipientType = "volunteer";

    const checkEventReminders = async () => {
        try {
            await axios.get('https://four353-group11-sp25.onrender.com/notifications/check-all-reminders', 
                { withCredentials: true }
            );
            console.log("Reminder check completed");
        } catch (err) {
            console.error("Error checking reminders:", err);
        }
    };
    
    useEffect(() => {
        const userId = Cookies.get("userId");
        if (!userId) {
            console.error("No user ID found in cookies");
            return;
        }
    
        const loadData = async () => {
            await checkEventReminders();
    
            let url = `https://four353-group11-sp25.onrender.com/notifications?recipientType=${recipientType}`;
            if (filter === 'unread') {
                url += '&unread=true';
            } else if (filter !== 'all') {
                url += `&type=${filter}`;
            }
    
            try {
                const res = await axios.get(url, { withCredentials: true });
                setNotifications(res.data);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            }
        };
    
        loadData();
    }, [filter]);

    const markAllAsRead = () => {
        axios.put(`https://four353-group11-sp25.onrender.com/notifications/markAllRead?recipientType=${recipientType}`, 
            {}, { withCredentials: true })
            .then(res => {
                if (res.data.success) {
                    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
                }
            })
            .catch(err => console.error("Error marking all notifications as read:", err));
            window.location.reload();
    };

    const markAsRead = (id) => {
        axios.put(`https://four353-group11-sp25.onrender.com/notifications/${id}/read`, {}, { withCredentials: true })
            .then(res => {
                setNotifications(notifications.map(notif =>
                    notif._id === id ? { ...notif, read: true } : notif
                ));
            })
            .catch(err => console.error("Error marking notification as read:", err));
            window.location.reload();
    };

    const filterTypes = [
        'all',
        'unread',
        'event_reminder',
        'event_update',
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
            <div className="w-64 fixed">
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
                    {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div
                                    key={notification._id}
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
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="p-1 hover:bg-emerald-100 cursor-pointer rounded-full transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-5 h-5 text-emerald-600" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                No notifications to display
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerNotifications;