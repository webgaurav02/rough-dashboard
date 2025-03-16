'use client'

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState({ dashboardData: [], bookingDetails: [], totalSeats: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of booking orders to display per page

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/booking");
      const json = await res.json();
      setData(json);
      console.log(json);
    }
    fetchData();
    const intervalId = setInterval(fetchData, 5000); // Fetch data every 10 seconds
    return () => clearInterval(intervalId);
  }, []);

  // Calculate indices for current page orders
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = data.bookingDetails.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.bookingDetails.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Ticket Dashboard</h1>

      {/* New section to display total seats */}
      <div style={{ marginBottom: "30px", textAlign: "center", border: "1px solid black", width: "fit-content", padding: "0.5% 4%", background: "#f2f2f2", color: "black", borderRadius: "5px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>Total Seats</h2>
        <p style={{ fontSize: "32px", fontWeight: "bold" }}>{data.totalSeats}</p>
      </div>

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
            <h3>{item.bowl}</h3>
            <p><strong>Sold:</strong> {item.sold}</p>
            <p><strong>Remaining:</strong> {item.remaining}</p>
            <p><strong>Locked:</strong> {item.locked}</p>
          </div>
        ))}
      </div>

      <h2>Booking Orders</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
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
          {currentOrders.map((order) => (
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

      {/* Pagination Controls */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ marginRight: "10px" }}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ marginLeft: "10px" }}
        >
          Next
        </button>
      </div>
    </div>
  );
}