const db = require('../db'); // Import your database connection
const url = require('url');

const handleNotificationsRoutes = (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Check if the request is for fetching notifications
    if (req.method === 'GET' && parsedUrl.pathname.startsWith('/api/notifications')) {
        const { userId, userType } = parsedUrl.query;

        if (!userId || !userType) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Missing userId or userType' }));
        }

        const query = `
            SELECT Message, Created_At 
            FROM Notifications 
            WHERE Customer_ID = ? AND Notification_Type = ? 
            ORDER BY Created_At DESC
        `;

        db.query(query, [userId, userType])
            .then(([results]) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(results));
            })
            .catch((error) => {
                console.error('Error fetching notifications:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            });
    }
};

module.exports = handleNotificationsRoutes;
