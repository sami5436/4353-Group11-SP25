const express = require("express");
const { getAdminProfile, updateAdminProfile } = require("../controllers/adminProfile");
const { validateAdminProfile } = require("../middleware/validateAdminProfile");

const router = express.Router();

router.get("/", getAdminProfile);

router.put("/", validateAdminProfile, updateAdminProfile);

module.exports = router;