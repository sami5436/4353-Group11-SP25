import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const VolunteerProfileContext = createContext();

export function VolunteerProfileProvider({ children }) {
  const [volunteerProfileData, setVolunteerProfileData] = useState({
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
    fullySignedUp: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const volunteerId = Cookies.get("userId");
    console.log("context: Volunteer ID from cookie:", volunteerId);
    axios.get(`http://localhost:5001/api/volunteerProfile/volunteer/${volunteerId}`)
      .then((res) => {
        console.log("got profile:", res.data);
        setVolunteerProfileData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <VolunteerProfileContext.Provider value={{ volunteerProfileData, setVolunteerProfileData, isLoading }}>
      {children}
    </VolunteerProfileContext.Provider>
  );
}

export function useVolunteerProfile() {
  return useContext(VolunteerProfileContext);
}
