import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profileData, setProfileData] = useState({
    fullName: "",
    adminId: "",
    email: "",
    phone: "",
    position: "",
    emergencyContact: "",
    emergencyPhone: "",
    fullySignedUp: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5001/api/adminProfile")
      .then((res) => {
        setProfileData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <ProfileContext.Provider value={{ profileData, setProfileData, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}