import React, { useState, useEffect } from "react";
import Modal from '../Modal/Modal';
import "./AddLocation.css";

import { SERVER_URL } from "../../App";

const BasicTable = () => {
    const [data, setData] = useState([]);
    const [locationFields, setLocationFields] = useState({
        houseNumber: "",
        street: "",
        suffix: "",
        city: "",
        state: "",
        zipCode: "",
        country: ""
    });
    const [editMode, setEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editFields, setEditFields] = useState({ ...locationFields });
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const [locationToDelete, setLocationToDelete] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

    // Fetch locations from the API
    const fetchLocations = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/api/location`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();

            const formattedData = result.map((item) => ({
                location_id: item.Location_ID,
                address: `${item.Location_Address_House_Number} ${item.Location_Address_Street} ${item.Location_Address_Suffix || ''}, ${item.Location_Address_City}, ${item.Location_Address_State} ${item.Location_Address_Zip_Code}, ${item.Location_Address_Country}`
            }));
            setData(formattedData);
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocationFields((prev) => ({ ...prev, [name]: value }));
    };

    const clearInputFields = () => {
        setLocationFields({
            houseNumber: "",
            street: "",
            suffix: "",
            city: "",
            state: "",
            zipCode: "",
            country: ""
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newLocation = { ...locationFields };

        try {
            const response = await fetch(`${SERVER_URL}/api/location`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newLocation),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();

            setData((prev) => [
                ...prev,
                {
                    location_id: result.Location_ID,
                    address: `${result.Location_Address_House_Number} ${result.Location_Address_Street} ${result.Location_Address_Suffix || ''}, ${result.Location_Address_City}, ${result.Location_Address_State} ${result.Location_Address_Zip_Code}, ${result.Location_Address_Country}`
                },
            ]);
            clearInputFields();
        } catch (error) {
            console.error("Error adding location:", error);
        }
    };

    const handleEdit = (index) => {
        setEditMode(true);
        setEditIndex(index);
        const location = data[index];
        const addressParts = location.address.trim().split(", ");
        const houseAndStreet = addressParts[0].trim().split(" ");
        const city = addressParts[1];
        const stateZip = addressParts[2].split(" ");
        const country = addressParts[3];

        setEditFields({
            houseNumber: houseAndStreet[0],
            street: houseAndStreet.slice(1, houseAndStreet.length - 1).join(" "),
            suffix: houseAndStreet[houseAndStreet.length - 1],
            city,
            state: stateZip[0],
            zipCode: stateZip[1] || '',
            country
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const updatedLocation = { ...editFields };

        try {
            const response = await fetch(`${SERVER_URL}/api/location/${data[editIndex].location_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedLocation),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const updatedData = data.map((location, idx) =>
                idx === editIndex
                    ? {
                        ...location,
                        address: `${editFields.houseNumber} ${editFields.street} ${editFields.suffix}, ${editFields.city}, ${editFields.state} ${editFields.zipCode}, ${editFields.country}`,
                    }
                    : location
            );

            setData(updatedData);
            setEditMode(false);
            setEditIndex(null);
        } catch (error) {
            console.error("Error updating location:", error);
        }
    };

    const handleDelete = (location_id) => {
        setLocationToDelete(location_id); // Set the stop to delete
        setIsModalOpen(true); // Open the modal
    };

    const confirmDelete = async (location_id) => {
        if (!locationToDelete) return;
        try {
            const response = await fetch(`${SERVER_URL}/api/location/${locationToDelete}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            setData((prev) =>
                prev.map((location) =>
                    location.location_id === location_id ? { ...location, Delete_Location: 1 } : location
                )
            );
            await fetchLocations(); // Update website display
            setIsModalOpen(false);
            setLocationToDelete(null);
        } catch (error) {
            console.error("Error deleting location:", error);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setEditIndex(null);
        setEditFields({ ...locationFields }); // Reset to initial fields
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };


    const filteredData = data.filter((item) =>
        item.address.toLowerCase().includes(searchQuery)
    );

    return (
        <div className="table-container">
            <h2>Add a new Location</h2>
            <form onSubmit={handleSubmit}>
                {Object.keys(locationFields).map((key) => (
                    <input
                        key={key}
                        type="text"
                        name={key}
                        placeholder={key
                            .replace(/([A-Z])/g, " $1") // Insert a space before capital letters
                            .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
                        }
                        value={locationFields[key]}
                        onChange={handleInputChange}
                        required={key !== "suffix"} // Make 'suffix' optional
                    />
                ))}
                <button type="submit">Add Location</button>
            </form>


            <h2>Search Locations</h2>
            <input
                type="text"
                placeholder="Search by address"
                value={searchQuery}
                onChange={handleSearch}
            />

            <h2>Current Locations - Click On Location ID To Edit An Existing Location</h2>
            <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Location ID</th>
                            <th>Location Address</th>
                            <th className="center-header">Delete Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, index) => (
                            <tr key={item.location_id}>
                                <td>
                                    <button
                                        onClick={() => handleEdit(index)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "blue",
                                            textDecoration: "underline",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {item.location_id}
                                    </button>
                                </td>
                                <td>{item.address}</td>
                                <td className="delete-column">
                                    <button
                                        className="button-red"
                                        onClick={() => handleDelete(item.location_id)}
                                        style={{
                                            color: "red",
                                            textDecoration: "underline",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editMode && (
                <div>
                    <h2>Edit Location {data[editIndex].location_id}</h2>
                    <form onSubmit={handleUpdate}>
                        {Object.keys(editFields).map((key) => (
                            <input
                                key={key}
                                type="text"
                                name={key}
                                placeholder={key.replace(/([A-Z])/g, " ").replace(/^./, (str) => str.toUpperCase()) }
                                value={editFields[key]}
                                onChange={(e) =>
                                    setEditFields((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                                required={key !== "suffix"} // Make 'suffix' optional
                            />
                        ))}
                        <button type="submit">Update Location</button>
                        <button type="button" onClick={handleCancel} style={{ marginLeft: '10px' }}>
                            Cancel
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