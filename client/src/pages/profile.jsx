import React, { useState, useEffect } from "react";
import VolunteerNavbar from "../components/volunteerNavbar";
import { Pencil } from "lucide-react";
import CreatableSelect from "react-select/creatable";
import axios from "axios";
import DatePicker from "react-multi-date-picker";
import "../styles/volunteerProfileAvailabilityStyling.css"; // Import the custom green theme
import { useVolunteerProfile } from "../context/volunteerProfileContext";
import Cookies from "js-cookie";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showSecondAddress, setShowSecondAddress] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const { setVolunteerProfileData } = useVolunteerProfile();
  const [editedData, setEditedData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address1: "",
    city1: "",
    state1: "",
    zipCode1: "",
    address2: "",
    city2: "",
    state2: "",
    zipCode2: "",
    skills: [],
    availability: [],
    preferences: "",
  });
  const [errors, setErrors] = useState([]);

  const states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "DC",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];

  const skillOptions = [
    "Administrative",
    "Arts & Crafts",
    "Community Outreach",
    "Conflict Resolution",
    "Construction",
    "Cooking",
    "Customer Service",
    "Event Coordination",
    "Event Planning",
    "First Aid",
    "Food Services",
    "Fundraising",
    "Gardening",
    "Graphic Design",
    "IT Support",
    "Language Skills",
    "Language Translation",
    "Leadership",
    "Manual Labor",
    "Marketing",
    "Photography",
    "Project Management",
    "Public Speaking",
    "Social Media",
    "Teaching",
    "Technical Support",
    "Tutoring",
    "Web Development",
    "Writing"
  ];

  // Convert skillOptions array to format required by react-select
  const skillSelectOptions = skillOptions.map((skill) => ({
    value: skill.toLowerCase(),
    label: skill,
  }));

  useEffect(() => {
    const volunteerId = Cookies.get("userId");
    console.log("profile.jsx: Volunteer ID from cookie:", volunteerId);

    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/volunteerProfile/volunteer/${volunteerId}`
        );
        console.log("Profile data fetched:", response.data);

        const formattedData = {
          ...response.data,
          availability: response.data.availability
            ? response.data.availability.map((date) => {
                if (
                  date &&
                  typeof date === "object" &&
                  (date.dateObject || date.unix)
                ) {
                  return date;
                }
                return new Date(date);
              })
            : [],
        };

        setProfileData(formattedData);
        setEditedData(formattedData);

        // Determine if the second address should be shown
        const { address2, city2, state2, zipCode2 } = response.data;
        if (address2 || city2 || state2 || zipCode2) {
          setShowSecondAddress(true);
        }

        await axios.post(
          `http://localhost:5001/api/volunteerAssignments/assignVolunteer/${volunteerId}`
        );
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(profileData);
    setErrors([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...editedData, [name]: value };
    setEditedData(updatedData);
  };

  // This snippet shows how to modify the handleSave function in your Profile component
  // to correctly handle availability dates before sending to the backend

  const handleSave = async (e) => {
    e.preventDefault();
    const volunteerId = Cookies.get("userId"); // Retrieve the volunteer ID

    // Format the availability dates to ISO strings before sending to the backend
    const formattedData = {
      ...editedData,
      availability: editedData.availability
        ? editedData.availability.map((date) => {
            // If date is already a string, return it
            if (typeof date === "string") {
              return date;
            }
            // If date is a DatePicker object with a dateObject
            else if (date && date.dateObject) {
              return date.dateObject;
            }
            // If date is a DatePicker object with a unix timestamp
            else if (date && date.unix) {
              return new Date(date.unix * 1000).toISOString();
            }
            // If date is a Date object
            else if (date instanceof Date) {
              return date.toISOString();
            }
            // Otherwise, try to convert whatever it is to a date
            return new Date(date).toISOString();
          })
        : [],
    };

    try {
      const response = await axios.put(
        `http://localhost:5001/api/volunteerProfile/volunteer/${volunteerId}`,
        formattedData
      );
      setProfileData(response.data.volunteerProfile);
      setVolunteerProfileData(response.data.volunteerProfile);
      setIsEditing(false);
      setErrors([]);

      await axios.post(
        `http://localhost:5001/api/volunteerAssignments/assignVolunteer/${volunteerId}`
      );
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error saving profile data:", error);
      }
    }
  };

  const handleToggleSecondAddress = () => {
    setShowSecondAddress((prev) => !prev);
  };

  const handleRemoveAddress = () => {
    setEditedData({
      ...editedData,
      address2: "",
      city2: "",
      state2: "",
      zipCode2: "",
    });
    setShowSecondAddress(false);
  };

  if (!profileData) {
    return <div>Loading...</div>; // Show loading state while fetching data
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <VolunteerNavbar />

      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-6">
          Hello{profileData.firstName ? `, ${profileData.firstName}` : ""}!
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Profile Information</h2>
              <p className="text-gray-600 text-sm">
                Update your profile information and preferences
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Pencil size={16} className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          {errors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {/* Personal Information Section */}
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={editedData.firstName || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={editedData.lastName || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={editedData.email || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editedData.phone || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={editedData.dateOfBirth || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={editedData.gender || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Location Information Section */}
            <h3 className="text-lg font-semibold mt-6">Address Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                name="address1"
                value={editedData.address1 || ""}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                  ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city1"
                  value={editedData.city1 || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <select
                  name="state1"
                  value={editedData.state1 || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                >
                  <option value="">Select state</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code *
                </label>
                <input
                  type="text"
                  name="zipCode1"
                  value={editedData.zipCode1 || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                />
              </div>
            </div>

            {!showSecondAddress && isEditing && (
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={handleToggleSecondAddress}
                  className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
                >
                  + Add Secondary Address
                </button>
              </div>
            )}

            {showSecondAddress && (
              <>
                <h4 className="text-lg font-semibold mt-4">
                  Secondary Address
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address 2 *
                  </label>
                  <input
                    type="text"
                    name="address2"
                    value={editedData.address2 || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                      ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city2"
                      value={editedData.city2 || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                        ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <select
                      name="state2"
                      value={editedData.state2 || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                        ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                    >
                      <option value="">Select state</option>
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode2"
                      value={editedData.zipCode2 || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                        ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                    />
                  </div>
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleRemoveAddress}
                    className="text-red-600 hover:text-red-700 font-medium mt-2"
                  >
                    Remove Secondary Address
                  </button>
                )}
              </>
            )}

            {/* Volunteer Information Section */}
            <h3 className="text-lg font-semibold mt-6">
              Volunteer Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <CreatableSelect
                isMulti
                isDisabled={!isEditing}
                value={skillSelectOptions.filter((option) =>
                  (isEditing
                    ? editedData.skills
                    : profileData.skills || []
                  ).includes(option.value)
                )}
                onChange={(selectedOptions) =>
                  setEditedData({
                    ...editedData,
                    skills: selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : [],
                  })
                }
                options={skillSelectOptions}
                className="rounded-lg"
                classNamePrefix="select"
                placeholder="Type to search or add new skills..."
                formatCreateLabel={(inputValue) =>
                  `Add "${inputValue}" as a new skill`
                }
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: "#059669",
                    primary25: "#f0fdf4",
                    primary50: "#dcfce7",
                  },
                })}
              />
              <p className="text-sm text-gray-500 mt-1">
                Search existing skills or type to add new ones
              </p>
            </div>

            <div className="green">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <DatePicker
                multiple
                value={editedData.availability}
                onChange={(dates) =>
                  setEditedData({ ...editedData, availability: dates })
                }
                disabled={!isEditing}
                format="MM/DD/YYYY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferences
              </label>
              <textarea
                name="preferences"
                value={editedData.preferences || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                  ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                placeholder="Enter your preferences here..."
              />
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;