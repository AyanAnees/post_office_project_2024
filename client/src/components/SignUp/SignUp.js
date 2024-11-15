import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Login/Login.css";

import { SERVER_URL } from "../../App";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    // role: "customer",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { firstName, lastName, dob, email, password, confirmPassword } =
      formData;

    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";
    if (!dob) newErrors.dob = "Date of birth is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    const today = new Date();
    const dobDate = new Date(dob);
    const age = today.getFullYear() - dobDate.getFullYear();
    const ageCheck =
      today.getMonth() - dobDate.getMonth() ||
      today.getDate() - dobDate.getDate();
    if (age < 13 || (age === 13 && ageCheck < 0)) {
      newErrors.dob = "You must be at least 13 years old";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const response = await fetch(`${SERVER_URL}/api/customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    const message = result.message;

    alert(message);
    if (response.ok) {
      navigate("/login");
    }
  };

  return (
    <div className="login-container">
      <div className="login-container-box">
        <form onSubmit={handleSubmit}>
          <h2>Sign Up</h2>

          <label>
            First Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
          />
          {errors.firstName && <p className="error">{errors.firstName}</p>}

          <label>
            Last Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
          />
          {errors.lastName && <p className="error">{errors.lastName}</p>}

          <label>
            Date of Birth <span className="required">*</span>
          </label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
          />
          {errors.dob && <p className="error">{errors.dob}</p>}

          <label>Phone Number (Optional)</label>
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
          />

          {/* <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="customer">Customer</option>
            <option value="employee">Employee</option>
          </select> */}

          <label>
            Email <span className="required">*</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <label>
            Password <span className="required">*</span>
          </label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="error">{errors.password}</p>}

          <label>
            Confirm Password <span className="required">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword}</p>
          )}

          <button type="submit" className="create">
            Sign Up
          </button>

          <p className="toggle-text">
            Already have an account? <Link to="/Login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
