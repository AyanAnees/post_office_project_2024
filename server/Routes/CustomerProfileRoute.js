const db = require("../db");
const url = require("url");
const parseBody = require("../Parsebody");
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../client/public/assets"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const CustomerProfileRoute = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const customerId = parsedUrl.query.customerId;
  const email = parsedUrl.query.email;

  if (req.method === "GET" && parsedUrl.pathname === "/api/customer") {
    if (!customerId && !email) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Customer ID or Email is required" }));
    }

    let query = "";
    let param = "";

    if (email) {
      query = `SELECT * FROM customer WHERE Customer_Email_Address = ?;`;
      param = email;
    } else if (customerId) {
      query = `SELECT * FROM customer WHERE Customer_ID = ?;`;
      param = customerId;
    }

    db.query(query, [param])
      .then(([results]) => {
        if (results.length > 0) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(results[0]));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Customer not found" }));
        }
      })
      .catch((error) => {
        console.error("Error querying customer:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Internal Server Error" }));
      });
  } else if (req.method === "POST" && parsedUrl.pathname === "/api/customer") {
    parseBody(req, async (body) => {
      const table = body.role;
      const { email, firstName, lastName, phoneNumber, dob, password } = body;

      const query = `
        INSERT INTO ${table} (
            Customer_Email_Address,
            Customer_First_Name,
            Customer_Last_Name,
            Customer_Phone_Number,
            Password
        ) VALUES (?, ?, ?, ?, ?);
        `;

      try {
        const [results] = await db.query(query, [
          email,
          firstName,
          lastName,
          phoneNumber,
          password,
        ]);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User created. Please sign in." }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Error creating user" }));
      }
    });
  } else if (req.method === "PUT" && parsedUrl.pathname === "/api/customer") {
    parseBody(req, async (body) => {
      const {
        Customer_ID,
        AvatarName,
        Customer_First_Name,
        Customer_Middle_Name,
        Customer_Last_Name,
        Customer_Phone_Number,
        Customer_Email_Address,
        Customer_Address_House_Number,
        Customer_Address_Street,
        Customer_Address_Suffix,
        Customer_Address_City,
        Customer_Address_State,
        Customer_Address_Zip_Code,
        Customer_Address_Country,
      } = body;

      const updateQuery = `
        UPDATE customer SET 
            Customer_First_Name = ?, 
            Customer_Middle_Name = ?, 
            Customer_Last_Name = ?,
            Customer_Phone_Number = ?, 
            Customer_Email_Address = ?, 
            Customer_Address_House_Number = ?, 
            Customer_Address_Street = ?, 
            Customer_Address_Suffix = ?, 
            Customer_Address_City = ?, 
            Customer_Address_State = ?, 
            Customer_Address_Zip_Code = ?, 
            Customer_Address_Country = ?
        WHERE Customer_ID = ?;
      `;
      //const avatarPath = AvatarName ? `assets/${AvatarName}` : null;

      try {
        await db.query(updateQuery, [
          //avatarPath,
          Customer_First_Name,
          Customer_Middle_Name,
          Customer_Last_Name,
          Customer_Phone_Number,
          Customer_Email_Address,
          Customer_Address_House_Number,
          Customer_Address_Street,
          Customer_Address_Suffix,
          Customer_Address_City,
          Customer_Address_State,
          Customer_Address_Zip_Code,
          Customer_Address_Country,
          Customer_ID,
        ]);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Customer updated successfully" }));
      } catch (error) {
        console.error("Error updating customer:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Internal Server Error" }));
      }
    });
  } else if (req.method === "PUT" && parsedUrl.pathname === "/api/customer/avatar") {

    upload.single("avatar")(req, res, (err) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "File upload failed" }));
      }

      if (req.file) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Avatar uploaded successfully", filePath: `assets/${req.file.filename}` }));
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "No file uploaded" }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not Found" }));
  }
};

module.exports = CustomerProfileRoute;
