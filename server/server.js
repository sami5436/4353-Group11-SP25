require("dotenv").config();
const express = require("express");
const cors = require("cors");
const eventRoutes = require("./routes/volunteerHistory");

const app = express();

// Enable CORS for all origins
app.use(cors({ origin: "http://localhost:5173" })); // Allow only frontend URL

app.use(express.json());

app.use("/api/volunteerHistory", eventRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
