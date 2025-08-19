import React, { useEffect, useState } from 'react';
import TelemetryChart from './telemetry';

const Leaderboard = ({onItemClick}) => {
    const [users, setUsers] = useState([]);
    const [trackName, setTrackName] = useState('');

    useEffect(() => {
        // Establish a WebSocket connection to API Gateway
        const ws = new WebSocket(`${process.env.REACT_APP_BACKEND_SERVER}`);
        
        ws.onopen = () => {
            console.log('WebSocket connection established');
            // Optionally, register the connection if needed using @connections URL
            // This may be part of your API flow
            // Example: You might want to send a message to @connections to register the connection for later use
            // fetch('https://4gwu8bevw2.execute-api.us-east-1.amazonaws.com/production/@connections', {
            //     method: 'POST',
            //     body: JSON.stringify({ connectionId: ws.connectionId })
            // });
        };
        
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("message pos", message['position'])
            if (message['track']) {
                console.log("New track and player data received");
                setTrackName(message['track']);
                console.log("Player color:", message['color']);
                createNewDataSource(message);
            } else if (message['position']) {
                console.log("Telemetry data received:", message);
                updateExistingDataSource(message);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Cleanup WebSocket on component unmount
        return () => {
            ws.close();
        };
    }, []);

    const createNewDataSource = (data) => {
        setUsers((prevUsers) => {
            if (prevUsers.some(user => user.name === data['playerName'])) {
                return prevUsers; // User already exists
            }
            return [...prevUsers, { name: data['playerName'], color: data['color'], car: data['carModel'], Position: Infinity }];
        });
    };

    const updateExistingDataSource = (data) => {
        setUsers((prevUsers) => {
            const userIndex = prevUsers.findIndex(user => user.name === data['playerName']);
            if (userIndex === -1) {
                return prevUsers; // User doesn't exist, no update
            }
            const updatedUsers = [...prevUsers];
            updatedUsers[userIndex] = {
                ...updatedUsers[userIndex],
                Position: data['position'],
                BestTime: data['bestTime'],
                CurrentTime: data['currentTime']
                // Add or update other relevant fields here if needed
            };
            return updatedUsers;
        });
    };

    const sortedUsers = users.sort((a, b) => a.Position - b.Position);

    return (
        <div>
            <h3>Track: {trackName}</h3>
            <div>Leaderboard</div>
            <ul style={{ 
                    listStyleType: 'none', 
                    padding: 0, 
                    margin: 0, 
                    textAlign: 'left'
                }}>
                {sortedUsers.map(user => (
                    <li key={user.name} style={{ color: user.color }}>
                        {user.Position}: <button onClick={() => onItemClick(user.name)}>{user.name}</button>: {user.BestTime}, {user.CurrentTime}, {user.car}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;
