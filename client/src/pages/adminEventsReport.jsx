import React, { useState, useEffect } from "react";
import AdminNavbar from "../components/adminNavbar";
import { BarChart2, Users, Clock, Calendar } from "lucide-react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminEventsReport = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summaryData, setSummaryData] = useState({
        totalVolunteers: 0,
        volunteerHours: 0,
        upcomingEvents: 0,
        completedEvents: 0
    });
    const [engagementData, setEngagementData] = useState([]);
    const [distributionData, setDistributionData] = useState([]);
    const [skillsData, setSkillsData] = useState([]);
    const [locationData, setLocationData] = useState([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch all data in parallel
            const [summary, engagement, distribution, skills, locations] = await Promise.all([
                fetchData("/api/reports/summary"),
                fetchData("/api/reports/engagement"),
                fetchData("/api/reports/distribution"),
                fetchData("/api/reports/skills"),
                fetchData("/api/reports/locations")
            ]);

            setSummaryData(summary);
            setEngagementData(engagement);
            setDistributionData(distribution);
            setSkillsData(skills);
            setLocationData(locations);
            setError(null);
        } catch (err) {
            console.error("Error fetching report data:", err);
            setError("Failed to load report data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async (endpoint) => {
        try {
            const response = await axios.get(`http://localhost:5001${endpoint}`, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.error(`Error fetching data from ${endpoint}:`, error);
            throw error;
        }
    };

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-lg text-gray-600">Loading report data...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-6">
                        {/* Quick Stats Cards - Row 1 */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 mb-1">Total Volunteers</p>
                                    <h3 className="text-2xl font-bold">{summaryData.totalVolunteers}</h3>
                                </div>
                                <Users className="text-emerald-600" size={24} />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 mb-1">Hours Volunteered</p>
                                    <h3 className="text-2xl font-bold">{summaryData.volunteerHours}</h3>
                                </div>
                                <Clock className="text-emerald-600" size={24} />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 mb-1">Upcoming Events</p>
                                    <h3 className="text-2xl font-bold">{summaryData.upcomingEvents}</h3>
                                </div>
                                <Calendar className="text-emerald-600" size={24} />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 mb-1">Completed Events</p>
                                    <h3 className="text-2xl font-bold">{summaryData.completedEvents}</h3>
                                </div>
                                <BarChart2 className="text-emerald-600" size={24} />
                            </div>
                        </div>

                        {/* Volunteer Engagement Chart */}
                        <div className="col-span-2 bg-white rounded-2xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Volunteer Engagement</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={engagementData}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="volunteers" fill="#0088FE" name="Volunteers" />
                                    <Bar dataKey="events" fill="#00C49F" name="Events" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Event Distribution Chart */}
                        <div className="col-span-2 bg-white rounded-2xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Event Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="status"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Skills Distribution Chart */}
                        <div className="col-span-3 bg-white rounded-2xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Skills Distribution</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={skillsData.slice(0, 8)} layout="vertical">
                                    <XAxis type="number" />
                                    <YAxis dataKey="skill" type="category" width={150} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top Locations Chart */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={locationData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="city"
                                    >
                                        {locationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminEventsReport;