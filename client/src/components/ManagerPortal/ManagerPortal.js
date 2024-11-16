import React, { useState, useEffect, useCallback } from "react";
import Modal from '../Modal/Modal';
import "./ManagerPortal.css";
import { SERVER_URL } from "../../App";

const ManagerPortal = () => {
    const [employees, setEmployees] = useState([]);
    const [location, setLocation] = useState(""); // To store the location
    const [departmentId, setDepartmentId] = useState(""); // To store the department ID
    const [locationId, setLocationId] = useState("");
    const [employeeData, setEmployeeData] = useState({
        Employee_ID: "",
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        locationId: "",
        departmentId: "",
        managerID: "",
    });

    const [editMode, setEditMode] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [editIndex, setEditIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editEmployeeData, setEditEmployeeData] = useState({ ...employeeData });
    const managerID = localStorage.getItem("Employee_ID");

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await fetch(`${SERVER_URL}/api/ManagerPortal/${managerID}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            setEmployees(result);
            if (result.length > 0) {
                setLocation(`${result[0].Location_Address_House_Number} ${result[0].Location_Address_Street || ''} ${result[0].Location_Address_Suffix || ''}, ${result[0].Location_Address_City}, ${result[0].Location_Address_State} ${result[0].Location_Address_Zip_Code}, ${result[0].Location_Address_Country}`);
                setDepartmentId(result[0].Department_ID);
                setLocationId(result[0].Department_Location_ID);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    }, [managerID]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployeeData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditEmployeeData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newEmployeeData = {
            ...employeeData,
            locationId,
            departmentId,
            managerID: 5,
        };

        try {
            const response = await fetch(`${SERVER_URL}/api/ManagerPortal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEmployeeData),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const newEmployee = await response.json();
            setEmployees((prev) => [...prev, newEmployee]);
            clearInputFields();
        } catch (error) {
            console.error('Error adding employee:', error);
        }
    };

    const clearInputFields = () => {
        setEmployeeData({
            Employee_ID: "",
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            dateOfBirth: "",
            locationId: "",
            departmentId: "",
            managerID: ""
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toISOString().slice(0, 10);
    };

    const handleEdit = (index) => {
        const employee = employees[index];

        const formattedDateOfBirth = formatDate(employee.DOB) || '';

        setEditMode(true);
        setEditIndex(index);
        setEditEmployeeData({
            Employee_ID: employee.Employee_ID,
            firstName: employee.First_Name,
            middleName: employee.Middle_Name,
            lastName: employee.Last_Name,
            email: employee.Email,
            phoneNumber: employee.Phone_Number,
            dateOfBirth: formattedDateOfBirth,
            locationId: employee.Employee_Location_ID,
            departmentId: employee.Employee_Department_ID,
            managerID: employee.Employee_Manager_ID,
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const updatedEmployeeData = {
            ...editEmployeeData,
            locationId,
            departmentId,
            managerID: 5,
        };

        try {
            const response = await fetch(`${SERVER_URL}/api/ManagerPortal/${editEmployeeData.Employee_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEmployeeData),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const updatedEmployees = employees.map((employee, idx) =>
                idx === editIndex ? { ...employee, ...updatedEmployeeData } : employee
            );
            setEmployees(updatedEmployees);
            fetchEmployees();
            setEditMode(false);
            setEditIndex(null);
            clearInputFields();
        } catch (error) {
            console.error('Error updating employee:', error);
        }
    };

    const handleDelete = (Employee_ID) => {
        setEmployeeToDelete(Employee_ID);  // Set the employee to delete
        setIsModalOpen(true);  // Open the modal
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return; // Ensure employeeToDelete is set

        try {
            const response = await fetch(`${SERVER_URL}/api/ManagerPortal/${employeeToDelete}`, {
                method: "PATCH", // Assuming PATCH is for soft delete
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ Delete_Employee: true }) // You may want to set this as true or false depending on your DB
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            setEmployees((prev) =>
                prev.filter((employee) => employee.Employee_ID !== employeeToDelete)
            );
            setIsModalOpen(false); // Close the modal
            setEmployeeToDelete(null); // Reset the employeeToDelete state
        } catch (error) {
            console.error("Error deleting employee:", error);
        }
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditIndex(null);
        clearInputFields();
    };

    const formatPhoneNumber = (phoneNumber) => {
        if (!phoneNumber) return phoneNumber;
        const cleaned = phoneNumber.replace(/\D/g, "");
        const match = cleaned.match(/(\d{3})(\d{3})(\d{4})/);
        return match ? `${match[1]}-${match[2]}-${match[3]}` : phoneNumber;
    };

    return (
        <div className="table-container">
            <h2>{"Add a new Employee"}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={employeeData.firstName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="middleName"
                    placeholder="Middle Name (optional)"
                    value={employeeData.middleName}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={employeeData.lastName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={employeeData.phoneNumber}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={employeeData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="dateOfBirth"
                    placeholder="Date of Birth"
                    value={employeeData.dateOfBirth}
                    onChange={handleChange}
                    required
                />
                <button type="submit">{"Add Employee"}</button>
            </form>

            {employees.length > 0 && (
                <>
                    <h2>Current Employees In Department {departmentId} at {location}</h2>
                    <h2>Click On Employee ID To Edit</h2>
                </>
            )}

            <div className="table-scroll">
                {employees.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Name</th>
                                <th>Phone Number</th>
                                <th>Email</th>
                                <th className="center-header">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee, index) => (
                                <tr key={employee.Employee_ID}>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(index)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'blue',
                                                textDecoration: 'underline',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {employee.Employee_ID}
                                        </button>
                                    </td>
                                    <td>{`${employee.First_Name} ${employee.Middle_Name ? employee.Middle_Name + ' ' : ''}${employee.Last_Name}`}</td>
                                    <td>{formatPhoneNumber(employee.Phone_Number)}</td>
                                    <td>{employee.Email}</td>
                                    <td className="delete-column">
                                        <button
                                            onClick={() => handleDelete(employee.Employee_ID)}
                                            style={{
                                                color: 'red',
                                                textDecoration: 'underline',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ textAlign: 'center', marginTop: '20px' }}>No employees to display</p>
                )}
            </div>


            {editMode && (
                <div className="edit-menu">
                    <h2>Edit Employee {editEmployeeData.Employee_ID}</h2>
                    <form onSubmit={handleUpdate}>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={editEmployeeData.firstName}
                            onChange={handleEditChange}
                            required
                        />
                        <input
                            type="text"
                            name="middleName"
                            placeholder="Middle Name (optional)"
                            value={editEmployeeData.middleName}
                            onChange={handleEditChange}
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={editEmployeeData.lastName}
                            onChange={handleEditChange}
                            required
                        />
                        <input
                            type="text"
                            name="phoneNumber"
                            placeholder="Phone Number"
                            value={editEmployeeData.phoneNumber}
                            onChange={handleEditChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={editEmployeeData.email}
                            onChange={handleEditChange}
                            required
                        />
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={editEmployeeData.dateOfBirth}
                            onChange={handleEditChange}
                            required
                        />
                        <button type="submit">Update Employee</button>
                        <button type="button" onClick={handleCancelEdit}>Cancel</button>
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

export default ManagerPortal;