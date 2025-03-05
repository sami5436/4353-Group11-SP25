require("dotenv").config();
const express = require("express");
const cors = require("cors");
const eventRoutes = require("./routes/eventsRoutes");
const adminProfileRoutes = require("./routes/adminProfile");
const notificationRoutes = require("./routes/notifications");
const volunteerAssignmentsRoutes = require("./routes/volunteerAssignmentsRoutes");
const authRoutes = require("./routes/authRoutes");
const userVolunteerRoutes = require("./routes/volunteerProfile");
const app = express();


app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"]  })); // Allow only frontend URL

app.use(express.json());

app.use("/api/events", eventRoutes);
app.use("/api/adminProfile", adminProfileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/volunteerAssignments", volunteerAssignmentsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/volunteerProfile", userVolunteerRoutes);

const PORT = process.env.PORT || 5001;

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
