const express = require("express");
const router = express.Router();
const eventsReportController = require("../controllers/eventsReport");

router.get("/summary", eventsReportController.getReportSummary);

router.get("/engagement", eventsReportController.getVolunteerEngagement);

router.get("/distribution", eventsReportController.getEventDistribution);

router.get("/skills", eventsReportController.getSkillsDistribution);

router.get("/locations", eventsReportController.getTopLocations);

module.exports = router;