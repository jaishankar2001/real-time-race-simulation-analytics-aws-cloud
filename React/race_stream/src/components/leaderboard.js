import React, { useEffect, useState } from 'react';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [trackName, setTrackName] = useState('');

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("message pos", message['position'])
            if (message['track']) {
                console.log("New track and player data received");
                setTrackName(message['track']);
                console.log("Player color:", message['color']);
                createNewDataSource(message['playerName'], message['color']);
            } else if (message['position']) {
                console.log("Telemetry data received:", message);
                updateExistingDataSource(message);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            ws.close();
        };
    }, []);

    const createNewDataSource = (playerName, color) => {
        setUsers((prevUsers) => {
            if (prevUsers.some(user => user.name === playerName)) {
                return prevUsers; // User already exists
            }
            return [...prevUsers, { name: playerName, color, Position: Infinity }];
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
            <h1>Track: {trackName}</h1>
            <h2>Leaderboard</h2>
            <ul style={{ listStyleType: 'none' }}>
                {sortedUsers.map(user => (
                    <li key={user.name} style={{ color: user.color }}>
                        {user.Position}: {user.name}: {user.BestTime}, {user.CurrentTime} 
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;
