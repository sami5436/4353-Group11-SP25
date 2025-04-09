import React, { useState, useEffect } from "react";
import AdminNavbar from "../components/adminNavbar";
import { BarChart2, Users, Clock, Calendar, Download, FileText, FileSpreadsheet, File } from "lucide-react";
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
    const [reportType, setReportType] = useState("volunteers");
    const [reportFormat, setReportFormat] = useState("pdf");
    const [generatingReport, setGeneratingReport] = useState(false);
    const [reportMessage, setReportMessage] = useState(null);

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

    const generateReport = async () => {
        setGeneratingReport(true);
        setReportMessage(null);
        
        try {
            // API endpoint for generating reports
            const endpoint = `/api/reports/generate/${reportType}`;
            
            // Format parameter
            const params = { format: reportFormat };
            
            // Make the API call
            const response = await axios.get(`http://localhost:5001${endpoint}`, {
                params,
                withCredentials: true,
                responseType: reportFormat === 'pdf' ? 'blob' : 'text'
            });
            
            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Set the filename based on report type and format
            const filename = `${reportType}_report.${reportFormat}`;
            link.setAttribute('download', filename);
            
            // Trigger the download
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            setReportMessage(`Report generated successfully! Downloading...`);
            setTimeout(() => {
                setReportMessage(null);
            }, 2500);
        } catch (err) {
            console.error("Error generating report:", err);
            setReportMessage(`Failed to generate report. Please try again later.`);
            setTimeout(() => {
                setReportMessage(null);
            }, 5000);
        } finally {
            setGeneratingReport(false);
        }
    };

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
                    <>
                        {/* Report Generation Section */}
                        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <FileText className="mr-2 text-emerald-600" size={20} />
                                Generate Reports
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                                    <select 
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                    >
                                        <option value="volunteers">Volunteer List & Participation</option>
                                        <option value="events">Event Details & Assignments</option>
                                        <option value="summary">Summary Analytics</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Format</label>
                                    <div className="flex space-x-2">
                                        <button 
                                            className={`flex items-center px-4 py-2 rounded ${reportFormat === 'pdf' ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}
                                            onClick={() => setReportFormat('pdf')}
                                        >
                                            <File className="mr-1" size={16} />
                                            PDF
                                        </button>
                                        <button 
                                            className={`flex items-center px-4 py-2 rounded ${reportFormat === 'csv' ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}
                                            onClick={() => setReportFormat('csv')}
                                        >
                                            <FileSpreadsheet className="mr-1" size={16} />
                                            CSV
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <button 
                                        className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                                        onClick={generateReport}
                                        disabled={generatingReport}
                                    >
                                        {generatingReport ? 
                                            "Generating..." : 
                                            <>
                                                <Download className="mr-2" size={16} />
                                                Generate Report
                                            </>
                                        }
                                    </button>
                                </div>
                            </div>
                            {reportMessage && (
                                <div className={`mt-4 p-2 rounded ${reportMessage.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {reportMessage}
                                </div>
                            )}
                        </div>

                        {/* Quick Stats Cards - Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Volunteer Engagement Chart */}
                            <div className="bg-white rounded-2xl shadow-md p-6">
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
                            <div className="bg-white rounded-2xl shadow-md p-6">
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
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Skills Distribution Chart */}
                            <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-6">
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
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminEventsReport;