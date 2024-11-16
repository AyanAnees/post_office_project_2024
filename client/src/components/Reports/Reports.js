import React, { useState } from 'react';
import './Reports.css';

import { SERVER_URL } from "../../App";

const Reports = () => {
    const [formData, setFormData] = useState({
        reportType: '',
        startDate: '',
        endDate: '',
        departmentName : '',
        productType:'',
        query:'',
        customerName:'',
        status:'',
        deliveryMethod:'',
        stock: '',    
    });
    const [data, setData] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showTable, setShowTable] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleReportChange = (e) => {
        setFormData({
            ...formData,
            reportType: e.target.value,
        });
        setShowTable(false); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowTable(true);

        const { reportType, startDate, endDate, customerName, productType, status, deliveryMethod, stock } = formData;
        const url = new URL(`${SERVER_URL}/api/reports/${reportType}`);

        // sending backend fetch according to report type
         if (reportType === 'inventory') {
            if (startDate) url.searchParams.append("startDate", startDate);
            if (endDate) url.searchParams.append("endDate", endDate);
            if (stock) url.searchParams.append("stock", stock);
        } 
        else if (reportType === 'package-delivery'){
            if (startDate) url.searchParams.append("startDate", startDate);
            if (endDate) url.searchParams.append("endDate", endDate);
            if (status) url.searchParams.append("status", status);
            if(deliveryMethod) url.searchParams.append("deliveryMethod", deliveryMethod);
        }
        else if (reportType === 'financial-transactions') {
            if (startDate) url.searchParams.append("startDate", startDate);
            if (endDate) url.searchParams.append("endDate", endDate);
            if (productType) url.searchParams.append("productType", productType);
            if (customerName) url.searchParams.append("customerName", customerName);
        } 
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            const formattedData = formatData(result, reportType);
            setData(formattedData);
        } catch (error) {
            console.error('Error fetching report data:', error);
        }
    };
/////////////
//sorting data according to each column
    const handleSort = (field) => {
    const direction = (sortField === field && sortDirection === 'asc') ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);

    const sortedData = [...data].sort((a, b) => {
        if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
        return 0;
    });
    setData(sortedData);
};
//////////////
    const formatData = (result, reportType) => {
        if (reportType === 'inventory') {
            return result.map((item) => ({
                productName: item.Product_Name,
                stock: item.Product_Stock,
                restockDate: new Date(item.Last_Restock_Date).toLocaleDateString(),
                unitPrice: `$${item.unit_price}`,
                itemsSold: item.Units_Sold, 
            }));
        } else if (reportType === 'package-delivery') {
            return result.map((item) => ({
                address: `
                ${item.Package_House_Number} 
                ${item.Package_Street} 
                ${item.Package_Suffix}, 
                ${item.Package_City}`.trim(),
                arrivalDate: new Date(item.Arrival_Date).toLocaleDateString(), 
                shipping: `$${item.Package_Shipping_Cost}`,
                weight: `${item.Package_Weight} lbs`,
                sender: `${item.Sender_First_Name} ${item.Sender_Middle_Name} ${item.Sender_Last_Name}`,
                recipient: `${item.Recipient_First_Name} ${item.Recipient_Middle_Name} ${item.Recipient_Last_Name}`,   
            }));
        } else if (reportType === 'financial-transactions') {
            return result.map((item) => ({
                customerName: `${item.Customer_First_Name} ${item.Customer_Middle_Name} ${item.Customer_Last_Name}`,
                transaction_id: item.Transaction_ID,
                amount: `$${item.Amount_Deducted}`,
                date: item.Transaction_Date,
                category: item.Product_Name,
                quantity: item.Quantity,
            }));
        }
        return [];
    };
////////////////////////
const calculateTotals = () => {
    if (!data || data.length === 0) return null;

    let totals = {};

    if (formData.reportType === 'inventory') {
        totals = {
            stock: data.reduce((sum, item) => sum + parseFloat(item.stock || 0), 0),
            unitPrice: `$${data.reduce((sum, item) => sum + parseFloat((item.unitPrice || '').replace('$', '') || 0), 0).toFixed(2)}`,
            itemsSold: data.reduce((sum, item) => sum + parseInt(item.itemsSold || 0, 10), 0),
        };
    } else if (formData.reportType === 'package-delivery') {
        totals = {
            shipping: `$${data.reduce((sum, item) => sum + parseFloat((item.shipping || '').replace('$', '') || 0), 0).toFixed(2)}`,
            weight: `${data.reduce((sum, item) => sum + parseFloat((item.weight || '').replace(' lbs', '') || 0), 0).toFixed(2)} lbs`,
        };
    } else if (formData.reportType === 'financial-transactions') {
        totals = {
            amount: `$${data.reduce((sum, item) => sum + parseFloat((item.amount || '').replace('$', '') || 0), 0).toFixed(2)}`,
            quantity: data.reduce((sum, item) => sum + parseInt(item.quantity || 0, 10), 0),
        };
    }

    return totals;
};
    
///////////////////////////
    const renderTable = () => {
        if (!data || data.length === 0) return <p>No data available.</p>;

        const totals = calculateTotals();
     
        // Decide which table to render based on report type
        if (formData.reportType === 'inventory') {
            return (
                <table className="report-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('productName')}>
                                Product Name {sortField === 'productName' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('stock')}>
                                Stock {sortField === 'stock' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('restockDate')}>
                                Last Restock Date {sortField === 'restockDate' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('unitPrice')}>
                                Unit Price {sortField === 'unitPrice' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('itemsSold')}>
                                Units Sold {sortField === 'itemsSold' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.id}>
                                <td>{item.productName}</td>
                                <td>{item.stock}</td> 
                                <td>{item.restockDate}</td>
                                <td>{item.unitPrice}</td>
                                <td>{item.itemsSold}</td>
                            </tr>
                        ))}
                        {totals && (
                        <tr className="totals-row">
                            <td><strong>Totals:</strong></td>
                            <td><strong>{totals.stock}</strong></td>
                            <td></td>
                            <td><strong>{totals.unitPrice}</strong></td>
                            <td><strong>{totals.itemsSold}</strong></td>
                        </tr>
                    )}
                    </tbody>
                </table>         
            );
        } else if (formData.reportType === 'package-delivery') {
            return (
                <table className="report-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('sender')}>
                                Package Sent By {sortField === 'sender' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('recipient')}>
                                Package Sent To {sortField === 'recipient' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('address')}>
                                Package Address {sortField === 'address' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('arrivalDate')}>
                                Arrival Date {sortField === 'arrivalDate' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('shipping')}>
                                Shipping Cost {sortField === 'shipping' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('weight')}>
                                Weight {sortField === 'weight' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                        </tr>
                    </thead>
                    <tbody> 
                        {data.map((item) => (
                            <tr key={item.package_id}>
                                <td>{item.sender}</td>
                                <td>{item.recipient}</td>
                                <td>{item.address}</td>
                                <td>{item.arrivalDate}</td>
                                <td>{item.shipping}</td>
                                <td>{item.weight}</td>
                            </tr>
                        ))}
                        {totals && (
                        <tr className="totals-row">
                            <td><strong>Totals:</strong></td>
                            <td></td>
                            <td></td>
                            <td><strong>{totals.shipping}</strong></td>
                            <td><strong>{totals.weight}</strong></td>
                        </tr>
                    )}
                    </tbody>
                </table>
             
            );
        } else if (formData.reportType === 'financial-transactions') {
            return (
                <table className="report-table">
                    {/*sorting by columns*/}
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('customerName')}>
                                Customer Name {sortField === 'customerName' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('amount')}>
                                Amount {sortField === 'amount' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('date')}>
                                Date {sortField === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('time')}>
                                Time {sortField === 'time' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('quantity')}>
                                Quantity {sortField === 'quantity' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => {
                            const dateObj = new Date(item.date);
                            const date = dateObj.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                            });
                            const time = dateObj.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                            });

                            return (
                                <tr key={item.transaction_id}>
                                    <td>{item.customerName}</td>
                                    <td>{item.amount}</td>
                                    <td>{date}</td>
                                    <td>{time}</td>
                                    <td>{item.quantity}</td>
                                </tr>
                            );
                        })}
                        {totals && (
                        <tr className="totals-row">
                            <td><strong>Totals:</strong></td>
                            <td><strong>{totals.amount}</strong></td>
                            <td></td>
                            <td></td>
                            <td><strong>{totals.quantity}</strong></td>
                        </tr>
                    )}
                    </tbody>
                </table>
            );
        }
        
    };

    return (
        <div className="app">
            <main className="container">
                <h2>Request a Report</h2>
                <form onSubmit={handleSubmit}>
                    <select onChange={handleReportChange} value={formData.reportType}>
                        <option value="">Select Report</option>
                        <option value="inventory">Inventory Report</option>
                        <option value="package-delivery">Package-Delivery Report</option>
                        <option value="financial-transactions">Financial Transactions Report</option>
                    </select>
                    {/* inventory report filters */}
                    {formData.reportType === 'inventory' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="startDate">Start Date</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="endDate">End Date</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Stock Level</label>
                                <div className="slider-group">
                                <label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1000"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        />
                                        <span>{formData.stock}</span>
                                    </label>
                                </div>
                            </div>
                        </>
                    )}
                    {/* date filtering for package delivery reports */}
                    {formData.reportType === 'package-delivery' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="startDate">Start Date</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="endDate">End Date</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">Package Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Status</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="in transit">In Transit</option>
                                    <option value="received">Received</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="deliveryMethod">Delivery Method</label>
                                <select
                                    id="deliveryMethod"
                                    name="deliveryMethod"
                                    value={formData.deliveryMethod}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Method</option>
                                    <option value="ground">Ground</option>
                                    <option value="express">Express</option>
                                    <option value="air">Air</option>
                                </select>
                            </div>
                        </>
                    )}


                    {/* filtering for financial transaction reports */}
                    {formData.reportType === 'financial-transactions' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="startDate">Start Date</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="endDate">End Date</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="productType">Product Type</label>
                                <select
                                    id="productType"
                                    name="productType"
                                    value={formData.productType}
                                    onChange={handleChange}
                                >
                                    <option value="">Select a product type</option>
                                    <option value="stamp">Stamps</option>
                                    <option value="envelope">Envelopes</option>
                                    <option value="small package">Small Package</option>
                                    <option value="medium package">Medium Package</option>
                                    <option value="large package">Large Package</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="customerName">Customer Name</label>
                                <input
                                    type="text"
                                    id="customerName"
                                    name="customerName"
                                    value={formData.customerName || ''}
                                    onChange={handleChange}
                                    placeholder="Enter customer name"
                                />
                            </div>
                        </>
                    )}
                <button className="report-button" type="submit">Submit</button>
          
        </form>
        {showTable && (
                <div className="reports-table">
                    {data.length > 0 ? (
                        <div>
                            <h3>Report Results:</h3>
                            {renderTable()}
                        </div>
                    ) : (
                        <p>No data available for this report.</p>
                    )}
                </div>
            )}
            </main>
        </div>
    );
};


export default Reports;
