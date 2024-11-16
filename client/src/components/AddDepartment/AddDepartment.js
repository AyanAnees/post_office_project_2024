import React, { useState, useEffect } from "react";
import Modal from '../Modal/Modal';
import "./AddDepartment.css";

import { SERVER_URL } from "../../App";

const AddDepartment = () => {
    const [data, setData] = useState([]);
    const [departmentFields, setDepartmentFields] = useState({
        departmentName: "",
        departmentManager: "",
        departmentLocation: ""
    });

    const [editMode, setEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editFields, setEditFields] = useState({ ...departmentFields });
    const [departmentToDelete, setDepartmentToDelete] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

    // Fetch departments, managers, and locations from the API
    const fetchDepartments = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/departments`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            setData(result); // Use the result directly as it contains all necessary fields
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDepartmentFields((prev) => ({ ...prev, [name]: value }));
    };

    const clearInputFields = () => {
        setDepartmentFields({
            departmentName: "",
            departmentManager: "",
            departmentLocation: ""
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newDepartment = { ...departmentFields };

        try {
            const response = await fetch(`${SERVER_URL}/departments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDepartment),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();

            setData((prev) => [...prev, result]);
            clearInputFields();
        } catch (error) {
            console.error('Error adding department:', error);
        }
    };

    const handleEdit = (index) => {
        setEditMode(true);
        setEditIndex(index);
        const department = data[index];
        setEditFields({
            departmentName: department.Department_Name,
            departmentManager: department.Department_Manager_ID,
            departmentLocation: department.Department_Location_ID
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const updatedDepartment = { ...editFields };

        try {
            const response = await fetch(`${SERVER_URL}/departments/${data[editIndex].Department_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedDepartment),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            fetchDepartments(); 
            setEditMode(false);
            setEditIndex(null);
        } catch (error) {
            console.error('Error updating department:', error);
        }
    };

    const handleDelete = (department_id) => {
        setDepartmentToDelete(department_id); // Set the stop to delete
        setIsModalOpen(true); // Open the modal
    };

    const confirmDelete = async (department_id) => {
        if (!departmentToDelete) return;
        try {
            const response = await fetch(`${SERVER_URL}/departments/${departmentToDelete}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            setData((prev) =>
                prev.filter(department => department.Department_ID !== department_id)
            );

            await fetchDepartments(); // Update website display
            setIsModalOpen(false);
            setDepartmentToDelete(null);
        } catch (error) {
            console.error('Error deleting department:', error);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setEditIndex(null);
        setEditFields({ ...departmentFields });
    };

    return (
        <div className="table-container">
            <h2>Add a New Department</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text"
                    name="departmentName"
                    placeholder="Department Name"
                    value={departmentFields.departmentName}
                    onChange={handleInputChange}
                    required
                />
                <input 
                    type="text"
                    name="departmentManager"
                    placeholder="Department Manager ID (Must be unique)"
                    value={departmentFields.departmentManager}
                    onChange={handleInputChange}
                    required
                />
                <input 
                    type="text"
                    name="departmentLocation"
                    placeholder="Department Location ID"
                    value={departmentFields.departmentLocation}
                    onChange={handleInputChange}
                    required
                />
                <button type="submit">Add Department</button>
            </form>

            <h2>Current Departments - Click On Department ID To Edit</h2>
            <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Department ID</th>
                            <th>Department Name</th>
                            <th>Manager Name</th>
                            <th>Location</th>
                            <th className="center-header">Delete Department</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            !item.Delete_Department && (
                                <tr key={item.Department_ID}>
                                    <td>
                                        <button onClick={() => handleEdit(index)} style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
                                            {item.Department_ID}
                                        </button>
                                    </td>
                                    <td>{item.Department_Name}</td>
                                    <td>{`${item.managerFirstName} ${item.managerLastName}`}</td>
                                    <td>{`${item.Location_Address_House_Number} ${item.Location_Address_Street}, ${item.Location_Address_City}, ${item.Location_Address_State} ${item.Location_Address_Zip_Code}, ${item.Location_Address_Country}`}</td>
                                    <td className="delete-column">
                                        <button className="button-red"
                                            onClick={() => handleDelete(item.Department_ID)}
                                            style={{ color: 'red', textDecoration: 'underline', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
            </div>

            {editMode && (
                <div>
                    <h2>Edit Department {data[editIndex].Department_ID}</h2>
                    <form onSubmit={handleUpdate}>
                        <input 
                            type="text"
                            name="departmentName"
                            placeholder="Department Name"
                            value={editFields.departmentName}
                            onChange={(e) => setEditFields((prev) => ({ ...prev, departmentName: e.target.value }))} 
                            required
                        />
                        <input 
                            type="text"
                            name="departmentManager"
                            placeholder="Department Manager ID"
                            value={editFields.departmentManager}
                            onChange={(e) => setEditFields((prev) => ({ ...prev, departmentManager: e.target.value }))} 
                            required
                        />
                        <input 
                            type="text"
                            name="departmentLocation"
                            placeholder="Department Location ID"
                            value={editFields.departmentLocation}
                            onChange={(e) => setEditFields((prev) => ({ ...prev, departmentLocation: e.target.value }))} 
                            required
                        />
                        <button type="submit">Update Department</button>
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

export default AddDepartment;