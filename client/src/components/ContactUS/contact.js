

  import React, { useState } from "react";
  import "./contact.css";
  import { SERVER_URL } from "../../App";

  const Contact = () => {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      subject: "",
      urgency: "Normal", 
      message: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

   

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
    
      try {
        const response = await fetch(`${SERVER_URL}/contact`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
    
        if (!response.ok) {
          throw new Error("Failed to send message.");
        }
    
        setFormData({
          name: "",
          email: "",
          subject: "",
          urgency: "Normal",
          message: "",
        });
        setSubmitted(true);
        setLoading(false);
    
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      } catch (error) {
        console.error("Error:", error);
        alert("There was an error sending your message. Please try again later.");
        setLoading(false);
      }
    }; 
    

    const contactInfo = [
      {
        icon: (
          <svg
            className="icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 21v-8.25a8.25 8.25 0 1116.5 0V21"
            />
          </svg>
        ),
        title: "Company Name",
        content: "Cougar Mail Depot",
      },
      {
        icon: (
          <svg
            className="icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 9l8.25 8.25L20.25 9"
            />
          </svg>
        ),
        title: "Address",
        content: "768 Business Avenue, Suite 100, TX 10001",
      },
      {
        icon: (
          <svg
            className="icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 8.25a.75.75 0 01.75-.75h15a.75.75 0 01.75.75v8.25m-16.5 0v-8.25m15 8.25V21a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V16.5"
            />
          </svg>
        ),
        title: "Phone",
        content: "+1 (234) 567-8901",
      },
      {
        icon: (
          <svg
            className="icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7.5h18M3 12h18M3 16.5h18"
            />
          </svg>
        ),
        title: "Email",
        content: "cougarmail@package.com",
      },
      {
        icon: (
          <svg
            className="icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9.75v-1.5a4.5 4.5 0 00-9 0v1.5m-3 6.75h15"
            />
          </svg>
        ),
        title: "Business Hours",
        content: "Mon - Fri: 9:00 AM - 5:00 PM CST",
      },
    ];

    return (
      <div className="contact-container">
        <div className="contact-content">
          <div className="header">
            <div className="header-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
            </div>
            <h1>Get in Touch</h1>
            <p className="subtitle">
              Have questions about our packaging services? We're here to help.
              Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="contact-info-form">
            <div className="contact-info">
              <div className="info-card">
                <h2>Contact Information</h2>
                <div className="info-items">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="info-item">
                      <div className="icon-container">{info.icon}</div>
                      <div className="info-content">
                        <h3>{info.title}</h3>
                        <p>{info.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="contact-form">
              <div className="form-card">
                <h2>Send us a Message</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Enter subject"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Urgency</label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      required
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Write your message here..."
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="submit-button"
                  >
                    {loading ? (
                      <div className="loader">
                        <svg className="spinner" viewBox="0 0 24 24">
                          <circle
                            className="path"
                            cx="12"
                            cy="12"
                            r="10"
                            fill="none"
                            strokeWidth="3"
                          />
                        </svg>
                      </div>
                    ) : (
                      <span>Send Message</span>
                    )}
                  </button>
                </form>
                {submitted && (
                  <div className="success-message">
                    <span>Message Sent Successfully!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default Contact;

