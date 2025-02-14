import React, { useState } from "react";
import AdminNavbar from "../components/adminNavbar";
import { BarChart2, Users, Clock, Calendar } from "lucide-react";

const AdminEventsReport = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-64 bg-gray-100 h-[95vh] fixed top-4 left-4 p-4">
                <AdminNavbar />
            </div>

            <div className="flex-1 ml-72 p-8">
                <div className="mb-10">
                    <h2 className="text-3xl font-semibold mb-2">Events Report</h2>
                    <p className="text-xl text-gray-600 font-medium">Overview and Analytics</p>
                </div>

                {/* Bento Box Grid Layout */}
                <div className="grid grid-cols-4 gap-6">
                    {/* Quick Stats Cards - Row 1 */}
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 mb-1">Total Volunteers</p>
                                <h3 className="text-2xl font-bold">256</h3>
                            </div>
                            <Users className="text-emerald-600" size={24} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 mb-1">Hours Volunteered</p>
                                <h3 className="text-2xl font-bold">1,280</h3>
                            </div>
                            <Clock className="text-emerald-600" size={24} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 mb-1">Upcoming Events</p>
                                <h3 className="text-2xl font-bold">12</h3>
                            </div>
                            <Calendar className="text-emerald-600" size={24} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 mb-1">Completed Events</p>
                                <h3 className="text-2xl font-bold">24</h3>
                            </div>
                            <BarChart2 className="text-emerald-600" size={24} />
                        </div>
                    </div>

                    {/* Detailed Charts - Row 2 */}
                    <div className="col-span-2 bg-white rounded-2xl shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Volunteer Engagement</h3>
                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                            Chart placeholder: Monthly volunteer participation
                        </div>
                    </div>

                    <div className="col-span-2 bg-white rounded-2xl shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Event Distribution</h3>
                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                            Chart placeholder: Event types and status
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="col-span-3 bg-white rounded-2xl shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Skills Distribution</h3>
                        <div className="h-[250px] flex items-center justify-center text-gray-400">
                            Chart placeholder: Most requested volunteer skills
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
                        <div className="h-[250px] flex items-center justify-center text-gray-400">
                            Chart placeholder: Event locations
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEventsReport;