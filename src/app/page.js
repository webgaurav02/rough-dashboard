// pages/dashboard.js
'use client'

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState({ dashboardData: [], bookingDetails: [] });

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/booking");
      const json = await res.json();
      setData(json);
    }
    fetchData();
    const intervalId = setInterval(fetchData, 10000); // Fetch data every 10 seconds
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Ticket Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {data.dashboardData.map((item) => (
          <div
            key={item.section}
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3>{item.section}</h3>
            <p><strong>Sold:</strong> {item.sold}</p>
            <p><strong>Remaining:</strong> {item.remaining}</p>
            <p><strong>Locked:</strong> {item.locked}</p>
          </div>
        ))}
      </div>

      <h2>Booking Orders</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Transaction ID</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>User ID</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Section ID</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Seats</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Status</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.bookingDetails.map((order) => (
            <tr key={order._id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.transactionId}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.userId}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.sectionId}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.numberOfSeats}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.status}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}