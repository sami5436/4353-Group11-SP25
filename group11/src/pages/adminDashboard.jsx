import React, { useState } from 'react';
import EventHistory from '../components/adminEventHistory';
import { Home, Users, Calendar, ClipboardList, LogOut } from "lucide-react";
import { useNavigate, useSearchParams } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');

    const profileData = {
        fullName: "John Doe",
        adminId: "ABC123",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        position: "Administrator",
        password: "password",
        emergencyContact: "Jane Doe",
        emergencyPhone: "111-222-3333"
    };

    const ProfileContent = () => (
        <div className="p-8">
            <div className="mb=16">
                <h2 className="text-3xl font-semibold mb-2">
                    Welcome!
                </h2>
                <p className="text-3x1 text-gray-600 font-medium mb-5">Admin ID: {profileData.adminId}</p>
            </div>

            {/* Profile data */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-x1 font-bold mb-6">Profile Review</h2>
                <form className="space-y-6">
                    <div className="space-y-4 mb-10">
                        <h3 className="text-lg font-semibold">Your Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Position
                                </label>
                                <input 
                                    type="text"
                                    defaultValue={profileData.position}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-200 text-gray-700 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input 
                                    type="text"
                                    defaultValue={profileData.fullName}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input 
                                    type="email"
                                    defaultValue={profileData.email}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input 
                                    type="tel"
                                    defaultValue={profileData.phone}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Emergency Contact</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block test-sm font-medium text-gray-700 mb-1">
                                    Contact Name
                                </label>
                                <input 
                                    type="text"
                                    defaultValue={profileData.emergencyContact}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                />
                            </div>
                            <div>
                                <label className="block test-sm font-medium text-gray-700 mb-1">
                                    Contact Phone
                                </label>
                                <input 
                                    type="tel"
                                    defaultValue={profileData.emergencyPhone}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        {/* Cancel button will revert the changes */}
                        <button
                            type="button"
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors hover:cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-900 transition-colors hover:cursor-pointer"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gradient-to-b from-emerald-900 to-emerald-600 text-white">
                <div className="p-4 flex items-center space-x-2">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 text-gray-300 hover:text-white w-full hover:cursor-pointer"
                    >
                        <span className="text-x1 font-bold">Group 11</span>
                    </button>
                </div>

                <div className="p-4">
                    <h2 className="text-3xl font-semibold">
                        MANAGEMENT
                    </h2>
                    <h3 className="text-xl font-semibold text-[#82faa2] mb-7">
                        DASHBOARD
                    </h3>
                    <nav className="space-y-8">
                        <a href="#" onClick={() => setActiveTab('profile')} className="flex items-center space-x-2 text-gray-300 hover:text-white">
                            <Home size={20} />
                            <span>My Profile</span>
                        </a>
                        <a href="#" onClick={() => setActiveTab('volunteers')}  className="flex items-center space-x-2 text-gray-300 hover:text-white">
                            <Users size={20} />
                            <span>Manage Volunteers</span>
                        </a>
                        <a href="#" onClick={() => setActiveTab('events')}  className="flex items-center space-x-2 text-gray-300 hover:text-white">
                            <Calendar size={20} />
                            <span>Manage Events</span>
                        </a>
                        <a href="#" onClick={() => setActiveTab('reports')}  className="flex items-center space-x-2 text-gray-300 hover:text-white">
                            <ClipboardList size={20} />
                            <span>Events Reports</span>
                        </a>
                        <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-white">
                            <LogOut size={20} />
                            <span>Logout</span>
                        </a>
                    </nav>
                </div>
            </div>

            {/* Main Profile content */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'profile' && <ProfileContent />}
                {activeTab === 'events' && <EventHistory />}
                {activeTab === 'volunteers' && <div>Volunteers Management Content</div>}
                {activeTab === 'reports' && <div>Reports Content</div>}
            </div>
        </div>
    )

}

export default AdminDashboard;