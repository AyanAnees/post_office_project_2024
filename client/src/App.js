import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
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

export const RoleContext = createContext();

// Function to determine navigation links based on user role
const getLinksForRole = (role) => {
  switch (role) {
    case "customer":
      return [
        ["", "Home"],
        ["Dashboard", "Dashboard"],
        ["TrackingHistory", "Tracking History"],
        ["Shop", "Shop"],
        ["Notifications", "Notifications"],
        ["AboutUs", "About"],
        ["Contactus", "Contact Us"],
        ["CustomerProfile", "Profile"],
      ];
    case "employee":
      return [
        ["", "Home"],
        ["PackagePortal", "Package Portal"],
        ["TrackingHistory", "Tracking History"],
        ["Notifications", "Notifications"],
        ["EmployeeShop", "Shop"],
        ["Reports", "Reports"],
        ["EmployeeProfile", "Profile"],
      ];
    case "manager":
      return [
        ["", "Home"],
        ["PackagePortal", "Package Portal"],
        ["TrackingHistory", "Tracking History"],
        ["ManagerPortal", "Manager Portal"],
        ["Notifications", "Notifications"],
        ["EmployeeShop", "Shop"],
        ["Reports", "Reports"],
        ["EmployeeProfile", "Profile"],
      ];
    case "Admin":
      return [
        ["", "Home"],
        ["PackagePortal", "Package Portal"],
        ["TrackingHistory", "Tracking History"],
        ["Notifications", "Notifications"],
        ["Reports", "Reports"],
        ["ManagerPortal", "Manager Portal"],
        ["AddDepartment", "Add Department"],
        ["AddLocation", "Add Location"],
        ["EmployeeShop", "Shop"],
        ["EmployeeProfile", "Profile"],
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

// Component for role-based protected routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role } = useContext(RoleContext);

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/Login" replace />;
  }

  return children;
};

const App = () => {
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole || "");
  }, []);

  const links = getLinksForRole(role);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <Router>
        <Navbar links={links} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/Shop" element={<Shop />} />
          <Route path="/PackagePortal" element={
            <ProtectedRoute allowedRoles={["employee", "manager", "Admin"]}>
              <PackagePortal />
            </ProtectedRoute>
          } />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/TrackingHistory" element={
            <ProtectedRoute allowedRoles={["customer", "employee", "manager", "Admin"]}>
              <TrackingHistory />
            </ProtectedRoute>
          } />
          <Route path="/CustomerProfile" element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerProfile />
            </ProtectedRoute>
          } />
          <Route path="/EmployeeProfile" element={
            <ProtectedRoute allowedRoles={["employee", "manager", "Admin"]}>
              <EmployeeProfile />
            </ProtectedRoute>
          } />
          <Route path="/ManagerPortal" element={
            <ProtectedRoute allowedRoles={["manager", "Admin"]}>
              <ManagerPortal />
            </ProtectedRoute>
          } />
          <Route path="/Dashboard" element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/Reports" element={
            <ProtectedRoute allowedRoles={["employee", "manager", "Admin"]}>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/AddDepartment" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AddDepartment />
            </ProtectedRoute>
          } />
          <Route path="/AddLocation" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AddLocation />
            </ProtectedRoute>
          } />
          <Route path="/EmployeeShop" element={
            <ProtectedRoute allowedRoles={["employee", "manager", "Admin"]}>
              <EmployeeShop />
            </ProtectedRoute>
          } />
          <Route path="/stops/:packageId" element={
            <ProtectedRoute allowedRoles={["employee", "manager", "Admin"]}>
              <Stops />
            </ProtectedRoute>
          } />
          <Route path="/ContactUS" element={<Contact />} />
          <Route path="/CustomerSearch" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <CustomerSearch />
            </ProtectedRoute>
          } />
          <Route path="/Notifications" element={
            <ProtectedRoute allowedRoles={["customer", "employee", "manager", "Admin"]}>
              <Notifications />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </RoleContext.Provider>
  );
};

export default App;
