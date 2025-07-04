import React, { useEffect, useState } from 'react';

const TrackChanges = () => {
    const [changes, setChanges] = useState([]);

    useEffect(() => {
        // Fetch the changes from an API or local storage (if you're storing them there)
        const fetchChanges = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/changes');
                const data = await response.json();
                if (response.ok) {
                    setChanges(data); // Assuming the API returns a list of changes
                }
            } catch (error) {
                console.error('Failed to fetch changes', error);
            }
        };

        fetchChanges();
    }, []);  // This fetches changes when the component mounts

    return (
        <div>
            <h1>Track Changes</h1>
            <table>
                <thead>
                    <tr>
                        <th>Field</th>
                        <th>Old Value</th>
                        <th>New Value</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {changes.length > 0 ? (
                        changes.map((change, index) => (
                            <tr key={index}>
                                <td>{change.field}</td>
                                <td>{change.oldValue}</td>
                                <td>{change.newValue}</td>
                                <td>{new Date(change.timestamp).toLocaleString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No changes found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TrackChanges;
