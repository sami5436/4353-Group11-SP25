const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: String,
  volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const userSchema = new mongoose.Schema({
  name: String,
});

const Event = mongoose.model('Event', eventSchema);
const User = mongoose.model('User', userSchema);

const getAssignments = async (req, res) => {
  const { volunteerId } = req.query;

  if (!volunteerId) {
    return res.status(400).json({ error: 'Volunteer ID is required' });
  }

  try {
    // Validate if the volunteer exists
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    // Find events with the volunteer ID in the volunteers array
    const assignedEvents = await Event.find({ volunteers: volunteerId });

    if (assignedEvents.length === 0) {
      return res.status(404).json({ error: 'No events found for this volunteer.' });
    }

    res.json(assignedEvents);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = {
  getAssignments,
};
