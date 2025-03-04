let notifications = [
    {
      id: 1,
      type: 'volunteer_signup',
      message: 'New volunteer signup: Jane Smith',
      timestamp: '2025-02-07T10:00:00',
      read: false,
      details: 'Contact: jane.smith@gmail.com',
      userRole: 'admin'
    },
    {
      id: 2,
      type: 'event_update',
      message: 'Event "Charity Gala" has been modified',
      timestamp: '2025-01-24T15:00:00',
      read: false,
      details: 'New date approved',
      userRole: 'admin'
    },
    {
      id: 3,
      type: 'event_creation',
      message: 'Event "Toy Drive" has been created',
      timestamp: '2025-01-24T17:00:00',
      read: false,
      details: 'Admin John Doe has initiated the creation',
      userRole: 'admin'
    },
    {
      id: 4,
      type: 'event_reminder',
      message: 'Upcoming Event: Charity Gala tomorrow',
      timestamp: '2025-02-07T10:00:00',
      read: false,
      details: "Event gala will feature a chocolate fountain",
      userRole: 'volunteer'
    },
    {
      id: 5,
      type: 'schedule_change',
      message: 'Your volunteer shift has been updated',
      timestamp: '2025-01-24T15:00:00',
      read: false,
      details: "You will need to usher the kids in",
      userRole: 'volunteer'
    },
    {
      id: 6,
      type: 'new_event',
      message: 'New volunteer opportunity available',
      timestamp: '2025-01-08T17:00:00',
      read: false,
      details: "Get it while you can!",
      userRole: 'volunteer'
    }
  ];
  
  const getNotifications = (req, res) => {
    const { type, unread, userRole } = req.query;
    
    let filteredNotifications = [...notifications];
    
    if (userRole) {
      filteredNotifications = filteredNotifications.filter(
        notif => notif.userRole === userRole
      );
    }
    
    if (type && type !== 'all') {
      filteredNotifications = filteredNotifications.filter(
        notif => notif.type === type
      );
    }
    
    if (unread === 'true') {
      filteredNotifications = filteredNotifications.filter(
        notif => notif.read === false
      );
    }
    
    res.json(filteredNotifications);
  };
  
  const markAsRead = (req, res) => {
    const { id } = req.params;
    const notificationId = parseInt(id, 10);
    
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notification.read = true;
    
    res.json(notification);
  };
  
  const markAllAsRead = (req, res) => {
    const { userRole } = req.query;
    
    if (userRole) {
      notifications = notifications.map(notif => 
        notif.userRole === userRole ? { ...notif, read: true } : notif
      );
    } else {
      notifications = notifications.map(notif => ({ ...notif, read: true }));
    }
    
    res.json({ success: true });
};
  
module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};