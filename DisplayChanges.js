import React from 'react';
import { getAllChanges } from './changeTracker'; // Import the change tracker service

const DisplayChanges = () => {
    const allChanges = getAllChanges(); // Retrieve all changes

    return (
        <div>
            <h2>Change History</h2>
            {Object.keys(allChanges).length > 0 ? (
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
                        {Object.entries(allChanges).map(([field, changeHistory], index) => (
                            changeHistory.map((change, changeIndex) => (
                                <tr key={`${index}-${changeIndex}`}>
                                    <td>{field}</td>
                                    <td>{change.oldValue}</td>
                                    <td>{change.newValue}</td>
                                    <td>{change.timestamp}</td>
                                </tr>
                            ))
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No changes made yet.</p>
            )}
        </div>
    );
};

export default DisplayChanges;
