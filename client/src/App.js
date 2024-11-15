// IMPORTANT PART (REVERT IN CASE ISSUES)


// import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import { useEffect, useState } from "react";
// import AboutUs from "./components/AboutUs/AboutUs";
// import AddDepartment from "./components/AddDepartment/AddDepartment";
// import AddLocation from "./components/AddLocation/AddLocation";
// import CustomerProfile from "./components/CustomerProfile/CustomerProfile";
// import Dashboard from "./components/Dashboard/Dashboard";
// import EmployeeProfile from "./components/EmployeeProfile/EmployeeProfile";
// import Home from "./components/Home/Home";
// import Login from "./components/Login/Login";
// import ManagerPortal from "./components/ManagerPortal/ManagerPortal";
// import Navbar from "./components/navBar/navBar";
// import PackagePortal from "./components/PackagePortal/PackagePortal";
// import Reports from "./components/Reports/Reports";
// import Shop from "./components/Shop/Shop";
// import SignUp from "./components/SignUp/SignUp";
// import TrackingHistory from "./components/TrackingHistory/TrackingHistory";
// import EmployeeShop from "./components/Shop/EmployeeShop";
// import Stops from "./components/PackagePortal/Stops";
// import Contact from "./components/ContactUS/contact";
// import CustomerSearch from "./components/CustomerSearch/CustomerSearch";

// const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:3001";
// export { SERVER_URL };

// // Function to determine navigation links based on user role
// const getLinksForRole = (role) => {
//   switch (role) {
//     case "customer":
//       return [
//         ["", "Home"],
//         ["Dashboard", "Dashboard"],
//         ["TrackingHistory", "Tracking History"],
//         ["Shop", "Shop"],
//         ["AboutUs", "About"],
//         ["Contactus", "Contact Us"],
//         ["CustomerProfile", "Profile"],
//       ];
//     case "employee":
//       return [
//         ["", "Home"],
//         ["PackagePortal", "Package Portal"],
//         ["TrackingHistory", "Tracking History"],
//         ["EmployeeProfile", "Profile"],
//         ["EmployeeShop", "Shop"],
//         ["Reports", "Reports"],
//       ];
//     case "manager":
//       return [
//         ["", "Home"],
//         ["PackagePortal", "Package Portal"],
//         ["TrackingHistory", "Tracking History"],
//         ["ManagerPortal", "Manager Portal"],
//         ["EmployeeProfile", "Profile"],
//         ["EmployeeShop", "Shop"],
//         ["Reports", "Reports"],
//       ];
//     case "Admin":
//       return [
//         ["", "Home"],
//         ["PackagePortal", "Package Portal"],
//         ["TrackingHistory", "Tracking History"],
//         ["Reports", "Reports"],
//         ["ManagerPortal", "Manager Portal"],
//         ["AddDepartment", "Add Department"],
//         ["AddLocation", "Add Location"],
//         ["EmployeeProfile", "Profile"],
//         ["EmployeeShop", "Shop"],
//       ];
//     default:
//       return [
//         ["", "Home"],
//         ["Shop", "Shop"],
//         ["AboutUs", "About Us"],
//         ["Contactus", "Contact Us"],
//         ["Login", "Login/Register"]
//       ];
//   }
// };

// const App = () => {
//   const [role, setRole] = useState(localStorage.getItem("role") || "");

//   // Update role dynamically when localStorage changes
//   useEffect(() => {
//     const storedRole = localStorage.getItem("role");
//     setRole(storedRole || "");
//   }, []);

//   const links = getLinksForRole(role);

//   return (
//     <Router>
//       <Navbar links={links} />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/Login" element={<Login />} />
//         <Route path="/SignUp" element={<SignUp />} />
//         <Route path="/Shop" element={<Shop />} />
//         <Route path="/PackagePortal" element={<PackagePortal />} />
//         <Route path="/AboutUs" element={<AboutUs />} />
//         <Route path="/TrackingHistory" element={<TrackingHistory />} />
//         <Route path="/CustomerProfile" element={<CustomerProfile />} />
//         <Route path="/EmployeeProfile" element={<EmployeeProfile />} />
//         <Route path="/ManagerPortal" element={<ManagerPortal />} />
//         <Route path="/Dashboard" element={<Dashboard />} />
//         <Route path="/Reports" element={<Reports />} />
//         <Route path="/AddDepartment" element={<AddDepartment />} />
//         <Route path="/AddLocation" element={<AddLocation />} />
//         <Route path="/EmployeeShop" element={<EmployeeShop />} />
//         <Route path="/stops/:packageId" element={<Stops />} />
//         <Route path="/ContactUS" element={<Contact />} />
//         <Route path="/CustomerSearch" element={<CustomerSearch />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;


import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import AboutUs from "./components/AboutUs/AboutUs";
import AddDepartment from "./components/AddDepartment/AddDepartment";
import AddLocation from "./components/AddLocation/AddLocation";
import CustomerProfile from "./components/CustomerProfile/CustomerProfile";
import Dashboard from "./components/Dashboard/Dashboard";
import EmployeeProfile from "./components/EmployeeProfile/EmployeeProfile";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import ManagerPortal from "./components/ManagerPortal/ManagerPortal";
import Navbar from "./components/navBar/navBar";
import PackagePortal from "./components/PackagePortal/PackagePortal";
import Reports from "./components/Reports/Reports";
import Shop from "./components/Shop/Shop";
import SignUp from "./components/SignUp/SignUp";
import TrackingHistory from "./components/TrackingHistory/TrackingHistory";
import EmployeeShop from "./components/Shop/EmployeeShop";
import Stops from "./components/PackagePortal/Stops";
import Contact from "./components/ContactUS/contact";
import CustomerSearch from "./components/CustomerSearch/CustomerSearch";
import Notifications from "./components/Notifications/Notifications"; // Import Notifications component

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:3001";
export { SERVER_URL };

// Function to determine navigation links based on user role
const getLinksForRole = (role) => {
  switch (role) {
    case "customer":
      return [
        ["", "Home"],
        ["Dashboard", "Dashboard"],
        ["TrackingHistory", "Tracking History"],
        ["Shop", "Shop"],
        ["Notifications", "Notifications"], // Add Notifications tab
        ["AboutUs", "About"],
        ["Contactus", "Contact Us"],
        ["CustomerProfile", "Profile"],
      ];
    case "employee":
      return [
        ["", "Home"],
        ["PackagePortal", "Package Portal"],
        ["TrackingHistory", "Tracking History"],
        ["Notifications", "Notifications"], // Add Notifications tab
        ["EmployeeProfile", "Profile"],
        ["EmployeeShop", "Shop"],
        ["Reports", "Reports"],
      ];
    case "manager":
      return [
        ["", "Home"],
        ["PackagePortal", "Package Portal"],
        ["TrackingHistory", "Tracking History"],
        ["ManagerPortal", "Manager Portal"],
        ["Notifications", "Notifications"], // Add Notifications tab
        ["EmployeeProfile", "Profile"],
        ["EmployeeShop", "Shop"],
        ["Reports", "Reports"],
      ];
    case "Admin":
      return [
        ["", "Home"],
        ["PackagePortal", "Package Portal"],
        ["TrackingHistory", "Tracking History"],
        ["Notifications", "Notifications"], // Add Notifications tab
        ["Reports", "Reports"],
        ["ManagerPortal", "Manager Portal"],
        ["AddDepartment", "Add Department"],
        ["AddLocation", "Add Location"],
        ["EmployeeProfile", "Profile"],
        ["EmployeeShop", "Shop"],
      ];
    default:
      return [
        ["", "Home"],
        ["Shop", "Shop"],
        ["AboutUs", "About Us"],
        ["Contactus", "Contact Us"],
        ["Login", "Login/Register"],
      ];
  }
};

const App = () => {
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  // Update role dynamically when localStorage changes
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole || "");
  }, []);

  const links = getLinksForRole(role);

  return (
    <Router>
      <Navbar links={links} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/Shop" element={<Shop />} />
        <Route path="/PackagePortal" element={<PackagePortal />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/TrackingHistory" element={<TrackingHistory />} />
        <Route path="/CustomerProfile" element={<CustomerProfile />} />
        <Route path="/EmployeeProfile" element={<EmployeeProfile />} />
        <Route path="/ManagerPortal" element={<ManagerPortal />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Reports" element={<Reports />} />
        <Route path="/AddDepartment" element={<AddDepartment />} />
        <Route path="/AddLocation" element={<AddLocation />} />
        <Route path="/EmployeeShop" element={<EmployeeShop />} />
        <Route path="/stops/:packageId" element={<Stops />} />
        <Route path="/ContactUS" element={<Contact />} />
        <Route path="/CustomerSearch" element={<CustomerSearch />} />
        <Route path="/Notifications" element={<Notifications />} /> {/* Add Notifications route */}
      </Routes>
    </Router>
  );
};

export default App;

