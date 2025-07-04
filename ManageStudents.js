import React, { useState, useEffect } from "react";

const ManageStudents = () => {
  const [pendingUsers, setPendingUsers] = useState([]); // Initialize as an empty array
  const [error, setError] = useState('');

  // Fetch pending users when the component mounts
  const fetchPendingUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/pending_users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "HR" }), 
      });

      const data = await response.json();

      if (response.ok) {
        setPendingUsers(data.pending_users || []); // Set to empty array if undefined
      } else {
        setError(data.error || "Failed to fetch pending users.");
      }
    } catch (error) {
      setError("An error occurred while fetching pending users.");
    }
  };

  // Call this function when the approve/reject button is clicked
  const handleApproveReject = async (userId, action) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/approve_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "HR",
          user_id: userId,
          action: action, // approve or reject
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Fetch updated users list
        fetchPendingUsers();
        alert(data.message); // Show success message
      } else {
        alert(data.error); // Show error message
      }
    } catch (error) {
      alert("An error occurred while processing the action.");
    }
  };

  // Fetch pending users on component mount
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Pending User Approvals</h1>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.userList}>
        {pendingUsers && pendingUsers.length > 0 ? (
          pendingUsers.map((user) => (
            <div key={user.user_id} style={styles.userCard}>
              <h3>{user.full_name}</h3>
              <p>Email: {user.email}</p>
              <p>Phone: {user.phone_number}</p>
              <p>Country: {user.country}</p>

              <div style={styles.actionButtons}>
                <button
                  onClick={() => handleApproveReject(user.user_id, "approve")}
                  style={styles.approveButton}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproveReject(user.user_id, "reject")}
                  style={styles.rejectButton}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No pending users to approve/reject.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#f5f7fa",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "all 0.3s ease",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "30px",
    textAlign: "center",
    color: "#333",
    transition: "color 0.3s ease",
  },
  error: {
    color: "#e74c3c",
    fontSize: "16px",
    textAlign: "center",
    marginTop: "20px",
  },
  userList: {
    display: "flex",
    flexWrap: "wrap", // Allows wrapping to create rows of cards
    gap: "20px",
    justifyContent: "center",
    width: "80%",
    maxWidth: "900px",
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    width: "280px",
    height: "auto",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  userCardHover: {
    transform: "translateY(-10px)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
  },
  userCardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
  },
  userCardText: {
    fontSize: "14px",
    color: "#777",
  },
  actionButtons: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginTop: "20px",
  },
  button: {
    padding: "12px 20px",
    fontSize: "14px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  approveButton: {
    backgroundColor: "#2ecc71",
    color: "#fff",
  },
  approveButtonHover: {
    backgroundColor: "#27ae60",
  },
  rejectButton: {
    backgroundColor: "#e74c3c",
    color: "#fff",
  },
  rejectButtonHover: {
    backgroundColor: "#c0392b",
  },
};

export default ManageStudents;
