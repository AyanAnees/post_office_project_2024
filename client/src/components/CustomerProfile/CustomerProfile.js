import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerProfile.css";
import { SERVER_URL } from "../../App";
import { RoleContext } from "../../App";
const CustomerProfile = () => {
  const navigate = useNavigate();
  const { setRole } = useContext(RoleContext);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  //const [newAvatar, setNewAvatar] = useState(null);
  //const [previewAvatar, setPreviewAvatar] = useState(null);

  const fetchCustomerData = async () => {
    const email = localStorage.getItem("Customer_Email_Address");
    if (!email) {
      alert("Account not found, Please log in again.");
      window.location.replace("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SERVER_URL}/api/customer?email=${email}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Customer not found.");
        }
        throw new Error("Failed to fetch customer data. Please try again later.");
      }
      const data = await response.json();
      setCustomerInfo(data);
    } catch (err) {
      setError(err.message);
      setCustomerInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleEdit = () => setEditMode(true);
  const handleLogout = () => {
    localStorage.clear();
    setRole(""); // Clear role in global context
    navigate("/login");
  }

  //const handleFileChange = (e) => {
    //const file = e.target.files[0];
    //setNewAvatar(file);
    //setPreviewAvatar(URL.createObjectURL(file));
  //};

  const uploadAvatar = async () => {
    //if (!newAvatar) return null;

    const formData = new FormData();
    //formData.append("avatar", newAvatar);

    try {
      const response = await fetch(`${SERVER_URL}/api/customer/avatar`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar.");
      }

      const result = await response.json();
      alert(result.message);
      return result.filePath;
    } catch (err) {
      console.error("Error uploading avatar:", err);
      setError("Failed to upload avatar.");
      return null;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const avatarPath = await uploadAvatar();
      const updatedData = {
        ...customerInfo,
        AvatarName: avatarPath ? avatarPath.split("/").pop() : customerInfo.Avatar_URL,
      };

      const response = await fetch(`${SERVER_URL}/api/customer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer data. Please try again later.");
      }

      const result = await response.json();
      alert(result.message);
      fetchCustomerData();
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p>Loading customer data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="C_Information">
      <h1>&nbsp;</h1>
      <h1 className="h">Information</h1>
      {customerInfo && (
        <div className="customer-info">
          {!editMode ? (
            <div>
              <img
                src={`/${customerInfo.Avatar_URL}`}
                alt="User Avatar"
                className="Avatar"
              />
              <p className="C_Information">
                <strong>Name:</strong>{" "}
                {`${customerInfo.Customer_First_Name} ${
                  customerInfo.Customer_Middle_Name || ""
                } ${customerInfo.Customer_Last_Name}`}
              </p>
              <p className="C_Information">
                <strong>Phone Number:</strong>{" "}
                {customerInfo.Customer_Phone_Number}
              </p>
              <p className="C_Information">
                <strong>Email:</strong> {customerInfo.Customer_Email_Address}
              </p>
              <p className="C_Information">
                <strong>Address:</strong>{" "}
                {`${customerInfo.Customer_Address_House_Number} ${
                  customerInfo.Customer_Address_Street
                } ${customerInfo.Customer_Address_Suffix || ""}, ${
                  customerInfo.Customer_Address_City
                }, ${customerInfo.Customer_Address_State} ${
                  customerInfo.Customer_Address_Zip_Code
                }, ${customerInfo.Customer_Address_Country}`}
              </p>
              <p className="C_Information">
                <strong>Balance:</strong> ${customerInfo.Customer_Balance}
              </p>
              <button onClick={handleEdit} className="button">
                Edit
              </button>
              <button onClick={handleLogout} className="button">
                Logout
              </button>
            </div>
          ) : (
            <form className="form-table">
              <table className="form-table">
                <tr>
                  {/*<td className="label">Avatar:</td>
                  <td>
                    <img
                      src={previewAvatar || `/${customerInfo.Avatar_URL}`}
                      className="Avatar"
                      alt=""
                    />
                    <input type="file" onChange={handleFileChange} accept="image/*" />
                  </td>*/}
                </tr>
                <tr>
                  <td className="label">Customer Name:</td>
                  <td>
                    <input
                      type="text"
                      name="Customer_First_Name"
                      value={customerInfo.Customer_First_Name}
                      onChange={handleChange}
                      placeholder="First Name"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="Customer_Middle_Name"
                      value={customerInfo.Customer_Middle_Name}
                      onChange={handleChange}
                      placeholder="Middle Name"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="Customer_Last_Name"
                      value={customerInfo.Customer_Last_Name}
                      onChange={handleChange}
                      placeholder="Last Name"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="label">Phone Number:</td>
                  <td colspan="3">
                    <input
                      type="text"
                      name="Customer_Phone_Number"
                      value={customerInfo.Customer_Phone_Number}
                      onChange={handleChange}
                      placeholder="Phone Number"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="label">Email:</td>
                  <td colspan="3">
                    <input
                      type="email"
                      name="Customer_Email_Address"
                      value={customerInfo.Customer_Email_Address}
                      onChange={handleChange}
                      placeholder="Email"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="label">Address:</td>
                  <td>
                    <input
                      type="text"
                      name="Customer_Address_House_Number"
                      value={customerInfo.Customer_Address_House_Number}
                      onChange={handleChange}
                      placeholder="House Number"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="Customer_Address_Street"
                      value={customerInfo.Customer_Address_Street}
                      onChange={handleChange}
                      placeholder="Street"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="Customer_Address_Suffix"
                      value={customerInfo.Customer_Address_Suffix}
                      onChange={handleChange}
                      placeholder="Suffix"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="label">City:</td>
                  <td colspan="3">
                    <input
                      type="text"
                      name="Customer_Address_City"
                      value={customerInfo.Customer_Address_City}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="label">State:</td>
                  <td colspan="3">
                    <input
                      type="text"
                      name="Customer_Address_State"
                      value={customerInfo.Customer_Address_State}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="label">Zip Code:</td>
                  <td colspan="3">
                    <input
                      type="text"
                      name="Customer_Address_Zip_Code"
                      value={customerInfo.Customer_Address_Zip_Code}
                      onChange={handleChange}
                      placeholder="Zip Code"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="label">Country:</td>
                  <td colspan="3">
                    <input
                      type="text"
                      name="Customer_Address_Country"
                      value={customerInfo.Customer_Address_Country}
                      onChange={handleChange}
                      placeholder="Country"
                    />
                  </td>
                </tr>
                <tr>
                  <td colspan="4" className="button-container">
                    <button type="button" onClick={handleSave} className="updateButton">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditMode(false)} className="updateButton">
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

export default CustomerProfile;
