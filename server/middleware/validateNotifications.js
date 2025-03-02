const validateNotificationUpdate = (req, res, next) => {
    const { id } = req.params;
    
    if (isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }
    
    next();
};
  
module.exports = {
    validateNotificationUpdate
};