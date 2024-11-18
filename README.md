# Cougarmail Depot

## Overview

Cougarmail Depot (also referred to as the "Post Office Project 2024" on GitHub) is a package delivery management system designed to streamline inventory, track package deliveries, and generate detailed reports. The system supports multiple user roles, providing distinct functionalities tailored for customers, employees, and managers. With a React.js frontend, Javascript/Node.js backend, and a MySQL database, the project delivers a robust and scalable solution for modern package delivery operations.


## Technologies Used

Backend: JavaScript (Node.js)
Frontend: React.js
Database: MySQL


## Installation

### Prerequisites:

Node.js: Install Node.js (v14 or higher).
MySQL: Install MySQL.
Git: Clone the repository.

### Steps
1. Clone the Repository:
Git clone https://github.com/AyanAnees/post_office_project_2024.git

2. Install Dependencies:
Open the terminal and navigate to the client directory:
- cd client
- npm install

If you are still in the client directory, go back to the root directory:


- cd ..
- cd server
- npm install

3. Configure Environment Variables
Create a .env file in the project server directory with the following template:
`
- DB_HOST=
- DB_USER=
- DB_NAME=
- DB_PASSWORD=
- DB_PORT=
- DB_SSL_REJECT_UNAUTHORIZED=
`

4. Import Database

### 5. Start the Application:
At the client side:
- cd client
- npm start

  
At the server side: 
- cd server
- npx nodemon server.js 
or
- node server.js

