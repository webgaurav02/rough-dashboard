'use client'

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function Dashboard() {
  const [data, setData] = useState({ dashboardData: [], bookingDetails: [], totalSeats: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalImageUrl, setModalImageUrl] = useState(null);
  const [modalQRTicket, setModalQRTicket] = useState(null);
  const [showCSVModal, setShowCSVModal] = useState(false);
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
      order.ticketId?.toString().toLowerCase().includes(query) ||
      order.paymentId?.toString().toLowerCase().includes(query) ||
      order.userId?.toString().toLowerCase().includes(query) ||
      order.bowl?.toString().toLowerCase().includes(query) ||
      order.numberOfSeats?.toString().toLowerCase().includes(query) ||
      order.status?.toString().toLowerCase().includes(query) ||
      order.totalAmount?.toString().toLowerCase().includes(query) ||
      order.used?.toString().toLowerCase().includes(query)
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

  // Helper function to generate and trigger CSV download for given orders.
  const exportCSV = (orders, fileName = "booking_orders.csv") => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = [
      "Transaction ID",
      "Razorpay",
      "User ID",
      "Bowl",
      "Seats",
      "Status",
      "Used",
      "Total Amount",
      "Ticket Image",
      "Ticket ID"
    ];
    csvContent += headers.join(",") + "\n";

    orders.forEach((order) => {
      const row = [
        order.transactionId,
        order.paymentId || "",
        order.userId,
        order.bowl,
        order.numberOfSeats,
        order.status,
        order.used ? "Used" : "Unused",
        order.totalAmount,
        order.imageUrl || "",
        order.ticketId || ""
      ];
      csvContent += row.map((value) => `"${value}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all filtered bookings
  const handleDownloadAllCSV = () => {
    exportCSV(filteredOrders, "all_booking_orders.csv");
    setShowCSVModal(false);
  };

  // Download only confirmed bookings
  const handleDownloadConfirmedCSV = () => {
    const confirmedOrders = filteredOrders.filter(order =>
      order.status === "confirmed" || order.status === "confirmed-through-api"
    );
    exportCSV(confirmedOrders, "confirmed_booking_orders.csv");
    setShowCSVModal(false);
  };

  // Open the Ticket Image modal.
  const openModal = (imageUrl) => {
    setModalImageUrl(imageUrl);
  };

  // Close the Ticket Image modal.
  const closeModal = () => {
    setModalImageUrl(null);
  };

  // Open the QR Code modal for the given Ticket ID.
  const openQRModal = (ticketId) => {
    setModalQRTicket(ticketId);
  };

  // Close the QR Code modal.
  const closeQRModal = () => {
    setModalQRTicket(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Ticket Dashboard</h1>

      {/* Total Seats Section */}
      <div  style={{display: "flex", gap: 20}}>
        <div style={{ marginBottom: "30px", textAlign: "center", border: "1px solid black", width: "fit-content", padding: "0.5% 4%", background: "#f2f2f2", color: "black", borderRadius: "5px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>Total Seats</h2>
          <p style={{ fontSize: "32px", fontWeight: "bold" }}>{data.totalSeats}</p>
        </div>

        {/* Total Used Tickets */}
        <div style={{ marginBottom: "30px", textAlign: "center", border: "1px solid black", width: "fit-content", padding: "0.5% 4%", background: "#f2f2f2", color: "black", borderRadius: "5px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>Total Redeemed</h2>
          <p style={{ fontSize: "32px", fontWeight: "bold" }}>{data.totalUsedTickets}</p>
        </div>
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

      {/* Search Box and Download CSV Button */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <input
          type="text"
          placeholder="Search booking orders..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ padding: "8px", width: "300px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button onClick={() => setShowCSVModal(true)} style={{ marginLeft: "10px", padding: "8px 12px", background: "green", color: "white", marginTop: "10px" }}>
          Download CSV
        </button>
      </div>

      <h2>Booking Orders</h2>
      {/* Table Container for horizontal scroll */}
      <div style={{ overflowX: "auto", width: "100%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", minWidth: "900px" }}>
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Transaction ID</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Razorpay</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>User ID</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Bowl</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Seats</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Status</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Used</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Total Amount</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Ticket Image</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>QR Code</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Ticket ID</th>
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
                {<td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center", color: order.used ? "red" : "blue", fontWeight: "bold" }}>
                  {order.used ? "Used" : ""}
                </td>}
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
                <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>
                  {order.ticketId ? (
                    <button onClick={() => openQRModal(order.ticketId)} style={{ padding: "4px 8px" }}>
                      View
                    </button>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {order.ticketId || "-"}
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
              padding: "70px 30px",
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

      {/* Modal for QR Code */}
      {modalQRTicket && (
        <div
          onClick={closeQRModal}
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
              padding: "70px 30px",
              borderRadius: "8px",
              position: "relative",
              textAlign: "center",
            }}
          >
            <button onClick={closeQRModal} style={{ position: "absolute", top: "10px", right: "10px" }}>
              Close
            </button>
            <QRCodeCanvas value={modalQRTicket} size={256} />
          </div>
        </div>
      )}

      {/* Modal for CSV Download Options */}
      {showCSVModal && (
        <div
          onClick={() => setShowCSVModal(false)}
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
              padding: "30px",
              borderRadius: "8px",
              textAlign: "center",
              width: "300px",
            }}
          >
            <h3>Download CSV Options</h3>
            <button onClick={handleDownloadAllCSV} style={{ margin: "10px 0", padding: "8px 12px", width: "100%" }}>
              All Bookings
            </button>
            <button onClick={handleDownloadConfirmedCSV} style={{ margin: "10px 0", padding: "8px 12px", width: "100%" }}>
              Confirmed Bookings
            </button>
            <button onClick={() => setShowCSVModal(false)} style={{ marginTop: "15px", padding: "6px 12px" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}