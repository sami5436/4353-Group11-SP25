import React, { useState } from "react";
import VolunteerNavbar from "../components/volunteerNavbar";
import { Pencil } from "lucide-react";
import CreatableSelect from 'react-select/creatable';

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddress2, setShowAddress2] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "Joe",
    lastName: "Biden",
    address1: "1600 Pennsylvania Avenue",
    address2: "",
    city1: "Washington",
    city2: "",
    state1: "DC",
    state2: "",
    zipCode1: "20500",
    zipCode2: "",
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
    "Administrative",
    "Community Outreach",
    "Conflict Resolution",
    "Construction",
    "Cooking",
    "Customer Service",
    "Event Planning",
    "First Aid",
    "Fundraising",
    "Gardening",
    "Graphic Design",
    "IT Support",
    "Language Skills",
    "Leadership",
    "Marketing",
    "Photography",
    "Project Management",
    "Public Speaking",
    "Social Media",
    "Teaching",
    "Tutoring",
    "Web Development",
    "Writing"
  ];

  // Convert skillOptions array to format required by react-select
  const skillSelectOptions = skillOptions.map(skill => ({
    value: skill.toLowerCase(),
    label: skill
  }));

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
    
    // If Address 2 section is shown, validate all its fields
    if (showAddress2 && (!editedData.address2 || !editedData.city2 || !editedData.state2 || !editedData.zipCode2)) {
      alert("Please fill out all fields for Address 2 or remove the second address section");
      return;
    }
    
    setProfileData(editedData);
    setIsEditing(false);
  };

  const handleRemoveAddress2 = () => {
    setShowAddress2(false);
    setEditedData({
      ...editedData,
      address2: "",
      city2: "",
      state2: "",
      zipCode2: ""
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <VolunteerNavbar />
      
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-6">Hello, {profileData.firstName}!</h1>

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

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.firstName : profileData.firstName}
                  onChange={(e) => setEditedData({...editedData, firstName: e.target.value})}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.lastName : profileData.lastName}
                  onChange={(e) => setEditedData({...editedData, lastName: e.target.value})}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address 1 *
              </label>
              <input
                type="text"
                value={isEditing ? editedData.address1 : profileData.address1}
                onChange={(e) => setEditedData({...editedData, address1: e.target.value})}
                disabled={!isEditing}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                  ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.city1 : profileData.city1}
                  onChange={(e) => setEditedData({...editedData, city1: e.target.value})}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <select
                  value={isEditing ? editedData.state1 : profileData.state1}
                  onChange={(e) => setEditedData({...editedData, state1: e.target.value})}
                  disabled={!isEditing}
                  required
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
                  Zip Code *
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.zipCode1 : profileData.zipCode1}
                  onChange={(e) => setEditedData({...editedData, zipCode1: e.target.value})}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                    ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                />
              </div>
            </div>

            {!showAddress2 && isEditing && (
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => setShowAddress2(true)}
                  className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
                >
                  + Add Second Address
                </button>
              </div>
            )}

            {showAddress2 && (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Second Address</h3>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleRemoveAddress2}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove Address
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address 2 *
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editedData.address2 : profileData.address2}
                    onChange={(e) => setEditedData({...editedData, address2: e.target.value})}
                    disabled={!isEditing}
                    required
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                      ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editedData.city2 : profileData.city2}
                      onChange={(e) => setEditedData({...editedData, city2: e.target.value})}
                      disabled={!isEditing}
                      required
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                        ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <select
                      value={isEditing ? editedData.state2 : profileData.state2}
                      onChange={(e) => setEditedData({...editedData, state2: e.target.value})}
                      disabled={!isEditing}
                      required
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
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editedData.zipCode2 : profileData.zipCode2}
                      onChange={(e) => setEditedData({...editedData, zipCode2: e.target.value})}
                      disabled={!isEditing}
                      required
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                        ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <CreatableSelect
                isMulti
                isDisabled={!isEditing}
                value={skillSelectOptions.filter(option => 
                  (isEditing ? editedData.skills : profileData.skills).includes(option.value)
                )}
                onChange={(selectedOptions) => setEditedData({
                  ...editedData,
                  skills: selectedOptions ? selectedOptions.map(option => option.value) : []
                })}
                options={skillSelectOptions}
                className="rounded-lg"
                classNamePrefix="select"
                placeholder="Type to search or add new skills..."
                formatCreateLabel={(inputValue) => `Add "${inputValue}" as a new skill`}
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: '#059669',
                    primary25: '#f0fdf4',
                    primary50: '#dcfce7',
                  },
                })}
              />
              <p className="text-sm text-gray-500 mt-1">
                Search existing skills or type to add new ones
              </p>
            </div>

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
