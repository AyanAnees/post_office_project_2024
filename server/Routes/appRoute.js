const url = require("url");
const handleLocationRoutes = require("./AddLocationRoute"); // Adjust the path as necessary
const handleCustomerRoutes = require("./CustomerProfileRoute"); // Add other routes as necessary
const handleLoginRoutes = require("./LoginRoute"); // Add other routes as necessary
const handlePackagePortalRoutes = require("./PackagePortalRoute");
const handleStopRoutes = require("./StopRoute");
const handleTrackingRoutes = require("./TrackingHistoryRoute");
const handleEmployeeShopRoutes = require("./EmployeeShopRoute");//employee shop
const handleCustomerShopRoutes = require("./ShopRoute");//customer shop
const handleReportsRoute = require("./ReportsRoute");//reports
const handleDepartmentRoute = require("./AddDepartmentRoute");
const handleEmployeeRoutes = require("./EmployeeProfileRoute");
const handlePackagesRoute = require("./PackageRoute");
const handleManagerPortalRoutes = require("./ManagerPortalRoute");
const handleNotificationsRoutes = require('./NotificationsRoute');

const appRoute = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;

  console.log(`${method} ${parsedUrl.pathname}`);

  // Route handling
  if (parsedUrl.pathname.startsWith("/api/location")) {
    handleLocationRoutes(req, res);
  } else if (parsedUrl.pathname.startsWith("/api/customer")) {
    if (parsedUrl.pathname === "/api/customer/balance") {
      handleCustomerShopRoutes(req, res);
    } else {
      handleCustomerRoutes(req, res);
    }
  } else if (parsedUrl.pathname.startsWith("/api/login")) {
    handleLoginRoutes(req, res);
  } else if (parsedUrl.pathname.startsWith("/api/PackagePortal")) {
    handlePackagePortalRoutes(req, res);
  } else if (parsedUrl.pathname.startsWith("/Stops")) {
    handleStopRoutes(req, res);
  } else if (parsedUrl.pathname.startsWith("/api/reports")) {
    handleReportsRoute(req, res);
  } else if (parsedUrl.pathname.startsWith("/shop")) { // Why are there two of these?
    handleShopRoute(req, res); // Different handler here
  } else if (parsedUrl.pathname.startsWith("/departments")) {
    handleDepartmentRoute(req, res);
  } else if (parsedUrl.pathname.startsWith("/api/tracking")) {
    handleTrackingRoutes(req, res);
  } else if (parsedUrl.pathname.startsWith("/api/reports")) {
    handleReportRoutes(req, res);
  } else if (parsedUrl.pathname.startsWith("/shop")) { // Why are there two of these?
    handleEmployeeShopRoutes(req, res); // Different handler here
  } else if (parsedUrl.pathname.startsWith("/api/shop")) {
    handleCustomerShopRoutes(req, res);
  } else if (parsedUrl.pathname.startsWith("/api/employee")) {
    handleEmployeeRoutes(req, res);
  } else if (parsedUrl.pathname.startsWith("/packages")) {
    handlePackagesRoute(req, res);
  } else if (parsedUrl.pathname.startsWith("/api/ManagerPortal")) {
    handleManagerPortalRoutes(req, res);
  }
  else if (parsedUrl.pathname.startsWith('/api/notifications')) {
    handleNotificationsRoutes(req, res);
}

  else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not Found" }));
  }
};

module.exports = appRoute;

appRoute.js;
