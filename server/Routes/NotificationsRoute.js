const db = require('../db'); // Import your database connection
const url = require('url');

const handleNotificationsRoutes = (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Check if the request is for fetching notifications
    if (req.method === 'GET' && parsedUrl.pathname.startsWith('/api/notifications')) {
        const { userId, userType } = parsedUrl.query;

        if (!userType || typeof userType !== 'string' || (userType !== 'manager' && !userId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Missing or invalid userId or userType' }));
        }


        const query = userType === "manager"
        ? `
            SELECT Message, Created_At 
            FROM Notifications 
            WHERE Notification_Type = ? 
            ORDER BY Created_At DESC
            `
        : `
            SELECT Message, Created_At 
            FROM Notifications 
            WHERE Customer_ID = ? AND Notification_Type = ? 
            ORDER BY Created_At DESC
            `;

        if (userType === "manager") {
            db.query(query, [userType])
            .then(([results]) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(results));
            })
            .catch((error) => {
                console.error('Error fetching notifications:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            });
        } else {
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
    }
};

module.exports = handleNotificationsRoutes;
