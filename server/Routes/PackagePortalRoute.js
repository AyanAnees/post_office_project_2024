const db = require('../db'); // Import database connection
const url = require('url');
const parseBody = require('../Parsebody');

const PackagePortalRoute = (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // SQL query to retrieve package information
    const infoQuery = `
        SELECT 
            p.Package_ID, p.Sender_ID, p.Recipient_ID,
            cs.Customer_First_Name AS Sender_First_Name,
            cs.Customer_Last_Name AS Sender_Last_Name,
            cr.Customer_First_Name AS Recipient_First_Name,
            cr.Customer_Last_Name AS Recipient_Last_Name,
            p.Package_House_Number, p.Package_Street, p.Package_Suffix,
            p.Package_City, p.Package_State, p.Package_Zip_Code,
            p.Package_Country, p.Package_Status, p.Package_Length,
            p.Package_Width, p.Package_Height, p.Package_Weight,
            p.Package_Shipping_Method, p.Package_Shipping_Cost
        FROM 
            package AS p
        JOIN 
            customer AS cs ON p.Sender_ID = cs.Customer_ID
        JOIN 
            customer AS cr ON p.Recipient_ID = cr.Customer_ID
        WHERE 
            p.Delete_Package != 1
        ORDER BY 
            p.Package_ID;
    `;

    const validatePackageFields = (body) => {
        const requiredFields = [
            'senderId', 'recipientId', 'houseNumber', 'street',
            'suffix', 'city', 'state', 'zipCode',
            'country', 'packageStatus', 'length', 'width',
            'height', 'weight', 'shippingMethod'
        ];
        return requiredFields.every(field => body[field]);
    };

    const CalCost = (height, length, width, weight, shippingMethod) => {
        const shippingMethodCosts = { 'Express': 15, 'Air': 7, 'Ground': 0 };
        const methodCost = shippingMethodCosts[shippingMethod] || 0;
        return Math.ceil(length / 6) + Math.ceil(width / 6) +
            Math.ceil(height / 6) + Math.ceil(weight) + methodCost;
    };

    switch (req.method) {
        // Handle GET request to retrieve all packages
        case 'GET':
            if (parsedUrl.pathname === '/api/PackagePortal') {
                db.query(infoQuery)
                    .then(([results]) => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(results));
                    })
                    .catch(error => {
                        console.error('Error querying packages:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    });
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Not Found' }));
            }
            break;

        // Handle POST request to create a new package
        case 'POST':
            if (parsedUrl.pathname === '/api/PackagePortal') {
                parseBody(req, async (body) => {
                    if (!validatePackageFields(body)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ message: 'All fields are required' }));
                    }
        
                    try {
                        const {
                            senderId, recipientId, houseNumber, street, suffix,
                            city, state, zipCode, country, packageStatus,
                            length, width, height, weight, shippingMethod, Employee_ID
                        } = body;
        
                        // Start transaction
                        const connection = await db.getConnection();
                        await connection.beginTransaction();
        
                        try {
                            const cost = CalCost(length,width,height,weight,shippingMethod)
                            // Step 1: Insert the package
                            const insertPackageQuery = `
                                INSERT INTO package (
                                    Sender_ID, Recipient_ID, Package_House_Number, Package_Street, 
                                    Package_Suffix, Package_City, Package_State, Package_Zip_Code, 
                                    Package_Country, Package_Status, Package_Length, Package_Width, 
                                    Package_Height, Package_Weight, Package_Shipping_Method, Package_Shipping_Cost
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                            `;
                            const [packageResult] = await connection.query(insertPackageQuery, [
                                senderId, recipientId, houseNumber, street, suffix,
                                city, state, zipCode, country, packageStatus,
                                length, width, height, weight, shippingMethod, cost
                            ]);
        
                            const packageId = packageResult.insertId;
        
                            // Step 2: Insert into tracking_history
                            const insertTrackingQuery = `
                                INSERT INTO tracking_history (
                                    Package_ID, Arrival_Date, Package_Status, Recipient_ID
                                ) VALUES (?, NOW(), ?, ?);
                            `;
                            await connection.query(insertTrackingQuery, [packageId, packageStatus, recipientId]);
        
                            // Step 3: Find the employee's department location
                            const findLocationQuery = `
                                SELECT d.Department_Location_ID
                                FROM employee AS e
                                JOIN departments AS d ON e.Employee_Department_ID = d.Department_ID
                                WHERE e.Employee_ID = ? AND e.Delete_Employee = FALSE;
                            `;
                            const [locationRows] = await connection.query(findLocationQuery, [Employee_ID]);
        
                            // Check if locationRows is not empty
                            if (locationRows.length === 0) {
                                res.writeHead(404, { 'Content-Type': 'application/json' });
                                return res.end(JSON.stringify({ error: 'Employee not found or employee is deleted.' }));
                            }
        
                            // Extract the Department_Location_ID
                            const stopLocation = locationRows[0].Department_Location_ID;
        
                            // Step 4: Insert into stop
                            const insertStopQuery = `
                                INSERT INTO stop (
                                    Stop_Package_ID, Stop_Location, Stop_Arrival_Date, Stop_Departure_Date, Delete_Stop
                                ) VALUES (?, ?, NOW(), NULL, FALSE);
                            `;
                            await connection.query(insertStopQuery, [packageId, stopLocation]);
        
                            // Commit transaction
                            await connection.commit();
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Package added successfully.', packageId }));
                        } catch (err) {
                            // Rollback transaction in case of error
                            await connection.rollback();
                            console.error(err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'An error occurred while adding the package.' }));
                        } finally {
                            connection.release();
                        }
                    } catch (err) {
                        console.error(err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'An error occurred while adding the package.' }));
                    }
                });
            }
            break;        

        // Handle PUT request to update an existing package
        case 'PUT':
            if (parsedUrl.pathname.startsWith('/api/PackagePortal/')) {
                const Package_ID = parsedUrl.pathname.split('/')[3];
                parseBody(req, async (body) => {
                    if (!validatePackageFields(body) || !Package_ID) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ message: 'All fields are required' }));
                    }

                    const { senderId, recipientId, houseNumber, street, suffix,
                        city, state, zipCode, country, packageStatus,
                        length, width, height, weight, shippingMethod } = body;

                    const cost = CalCost(height, length, width, weight, shippingMethod);

                    try {
                        const updateQuery = `
                            UPDATE package 
                            SET 
                                Sender_ID = ?, Recipient_ID = ?, Package_House_Number = ?, Package_Street = ?, 
                                Package_Suffix = ?, Package_City = ?, Package_State = ?, Package_Zip_Code = ?, 
                                Package_Country = ?, Package_Status = ?, Package_Length = ?, Package_Width = ?, 
                                Package_Height = ?, Package_Weight = ?, Package_Shipping_Method = ?, Package_Shipping_Cost = ?
                            WHERE 
                                Package_ID = ?;
                        `;

                        await db.query(updateQuery, [
                            senderId, recipientId, houseNumber, street,
                            suffix, city, state, zipCode,
                            country, packageStatus, length, width,
                            height, weight, shippingMethod, cost, Package_ID
                        ]);

                        const [updatedPackageQuery] = await db.query(infoQuery);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(updatedPackageQuery[0]));
                    } catch (error) {
                        console.error('Error updating package:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    }
                });
            }
            break;

        // Handle PATCH request to mark a package as deleted
        case 'PATCH':
            if (parsedUrl.pathname.startsWith('/api/PackagePortal/')) {
                const Package_ID = parsedUrl.pathname.split('/')[3]; // Extract Package_ID from URL
                const deleteQuery = `UPDATE package SET Delete_Package = 1 WHERE Package_ID = ?;`;

                db.query(deleteQuery, [Package_ID])
                    .then(() => {
                        res.writeHead(204); // No content
                        res.end();
                    })
                    .catch(error => {
                        console.error('Error deleting package:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    });
            }
            break;

        // Handle unmatched routes
        default:
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Not Found' }));
            break;
    }
};

module.exports = PackagePortalRoute;
