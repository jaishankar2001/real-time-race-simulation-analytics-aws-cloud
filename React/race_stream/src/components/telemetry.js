import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const TelemetryChart = ({ playerName }) => {
  const [brakeData, setBrakeData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Brake (%)',
        data: [],
        borderColor: 'rgba(192,75,75,1)',
        fill: true,
      },
    ],
  });

  const [speedData, setSpeedData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Speed (kmph)',
        data: [],
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
      },
    ],
  });

  const [gasData, setGasData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Throttle (%)',
        data: [],
        borderColor: 'rgba(75,75,192,1)',
        fill: true,
      },
    ],
  });

  const [chartOptions] = useState({
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      x: {
        display: false,
        max: 20,
      },
      y: {
        display: true,
        min: 0,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    animation: {
      duration: 0, // Disable animations
    },
  });

  const websocket = useRef(null);

  useEffect(() => {
    // Update WebSocket URL to the provided API Gateway WebSocket URL
    websocket.current = new WebSocket(`${process.env.REACT_APP_BACKEND_SERVER}`);

    websocket.current.onopen = () => {
      console.log('WebSocket connection established');
      // Optionally, send a message to the API Gateway @connections endpoint if needed
      // For example, if you need to send player data when the connection is open:
      // const connectionMessage = { action: 'join', playerName };
      // websocket.current.send(JSON.stringify(connectionMessage));
      // fetch('https://4gwu8bevw2.execute-api.us-east-1.amazonaws.com/production/@connections', {
      //   method: 'POST',
      //   body: JSON.stringify({ connectionId: ws.connectionId })
      // });
    };

    websocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data['playerName'] === playerName) {
        if (data['tyreContactPointFLY']) {
          const currentTime = new Date().toLocaleTimeString();

          // Update brake data
          setBrakeData((prevData) => {
            const newLabels = [...prevData.labels, currentTime];
            const newBrake = [...prevData.datasets[0].data, data['brake']];

            if (newLabels.length > 20) {
              newLabels.shift();
              newBrake.shift();
            }

            return {
              ...prevData,
              labels: newLabels,
              datasets: [{ ...prevData.datasets[0], data: newBrake }],
            };
          });

          // Update speed data
          setSpeedData((prevData) => {
            const newLabels = [...prevData.labels, currentTime];
            const newSpeed = [...prevData.datasets[0].data, data['speed']];

            if (newLabels.length > 50) {
              newLabels.shift();
              newSpeed.shift();
            }

            return {
              ...prevData,
              labels: newLabels,
              datasets: [{ ...prevData.datasets[0], data: newSpeed }],
            };
          });

          // Update gas data
          setGasData((prevData) => {
            const newLabels = [...prevData.labels, currentTime];
            const newGas = [...prevData.datasets[0].data, data['throttle']];

            if (newLabels.length > 50) {
              newLabels.shift();
              newGas.shift();
            }

            return {
              ...prevData,
              labels: newLabels,
              datasets: [{ ...prevData.datasets[0], data: newGas }],
            };
          });
        }
      }
    };

    websocket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      console.log('closing connection');
      websocket.current.close();
    };
  }, [playerName]); // Add playerName as a dependency

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
      <div style={{ flex: '1' }}>
        <Line data={brakeData} options={chartOptions} />
      </div>
      <div style={{ flex: '1' }}>
        <Line data={speedData} options={chartOptions} />
      </div>
      <div style={{ flex: '1' }}>
        <Line data={gasData} options={chartOptions} />
      </div>
    </div>
  );
};

export default TelemetryChart;
