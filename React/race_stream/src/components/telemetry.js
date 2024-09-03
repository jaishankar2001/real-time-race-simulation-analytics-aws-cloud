import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const TelemetryChart = ({playerName}) => {
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
            max: 20
        },
        y: {
            display: true,
            min: 0
        }
    },
    elements: {
        point:{
            radius: 0
        }
    },
    animation: {
      duration: 0, // Disable animations
    },
  });

  const websocket = useRef(null);

  useEffect(() => {
    websocket.current = new WebSocket('ws://localhost:8080');

    websocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if(data['playerName'] === playerName){
        if (data['tyreContactPointFLY']) {
          const currentTime = new Date().toLocaleTimeString();

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
      };
    };

    return () => {
      websocket.current.close();
    };
  }, []);

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
