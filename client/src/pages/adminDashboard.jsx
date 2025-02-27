import React, { useState, useEffect } from "react";
import AdminNavbar from "../components/adminNavbar";
import EventHistory from "../components/adminEventHistory";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");

    const [profileData, setProfileData] = useState({
        fullName: "",
        adminId: "",
        email: "",
        phone: "",
        position: "",
        emergencyContact: "",
        emergencyPhone: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [formValues, setFormValues] = useState({});
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        axios.get("http://localhost:5001/api/adminProfile")
            .then((res) => {
                setProfileData(res.data);
                setFormValues(res.data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching profile:", err);
                setIsLoading(false);
            });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage("");
        
        axios.put("http://localhost:5001/api/adminProfile", formValues)
            .then((res) => {
                setProfileData(res.data);
                alert("Profile updated successfully!");
            })
            .catch((err) => {
                console.error("Error updating profile:", err);
                if (err.response && err.response.data && err.response.data.errors) {
                    setErrorMessage(err.response.data.errors.join(", "));
                } else {
                    setErrorMessage("Failed to update profile. Please try again.");
                }
            });
    };


    const ProfileContent = () => (
        <div className="p-1">
            {isLoading ? (
                <div className="text-center">Loading profile data...</div>
            ) : (
                <>
                    <div className="mb-10">
                        <h2 className="text-3xl font-semibold mb-2">Welcome!</h2>
                        <p className="text-xl text-gray-600 font-medium mb-5">Admin ID: {profileData.adminId}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-6">Profile Review</h2>
                        {errorMessage && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {errorMessage}
                            </div>
                        )}
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4 mb-10">
                                <h3 className="text-lg font-semibold">Your Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                        <input 
                                            type="text" 
                                            name="position"
                                            value={formValues.position || ""} 
                                            readOnly 
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-200 text-gray-700 focus:outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            name="fullName"
                                            value={formValues.fullName || ""} 
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input 
                                            type="email" 
                                            name="email"
                                            value={formValues.email || ""} 
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            value={formValues.phone || ""} 
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Emergency Contact</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                                        <input 
                                            type="text" 
                                            name="emergencyContact"
                                            value={formValues.emergencyContact || ""} 
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                                        <input 
                                            type="tel" 
                                            name="emergencyPhone"
                                            value={formValues.emergencyPhone || ""} 
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button 
                                    type="button" 
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors hover:cursor-pointer"
                                    onClick={() => setFormValues(profileData)}
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
                </>
            )}
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Fixed Sidebar */}
            <div className="w-64 bg-white shadow-md fixed h-full">
                <AdminNavbar />
            </div>

            {/* Main Content - Ensure it doesn't overlap */}
            <div className="flex-1 ml-64 overflow-auto p-8">
                {activeTab === "profile" && <ProfileContent />}
                {activeTab === "events" && <EventHistory />}
                {activeTab === "volunteers" && <div>Volunteers Management Content</div>}
                {activeTab === "reports" && <div>Reports Content</div>}
            </div>
        </div>
    );
};

export default AdminDashboard;
