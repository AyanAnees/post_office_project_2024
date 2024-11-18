import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { SERVER_URL } from "../../App";

const Dashboard = () => {
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [packages, setPackages] = useState([]);
    const [stops, setStops] = useState({});
    const [customerId, setCustomerId] = useState(null);
    const email = localStorage.getItem("Customer_Email_Address");

    useEffect(() => {
        document.body.classList.add('dashboard-page');
        const fetchCustomerId = async () => {
            try {
                const response = await fetch(`${SERVER_URL}/api/customer?email=${email}`);
                const data = await response.json();
                setCustomerId(data.Customer_ID);
            } catch (error) {
                console.error("Error fetching customer ID:", error);
            }
        };

        if (email) {
            fetchCustomerId();
        }
        return () => {
            document.body.classList.remove('dashboard-page');
        };
    }, [email]);

    useEffect(() => {
        const fetchPackages = async () => {
            if (!customerId) return;

            try {
                const response = await fetch(`${SERVER_URL}/packages?customerId=${customerId}`);
                const data = await response.json();
                setPackages(data);
            } catch (error) {
                console.error("Error fetching packages:", error);
            }
        };

        fetchPackages();
    }, [customerId]);

    const handlePackageClick = (packageId) => {
        if (selectedPackage === packageId) {
            setSelectedPackage(null); // Deselect package if already selected
        } else {
            setSelectedPackage(packageId); // Select the clicked package
            fetchPackageStops(packageId); // Fetch stops for the selected package
        }
    };

    const fetchPackageStops = async (packageId) => {
        try {
            const response = await fetch(`${SERVER_URL}/Stops/${packageId}`);
            const stopsData = await response.json();
            setStops((prevStops) => ({
                ...prevStops,
                [packageId]: stopsData, // Store stops by packageId
            }));
        } catch (error) {
            console.error("Error fetching package stops:", error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.toLocaleString('default', { weekday: 'long' });
        const month = date.toLocaleString('default', { month: 'long' });
        const dayOfMonth = date.getDate();
        const year = date.getFullYear();
        const time = date.toLocaleTimeString();

        return `${day}\n${month},${dayOfMonth},${year}\n${time} Local time`;
    };

    const formatDatenum = (dateString) => {
        if (!dateString) {
            return '';  // Return an empty string or any default value if the dateString is null or undefined
        }
        
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
        const dayOfMonth = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
    
        return `${year}-${month}-${dayOfMonth} ${hours}:${minutes}:${seconds} (Local time)`;
    };

    const formatLocation = (houseNumber, street, suffix, city, state, zipCode, country) => {
        return `${houseNumber} ${street} ${suffix}, ${city}, ${state} ${zipCode}, ${country}`;
    };

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <div className="table-wrapper">
            <table className="package-table">
                <thead>
                    <tr>
                        <th>Tracking ID</th>
                        <th>Package ID</th>
                        <th>Status</th>
                        <th>Sender</th>
                        <th>Recipient</th>
                        <th>Location</th>
                        <th>Arrival Date</th>
                    </tr>
                </thead>
                <tbody>
                    {packages.map((pkg) => (
                        <React.Fragment key={pkg.Package_ID}>
                            <tr onClick={() => handlePackageClick(pkg.Package_ID)} className={selectedPackage === pkg.Package_ID ? 'selected' : ''}>
                                <td>{pkg.Tracking_ID}</td>
                                <td>{pkg.Package_ID}</td>
                                <td>{pkg.Package_Status}</td>
                                <td>{pkg.Sender_Full_Name}</td>
                                <td>{pkg.Recipient_Full_Name}</td>
                                <td>{pkg.Latest_Location_Address}</td>
                                <td>{formatDatenum(pkg.Latest_Arrival_Date)}</td>
                            </tr>
                            {selectedPackage === pkg.Package_ID && (
                                <tr className="details-row">
                                    <td colSpan="7">
                                        <div className="details">
                                            <p><strong>Details for Tracking ID {pkg.Tracking_ID}:</strong></p>
                                            {stops[pkg.Package_ID]?.map((stop, index) => (
                                                <div key={index}>
                                                    <p><strong>{formatDate(stop.Stop_Arrival_Date)}</strong></p>
                                                    <p>{stop.Stop_Departure_Date ? `Departed: ${formatDate(stop.Stop_Departure_Date)}` : 'Not Departed Yet'}</p>
                                                    <p>{formatLocation(
                                                        stop.Location_Address_House_Number,
                                                        stop.Location_Address_Street,
                                                        stop.Location_Address_Suffix,
                                                        stop.Location_Address_City,
                                                        stop.Location_Address_State,
                                                        stop.Location_Address_Zip_Code,
                                                        stop.Location_Address_Country
                                                    )}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default Dashboard;
