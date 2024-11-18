const db = require('../db'); // Import your db connection
const url = require('url');
const parseBody = require('../Parsebody');

const handleContactRoutes = async (req, res) => { 
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'POST' && parsedUrl.pathname === '/api/contact') {
        parseBody(req, async (body) => {
            const { Customer_ID,name, email, subject, urgency, message } = body;

            if (!name || !email || !subject || !message) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'All fields are required.' }));
            }

            try {
                const insertQuery = `
                INSERT INTO contact_us_messages (Customer_ID,Name, Email, Subject, Urgency, Message, Created_At)
                VALUES (?,?, ?, ?, ?, ?, NOW());
                `;

                await db.query(insertQuery, [Customer_ID,name, email, subject, urgency || 'Normal', message]);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Message received successfully!' }));
            } catch (error) {
                console.error('Error inserting contact message:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
        });
    } else if (req.method === 'GET' && parsedUrl.pathname === '/api/contact') {
        const { customerId, urgency } = parsedUrl.query;

        let selectQuery = `SELECT * FROM contact_us_messages`;
        const queryParams = [];

        if (customerId || urgency) {
            const conditions = [];

            if (customerId) {
                conditions.push('Customer_ID = ?');
                queryParams.push(customerId);
            }

            if (urgency) {
                conditions.push('Urgency = ?');
                queryParams.push(urgency);
            }

            selectQuery += ` WHERE ${conditions.join(' AND ')}`;
        }

        selectQuery += ' ORDER BY Created_At DESC';

        try {
            const [results] = await db.query(selectQuery, queryParams);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        } catch (error) {
            console.error('Error fetching contact messages:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
    } else if (req.method === 'DELETE' && parsedUrl.pathname.startsWith('/api/contact/')) {
        const messageId = parsedUrl.pathname.split('/')[3];
        if (!messageId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Message ID is required' }));
        }

        try {
            const deleteQuery = `DELETE FROM contact_us_messages WHERE Message_ID = ?;`;
            await db.query(deleteQuery, [messageId]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Message deleted successfully' }));
        } catch (error) {
            console.error('Error deleting contact message:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }
};

module.exports = handleContactRoutes;
