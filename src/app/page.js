'use client'

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState({ dashboardData: [], bookingDetails: [], totalSeats: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalImageUrl, setModalImageUrl] = useState(null);
  const itemsPerPage = 10; // Number of booking orders to display per page

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/booking");
      const json = await res.json();
      setData(json);
      console.log(json);
    }
    fetchData();
    const intervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds
    return () => clearInterval(intervalId);
  }, []);

  // Filter booking orders based on search query including the bowl, paymentId, etc.
  const filteredOrders = data.bookingDetails.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.transactionId?.toString().toLowerCase().includes(query) ||
      order.paymentId?.toString().toLowerCase().includes(query) ||
      order.userId?.toString().toLowerCase().includes(query) ||
      order.bowl?.toString().toLowerCase().includes(query) ||
      order.numberOfSeats?.toString().toLowerCase().includes(query) ||
      order.status?.toString().toLowerCase().includes(query) ||
      order.totalAmount?.toString().toLowerCase().includes(query)
    );
  });

  // Pagination: Calculate indices for current page orders using filteredOrders.
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle search field changes and reset page to 1.
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Open the modal and set the image URL.
  const openModal = (imageUrl) => {
    setModalImageUrl(imageUrl);
  };

  // Close the modal.
  const closeModal = () => {
    setModalImageUrl(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Ticket Dashboard</h1>

      {/* Total Seats Section */}
      <div style={{ marginBottom: "30px", textAlign: "center", border: "1px solid black", width: "fit-content", padding: "0.5% 4%", background: "#f2f2f2", color: "black", borderRadius: "5px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>Total Seats</h2>
        <p style={{ fontSize: "32px", fontWeight: "bold" }}>{data.totalSeats}</p>
      </div>

      {/* Dashboard Grid */}
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

      {/* Search Box */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <input
          type="text"
          placeholder="Search booking orders..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ padding: "8px", width: "300px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>

      <h2>Booking Orders</h2>
      {/* Table Container for horizontal scroll */}
      <div style={{ overflowX: "auto", width: "100%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", minWidth: "800px" }}>
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Transaction ID</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Razorpay</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>User ID</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Bowl</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Seats</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Status</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Total Amount</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Ticket Image</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order) => (
              <tr key={order._id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.transactionId}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.paymentId || "-"}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.userId}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.bowl}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.numberOfSeats}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.status}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.totalAmount}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>
                  {order.imageUrl ? (
                    <button onClick={() => openModal(order.imageUrl)} style={{ padding: "4px 8px" }}>
                      View
                    </button>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          disabled={currentPage === totalPages || totalPages === 0}
          style={{ marginLeft: "10px" }}
        >
          Next
        </button>
      </div>

      {/* Modal for Ticket Image */}
      {modalImageUrl && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              padding: "40px 20px",
              borderRadius: "8px",
              position: "relative",
              maxWidth: "90%",
              maxHeight: "90%",
            }}
          >
            <button onClick={closeModal} style={{ position: "absolute", top: "10px", right: "10px" }}>
              Close
            </button>
            <img src={modalImageUrl} alt="Ticket" style={{ maxWidth: "100%", maxHeight: "80vh" }} />
          </div>
        </div>
      )}
    </div>
  );
}