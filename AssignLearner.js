import React, { useState, useEffect } from "react";

const AssignLearner = () => {
  const [learners, setLearners] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState("");
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get manager ID from localStorage
  const managerId = localStorage.getItem("user_id");

  // If no managerId is found, redirect or show error
  useEffect(() => {
    if (!managerId) {
      setError("Manager not logged in.");
    } else {
      fetchUsers();
    }
  }, [managerId]);  // Use managerId here

  // Fetch learners when the component mounts
  const fetchUsers = async () => {
    try {
      // Fetch unassigned learners
      const response = await fetch("http://127.0.0.1:5000/unassigned_learners", {
        method: "GET",
      });
      const data = await response.json();

      if (response.ok) {
        setLearners(data);  // Set learners as the unassigned learners list
      } else {
        setError("Failed to fetch learners.");
      }
    } catch (error) {
      setError("An error occurred while fetching data.");
    }
  };

  const handleAssignLearner = async () => {
    if (!selectedLearner) {
      setError("Please select a learner to assign.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/assign_learner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          manager_id: managerId,  // Use managerId from localStorage
          learner_id: selectedLearner,  // The learner_id will be selected by the user
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message);
      } else {
        setError(data.error || "Failed to assign learner.");
      }
    } catch (error) {
      setError("An error occurred while assigning learner.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Assign Learner to Team</h1>

      {error && <p style={styles.error}>{error}</p>}
      {successMessage && <p style={styles.success}>{successMessage}</p>}

      <div style={styles.formContainer}>
        <div>
          <label htmlFor="learner">Select Learner:</label>
          <select
            id="learner"
            value={selectedLearner}
            onChange={(e) => setSelectedLearner(e.target.value)}
            style={styles.select}
          >
            <option value="">Select Learner</option>
            {learners.map((learner) => (
              <option key={learner.learner_id} value={learner.learner_id}>
                {learner.learner_name}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleAssignLearner} style={styles.assignButton}>
          Assign Learner
        </button>
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
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "30px",
  },
  error: {
    color: "#e74c3c",
    fontSize: "16px",
  },
  success: {
    color: "#2ecc71",
    fontSize: "16px",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "300px",
  },
  select: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    marginBottom: "10px",
    border: "1px solid #ccc",
  },
  assignButton: {
    padding: "12px 20px",
    fontSize: "16px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default AssignLearner;
