require("dotenv").config();
const express = require("express");
const cors = require("cors");
const eventRoutes = require("./routes/eventsRoutes");
const adminProfileRoutes = require("./routes/adminProfile");
const notificationRoutes = require("./routes/notifications");

const app = express();


app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"]  })); // Allow only frontend URL

app.use(express.json());

app.use("/api/events", eventRoutes);
app.use("/api/adminProfile", adminProfileRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5001;

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
