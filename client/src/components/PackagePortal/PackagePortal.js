import React, { useState, useEffect, useCallback } from "react";
import Modal from '../Modal/Modal';
import { useNavigate } from "react-router-dom";
import "./PackagePortal.css";

import { SERVER_URL } from "../../App";

const BasicTable = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchColumn, setSearchColumn] = useState("sender_name");

    // Separate states for add and edit forms
    const [addFormValues, setAddFormValues] = useState({
        senderId: "",
        recipientId: "",
        houseNumber: "",
        street: "",
        suffix: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        length: "",
        width: "",
        height: "",
        weight: "",
        shippingMethod: "Ground",
        packageStatus: "Received",
    });
    const [editFormValues, setEditFormValues] = useState({ ...addFormValues });

    const [editMode, setEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState(null);

    const formatPackageItem = (item) => ({
        package_id: item.Package_ID,
        sender_id: item.Sender_ID,
        sender_name: `${item.Sender_First_Name} ${item.Sender_Last_Name}`,
        recipient_id: item.Recipient_ID,
        recipient_name: `${item.Recipient_First_Name} ${item.Recipient_Last_Name}`,
        destination_address: `${item.Package_House_Number} ${item.Package_Street} ${item.Package_Suffix || ''}, ${item.Package_City}, ${item.Package_State} ${item.Package_Zip_Code}, ${item.Package_Country}`,
        houseNumber: item.Package_House_Number,
        street: item.Package_Street,
        suffix: item.Package_Suffix,
        city: item.Package_City,
        state: item.Package_State,
        zipCode: item.Package_Zip_Code,
        country: item.Package_Country,
        package_status: item.Package_Status,
        length: item.Package_Length,
        width: item.Package_Width,
        height: item.Package_Height,
        weight: item.Package_Weight,
        shipping_method: item.Package_Shipping_Method,
        shipping_cost: item.Package_Shipping_Cost
    });

    const fetchPackage = useCallback(async () => {
        try {
            const response = await fetch(`${SERVER_URL}/api/PackagePortal`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            const formattedData = result.map(formatPackageItem);
            setData(formattedData);
            setFilteredData(formattedData);
        } catch (error) {
            console.error('Error fetching packages:', error);
        }
    }, []);

    useEffect(() => {
        fetchPackage();
    }, [fetchPackage]);

    useEffect(() => {
        const filtered = data.filter(pkg => {
            const valueToSearch = pkg[searchColumn]?.toString().toLowerCase() || '';
            return valueToSearch.includes(searchQuery.toLowerCase());
        });
        setFilteredData(filtered);
    }, [searchQuery, searchColumn, data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleColumnChange = (e) => {
        setSearchColumn(e.target.value);
        setSearchQuery("");
    };

    const validateCustomerId = async (senderId, recipientId) => {
        try {
            // Check if senderId exists
            const senderResponse = await fetch(`${SERVER_URL}/api/customer?customerId=${senderId}`);
            if (!senderResponse.ok) {
                throw new Error(`Sender ID ${senderId} does not exist`);
            }

            // Check if recipientId exists
            const recipientResponse = await fetch(`${SERVER_URL}/api/customer?customerId=${recipientId}`);
            if (!recipientResponse.ok) {
                throw new Error(`Recipient ID ${recipientId} does not exist`);
            }

            return true;  // Both IDs are valid
        } catch (error) {
            console.error('Validation error:', error);
            return false;  // One or both IDs are invalid
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const Employee_ID = localStorage.getItem("Employee_ID")

        const isValid = await validateCustomerId(addFormValues.senderId, addFormValues.recipientId);
        if (!isValid) {
            alert("Invalid Sender or Recipient ID. Please check the IDs and try again.");
            return;  // Stop the update process if IDs are invalid
        }

        const newPackage = { ...addFormValues, Employee_ID };

        try {
            const response = await fetch(`${SERVER_URL}/api/PackagePortal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPackage),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            // Optionally fetch the updated list of packages
            await fetchPackage(); // Fetch the updated data after adding a package

            // Clear the add form values
            setAddFormValues({
                senderId: "",
                recipientId: "",
                houseNumber: "",
                street: "",
                suffix: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
                length: "",
                width: "",
                height: "",
                weight: "",
                shippingMethod: "Ground",
                packageStatus: "Received",
            });
        } catch (error) {
            console.error('Error adding package:', error);
        }
    };

    const handleEdit = (index) => {
        setEditMode(true);
        setEditIndex(index);
        const pkg = filteredData[index];

        setEditFormValues({
            senderId: pkg.sender_id,
            recipientId: pkg.recipient_id,
            houseNumber: pkg.houseNumber || '',
            street: pkg.street || '',
            suffix: pkg.suffix || '',
            city: pkg.city || '',
            state: pkg.state || '',
            zipCode: pkg.zipCode || '',
            country: pkg.country || '',
            packageStatus: pkg.package_status,
            length: pkg.length,
            width: pkg.width,
            height: pkg.height,
            weight: pkg.weight,
            shippingMethod: pkg.shipping_method,
        });

        // Clear add form values when entering edit mode
        setAddFormValues({
            senderId: "", recipientId: "", houseNumber: "", street: "", suffix: "", city: "", state: "", zipCode: "", country: "", length: "", width: "", height: "", weight: "", shippingMethod: "Ground", packageStatus: "Received"
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        const isValid = await validateCustomerId(editFormValues.senderId, editFormValues.recipientId);
        if (!isValid) {
            alert("Invalid Sender or Recipient ID. Please check the IDs and try again.");
            return;  // Stop the update process if IDs are invalid
        }
        const updatedPackage = { ...editFormValues, package_id: filteredData[editIndex].package_id };

        try {
            const response = await fetch(`${SERVER_URL}/api/PackagePortal/${data[editIndex].package_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPackage),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            await fetchPackage();
            resetEditFields();
        } catch (error) {
            console.error('Error updating package:', error);
        }
    };

    const resetEditFields = () => {
        setEditMode(false);
        setEditIndex(null);
        setEditFormValues({ ...addFormValues }); // Resetting to initial add form values
    };

    const handleDelete = (package_id) => {
        setPackageToDelete(package_id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!packageToDelete) return;

        try {
            const response = await fetch(`${SERVER_URL}/api/PackagePortal/${packageToDelete}`, { method: 'PATCH' });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            await fetchPackage();
            setIsModalOpen(false);
            setPackageToDelete(null);
        } catch (error) {
            console.error('Error deleting package:', error);
        }
    };

    return (
        <div className="table-container">
            <h2>Add Package</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="senderId" placeholder="Sender ID" value={addFormValues.senderId} onChange={handleChange} required />
                <input type="text" name="recipientId" placeholder="Recipient ID" value={addFormValues.recipientId} onChange={handleChange} required />
                <input type="text" name="houseNumber" placeholder="House Number" value={addFormValues.houseNumber} onChange={handleChange} required />
                <input type="text" name="street" placeholder="Street" value={addFormValues.street} onChange={handleChange} required />
                <input type="text" name="suffix" placeholder="Suffix" value={addFormValues.suffix} onChange={handleChange} required />
                <input type="text" name="city" placeholder="City" value={addFormValues.city} onChange={handleChange} required />
                <input type="text" name="state" placeholder="State" value={addFormValues.state} onChange={handleChange} required />
                <input type="text" name="zipCode" placeholder="Zip Code" value={addFormValues.zipCode} onChange={handleChange} required />
                <input type="text" name="country" placeholder="Country" value={addFormValues.country} onChange={handleChange} required />
                <input type="number" name="length" placeholder="Length" value={addFormValues.length} onChange={handleChange} required />
                <input type="number" name="width" placeholder="Width" value={addFormValues.width} onChange={handleChange} required />
                <input type="number" name="height" placeholder="Height" value={addFormValues.height} onChange={handleChange} required />
                <input type="number" name="weight" placeholder="Weight" value={addFormValues.weight} onChange={handleChange} required />
                <select name="shippingMethod" value={addFormValues.shippingMethod} onChange={handleChange}>
                    <option value="Ground">Ground</option>
                    <option value="Air">Air</option>
                    <option value="Express">Express</option>
                </select>
                <select name="packageStatus" value={addFormValues.packageStatus} onChange={handleChange}>
                    <option value="Received">Received</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                </select>
                <button type="submit">Add Package</button>
            </form>

            <select value={searchColumn} onChange={handleColumnChange}>
                <option value="package_id">Package ID</option>
                <option value="sender_name">Sender Name</option>
                <option value="recipient_name">Recipient Name</option>
                <option value="destination_address">Destination Address</option>
            </select>
            <input
                type="text"
                placeholder={`Search by ${searchColumn.replace('_', ' ')}`}
                value={searchQuery}
                onChange={handleSearchChange}
            />

            <h2>Current Packages - Click On Package ID To Edit</h2>
            <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Package ID</th>
                            <th>Sender</th>
                            <th>Recipient</th>
                            <th>Destination</th>
                            <th>Status</th>
                            <th>(L x W x H) In</th> {/* Updated header */}
                            <th>Weight lbs</th>
                            <th>Shipping Method</th>
                            <th>Shipping Cost</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((pkg, index) => (
                            <tr key={pkg.package_id}>
                                <td>
                                    <button
                                        onClick={() => handleEdit(index)}
                                        style={{ color: 'blue', textDecoration: 'underline', background: 'none', border: 'none', padding: 0 }}
                                    >
                                        {pkg.package_id}
                                    </button>
                                </td>
                                <td>{pkg.sender_name}</td>
                                <td>{pkg.recipient_name}</td>
                                <td>{pkg.destination_address}</td>
                                <td>{pkg.package_status}</td>
                                <td>{`${pkg.length} x ${pkg.width} x ${pkg.height}`}</td> {/* Combined dimensions for display */}
                                <td>{pkg.weight}</td>
                                <td>{pkg.shipping_method}</td>
                                <td>{pkg.shipping_cost}</td>
                                <td>
                                    <button onClick={() => handleDelete(pkg.package_id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editMode && (
                <div>
                    <h2>Edit Package {filteredData[editIndex].package_id}</h2>
                    <form onSubmit={handleUpdate}>
                        <input type="text" name="senderId" placeholder="Sender ID" value={editFormValues.senderId} onChange={(e) => setEditFormValues({ ...editFormValues, senderId: e.target.value })} required />
                        <input type="text" name="recipientId" placeholder="Recipient ID" value={editFormValues.recipientId} onChange={(e) => setEditFormValues({ ...editFormValues, recipientId: e.target.value })} required />
                        <input type="text" name="houseNumber" placeholder="House Number" value={editFormValues.houseNumber} onChange={(e) => setEditFormValues({ ...editFormValues, houseNumber: e.target.value })} required />
                        <input type="text" name="street" placeholder="Street" value={editFormValues.street} onChange={(e) => setEditFormValues({ ...editFormValues, street: e.target.value })} required />
                        <input type="text" name="suffix" placeholder="Suffix" value={editFormValues.suffix} onChange={(e) => setEditFormValues({ ...editFormValues, suffix: e.target.value })} required />
                        <input type="text" name="city" placeholder="City" value={editFormValues.city} onChange={(e) => setEditFormValues({ ...editFormValues, city: e.target.value })} required />
                        <input type="text" name="state" placeholder="State" value={editFormValues.state} onChange={(e) => setEditFormValues({ ...editFormValues, state: e.target.value })} required />
                        <input type="text" name="zipCode" placeholder="Zip Code" value={editFormValues.zipCode} onChange={(e) => setEditFormValues({ ...editFormValues, zipCode: e.target.value })} required />
                        <input type="text" name="country" placeholder="Country" value={editFormValues.country} onChange={(e) => setEditFormValues({ ...editFormValues, country: e.target.value })} required />
                        <input type="number" name="length" placeholder="Length" value={editFormValues.length} onChange={(e) => setEditFormValues({ ...editFormValues, length: e.target.value })} required />
                        <input type="number" name="width" placeholder="Width" value={editFormValues.width} onChange={(e) => setEditFormValues({ ...editFormValues, width: e.target.value })} required />
                        <input type="number" name="height" placeholder="Height" value={editFormValues.height} onChange={(e) => setEditFormValues({ ...editFormValues, height: e.target.value })} required />
                        <input type="number" name="weight" placeholder="Weight" value={editFormValues.weight} onChange={(e) => setEditFormValues({ ...editFormValues, weight: e.target.value })} required />
                        <select name="shippingMethod" value={editFormValues.shippingMethod} onChange={(e) => setEditFormValues({ ...editFormValues, shippingMethod: e.target.value })}>
                            <option value="Ground">Ground</option>
                            <option value="Air">Air</option>
                            <option value="Express">Express</option>
                        </select>
                        <select name="packageStatus" value={editFormValues.packageStatus} onChange={(e) => setEditFormValues({ ...editFormValues, packageStatus: e.target.value })}>
                            <option value="Received">Received</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                        <button type="submit">Update Package</button>
                        <button type="button" onClick={resetEditFields}>Cancel</button>
                        <button type="button" onClick={() => navigate(`/stops/${filteredData[editIndex].package_id}`)}>
                            View Stops
                        </button>
                    </form>
                </div>
            )}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
            />
        </div>
    );
};

export default BasicTable;
