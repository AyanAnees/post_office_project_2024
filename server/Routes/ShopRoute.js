const db = require('../db'); // Import database connection
const url = require('url');
const parseBody = require('../Parsebody');

const customerShopRoute = (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    switch (req.method) {
        // Handle GET request to retrieve all products
        case 'GET':
            
            if (parsedUrl.pathname === '/api/customer/shop') {
                const customerID = parsedUrl.query.customerID;

                if (!customerID) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Customer ID is required' }));
                    return;
                }


            } else if (parsedUrl.pathname === '/api/shop') {
                const query = 'SELECT * FROM products WHERE Delete_Product != 1';
                db.query(query)
                    .then(([results]) => {
                        // Convert BLOB to Base64 string
                        const products = results.map(product => {
                            if (product.Product_Image) {
                                product.Product_Image = Buffer.from(product.Product_Image).toString('base64');
                            }
                            return product;
                        });
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(products));
                    })
                    .catch(error => {
                        console.error('Error fetching products:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    });
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Not Found' }));
            }
            break;

        case 'POST':
            if (parsedUrl.pathname === '/api/shop') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', async () => {
                    const { cart, customerID, totalAmount } = JSON.parse(body);

                    if (!Array.isArray(cart) || !customerID || totalAmount === undefined) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Invalid cart format or missing parameters' }));
                        return;
                    }

                    try {
                        const transactionDate = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');



                        for (const item of cart) {
                            const { Product_ID, Quantity } = item;

                            // Check product prices and inventory
                            const [product] = await db.query('SELECT Product_Price, Product_Stock FROM products WHERE Product_ID = ?', [Product_ID]);
                            const productPrice = product[0].Product_Price;
                            const currentStock = product[0].Product_Stock;

                            if (Quantity > currentStock) {
                                res.writeHead(400, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ message: `Insufficient stock for product ID ${Product_ID}` }));
                                return;
                            }

                            // Insert to transactions
                            await db.query(
                                'INSERT INTO transactions (Customer_ID, Amount_Deducted, Transaction_Date, Quantity, Product_ID) VALUES (?, ?, ?, ?, ?)',
                                [customerID, productPrice * Quantity, transactionDate, Quantity, Product_ID]
                            );

                            // UPDATE Product_Stock
                            await db.query(
                                'UPDATE products SET Product_Stock = Product_Stock - ? WHERE Product_ID = ?',
                                [Quantity, Product_ID]
                            );
                        }


                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Payment success' }));
                    } catch (error) {
                        console.error('Error processing checkout:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Checkout failed' }));
                    }
                });
            }
            break;

        default:
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Method Not Allowed' }));
            break;
    }
};

module.exports = customerShopRoute;
