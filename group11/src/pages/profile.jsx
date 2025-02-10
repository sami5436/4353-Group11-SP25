import React, { useState } from "react";
import VolunteerNavbar from "../components/volunteerNavbar";
import { Pencil } from "lucide-react";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "Joe Biden",
    address1: "1600 Pennsylvania Avenue",
    address2: "",
    city: "Washington",
    state: "DC",
    zipCode: "20500",
    skills: [],
    preferences: "",
    availability: ""
  });

  const [editedData, setEditedData] = useState(profileData);

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  const skillOptions = [
    "Teaching",
    "First Aid",
    "Event Planning",
    "Social Media",
    "Cooking",
    "Construction",
    "Gardening",
    "Administrative",
    "Fundraising",
    "Language Skills"
  ];

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(profileData);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfileData(editedData);
    setIsEditing(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <VolunteerNavbar />
      
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-6">Hello, {profileData.fullName.split(' ')[0]}!</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Profile Information</h2>
              <p className="text-gray-600 text-sm">Update your profile information and preferences</p>
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

          <form onSubmit={handleSave} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={isEditing ? editedData.fullName : profileData.fullName}
                onChange={(e) => setEditedData({...editedData, fullName: e.target.value})}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                  ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
              />
            </div>

            {/* Address 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address 1
              </label>
              <input
                type="text"
                value={isEditing ? editedData.address1 : profileData.address1}
                onChange={(e) => setEditedData({...editedData, address1: e.target.value})}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                  ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
              />
            </div>

            {/* Address 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address 2 (Optional)
              </label>
              <input
                type="text"
                value={isEditing ? editedData.address2 : profileData.address2}
                onChange={(e) => setEditedData({...editedData, address2: e.target.value})}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                  ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
              />
            </div>

            {/* City, State, Zip */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.city : profileData.city}
                  onChange={(e) => setEditedData({...editedData, city: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  value={isEditing ? editedData.state : profileData.state}
                  onChange={(e) => setEditedData({...editedData, state: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <option value="">Select state</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.zipCode : profileData.zipCode}
                  onChange={(e) => setEditedData({...editedData, zipCode: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <select
                multiple
                value={isEditing ? editedData.skills : profileData.skills}
                onChange={(e) => setEditedData({
                  ...editedData, 
                  skills: Array.from(e.target.selectedOptions, option => option.value)
                })}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                  ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
              >
                {skillOptions.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple skills</p>
            </div>

            {/* Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferences
              </label>
              <textarea
                value={isEditing ? editedData.preferences : profileData.preferences}
                onChange={(e) => setEditedData({...editedData, preferences: e.target.value})}
                disabled={!isEditing}
                placeholder="Enter any specific preferences or notes..."
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32
                  ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
              />
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <input
                type="date"
                value={isEditing ? editedData.availability : profileData.availability}
                onChange={(e) => setEditedData({...editedData, availability: e.target.value})}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                  ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
              />
            </div>

            {/* Action Buttons */}
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
