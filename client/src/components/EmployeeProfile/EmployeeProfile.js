
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoleContext } from "../../App"; // Import the context
import "./EmployeeProfile.css";

import { SERVER_URL } from "../../App";

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const { setRole } = useContext(RoleContext);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Fetch employee data based on the email from localStorage
  useEffect(() => {
    const fetchEmployeeData = async () => {
      const email = localStorage.getItem("Employee_Email");
      if (!email) {
        alert("Account not found, Please log in again.");
        window.location.replace("/login");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${SERVER_URL}/api/employee?email=${email}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Employee not found.");
          }
          throw new Error(
            "Failed to fetch employee data. Please try again later."
          );
        }
        const data = await response.json();

        if (data.DOB) {
          data.DOB = new Date(data.DOB).toISOString().split("T")[0];
        }

        setEmployeeInfo(data);
      } catch (err) {
        setError(err.message);
        setEmployeeInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  const handleEdit = () => setEditMode(true);
  const handleLogout = () => {
    localStorage.clear();
    setRole(""); 
    navigate("/login");
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SERVER_URL}/api/employee`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeInfo),
      });

      if (!response.ok) {
        throw new Error(
          "Failed to update employee data. Please try again later."
        );
      }

      const result = await response.json();
      alert(result.message);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeInfo((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p>Loading employee data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="Information">
      <h1>&nbsp;</h1>
      <h1 className="h">Employee Information</h1>
      {employeeInfo && (
        <div className="Information">
          {!editMode ? (
            <div>
              <p className="Information">
                <strong>Name:</strong>{" "}
                {`${employeeInfo.First_Name} ${employeeInfo.Middle_Name || ""} ${
                  employeeInfo.Last_Name
                }`}
              </p>
              <p className="Information">
                <strong>Phone Number:</strong> {employeeInfo.Phone_Number}
              </p>
              <p className="Information">
                <strong>Email:</strong> {employeeInfo.Email}
              </p>
              <p className="Information">
                <strong>Date of Birth:</strong> {employeeInfo.DOB}
              </p>
              <button onClick={handleEdit} className="button">
                Edit
              </button>
              <button onClick={handleLogout} className="button">
                Logout
              </button>
            </div>
          ) : (
            <form className="form-container">
              <table className="form-table">
                <tr>
                  <td className="label">Employee Name:</td>
                  <td>
                    <input
                      type="text"
                      name="First_Name"
                      value={employeeInfo.First_Name}
                      onChange={handleChange}
                      placeholder="First Name"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="Middle_Name"
                      value={employeeInfo.Middle_Name}
                      onChange={handleChange}
                      placeholder="Middle Name"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="Last_Name"
                      value={employeeInfo.Last_Name}
                      onChange={handleChange}
                      placeholder="Last Name"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="label">Phone Number:</td>
                  <td colspan="5">
                    <input
                      type="text"
                      name="Phone_Number"
                      value={employeeInfo.Phone_Number}
                      onChange={handleChange}
                      placeholder="Phone Number"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="label">Email:</td>
                  <td colspan="5">
                    <input
                      type="email"
                      name="Email"
                      value={employeeInfo.Email}
                      onChange={handleChange}
                      placeholder="Email"
                    />
                  </td>
                </tr>
{/* 
                <tr>
                  <td className="label">Date of Birth:</td>
                  <td colspan="5">
                    <input
                      type="date"
                      name="DOB"
                      value={employeeInfo.DOB}
                      onChange={handleChange}
                      placeholder="Date of Birth"
                    />
                  </td>
                </tr>
*/}
                <tr>
                  <td colspan="6" className="button-container">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="updateButton"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="updateButton"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              </table>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;