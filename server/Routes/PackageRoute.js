// packagesRoute.js
const db = require('../db'); // Adjust path if necessary

module.exports = function packagesRoute(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const customerId = parsedUrl.searchParams.get('customerId');

    if (!customerId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Customer ID is required' }));
    }

    // Retrieve packages and their latest stop information where customer is the sender or recipient
    const query = `
    SELECT 
    th.Tracking_ID,
    p.Package_ID,
    p.Package_Status,
    s.Stop_Arrival_Date AS Latest_Arrival_Date,
    CONCAT(
        l.Location_Address_House_Number, ' ',
        l.Location_Address_Street, ' ',
        COALESCE(l.Location_Address_Suffix, ''), ', ',
        l.Location_Address_City, ', ',
        l.Location_Address_State, ' ',
        l.Location_Address_Zip_Code, ', ',
        l.Location_Address_Country
    ) AS Latest_Location_Address,
    CONCAT(cs.Customer_First_Name, ' ', 
           COALESCE(cs.Customer_Middle_Name, ''), ' ', 
           cs.Customer_Last_Name) AS Sender_Full_Name,
    CONCAT(cr.Customer_First_Name, ' ', 
           COALESCE(cr.Customer_Middle_Name, ''), ' ', 
           cr.Customer_Last_Name) AS Recipient_Full_Name,
    p.Sender_ID,
    p.Recipient_ID
    FROM package p
    LEFT JOIN tracking_history th ON p.Package_ID = th.Package_ID
    LEFT JOIN (
        SELECT Stop_Package_ID, MAX(Stop_Arrival_Date) AS Latest_Arrival_Date
        FROM stop
        GROUP BY Stop_Package_ID
    ) AS latest_stop ON p.Package_ID = latest_stop.Stop_Package_ID
    LEFT JOIN stop s ON latest_stop.Stop_Package_ID = s.Stop_Package_ID 
        AND latest_stop.Latest_Arrival_Date = s.Stop_Arrival_Date
    LEFT JOIN location l ON s.Stop_Location = l.Location_ID
    JOIN customer AS cs ON p.Sender_ID = cs.Customer_ID
    JOIN customer AS cr ON p.Recipient_ID = cr.Customer_ID
    WHERE (p.Sender_ID = ? OR p.Recipient_ID = ?)
        AND (p.Package_Status IS NOT NULL AND p.Delete_Package = FALSE)
    ORDER BY p.Package_Status DESC, s.Stop_Arrival_Date DESC;
  `;

    db.query(query, [customerId, customerId])
        .then(([rows]) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(rows));
        })
        .catch((error) => {
            console.error('Error fetching packages:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        });
};
