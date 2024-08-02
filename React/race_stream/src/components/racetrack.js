import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import React, { useEffect, useState } from 'react';
const Chart = require("react-chartjs-2").Chart;

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const RaceTrack = () => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [image, setImage] = useState(null);
    const [trackLimits, setTrackLimits] = useState(null);
    const [trackName, setTrackName] = useState('');
    const [carPlayerName, setCarPlayerName] = useState({});
    const [chartOptions, setChartOptions] = useState({
        scales: {
            x: {
                display: false,
                type: 'linear',
                position: 'bottom',
                min: 0, // Default min value
                max: 100, // Default max value
                ticks: {
                    beginAtZero: true,
                    max: 1
                  }
            },
            y: {
                display: false,
                min: 0, // Default min value
                max: 100, // Default max value
                ticks: {
                    beginAtZero: true,
                    max: 1
                }
            }
        },
        responsive: true,
        maintainAspectRatio: true,
        animation: {
            duration: 0 // Disable animations
        },
        plugins: []
    });
    const [data, setData] = useState({
        datasets: []
    });

    useEffect(() => {
        const img = new Image();
        img.src = `/TrackMaps/${trackName}.png`; // Adjust path if needed
        img.onload = () => {
            setImage(img);
            setImageLoaded(true);
            console.log('Image loaded successfully');
        };
        img.onerror = (error) => {
            console.error('Failed to load image', error);
        };

        const loadTrackLimits = async () => {
            const fileName = '/track coordinates.json'; // Adjust the path as needed
            try {
                const response = await fetch(fileName);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                const data = await response.json();
                setTrackLimits(data);
                console.log('Track limits loaded:', data);
                updateChartOptions(data); // Update chart options with the new limits
            } catch (error) {
                console.error('Error fetching or parsing JSON:', error);
            }
        };
        
        if (trackName) {
            img.src = `/TrackMaps/${trackName}.png`;
            loadTrackLimits(trackName);
        };
    }, [trackName]);
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080'); // Replace with your WebSocket server URL

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message['track']) {
                console.log("new player")
                setTrackName(message['track']);
                updateCarPlayerNames(message['playerName']);
                console.log("player color:", message['color']);
                createNewDataSource(message['playerName'], message['color']);
            }else if (message['tyreContactPointFLY']){
                updateExistingDataSource(message['playerName'], message);
                console.log(data)
            }
            
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            ws.close();
        };
    }, []);
    const updateCarPlayerNames = (carPlayerName) => {
        setCarPlayerName((prevCarPlayerNames) => ({
            ...prevCarPlayerNames,
            carPlayerName: []
        }));
    }
    const createNewDataSource = (carPlayerName, color) => {
        setData((prevData) => ({
            datasets: [...prevData.datasets, {
                label: carPlayerName,
                data: [],
                borderColor: color,
                backgroundColor: color,
                borderWidth: 1,
                pointBackgroundColor: color,
                pointBorderColor: color,
                pointRadius: 5,
                fill: false
              }]
        }));
        console.log(data)
    }
    const updateExistingDataSource = (playerName, newData) => {
        console.log('Updating dataset for:', playerName); // Add this
    
        setData(prevData => {
            const updatedDatasets = prevData.datasets.map(dataset => {
                if (dataset.label === playerName) {
                    return {
                        ...dataset,
                        data: [{x: (newData['tyreContactPointFRX']+newData['tyreContactPointFLX']+newData['tyreContactPointRRX']+newData['tyreContactPointRLX'])/4,
                                y: (newData['tyreContactPointFRY']+newData['tyreContactPointFLY']+newData['tyreContactPointRRY']+newData['tyreContactPointRLY'])/4}]
                    };
                }
                return dataset;
            });
    
            console.log('Updated datasets:', updatedDatasets); // Add this
            return { datasets: updatedDatasets };
        });
    };
    
    const updateChartOptions = (limits) => {
        setChartOptions((prevOptions) => ({
            ...prevOptions,
            scales: {
                x: {
                    ...prevOptions.scales.x,
                    min: limits['monza']['minX'],
                    max: limits['monza']['maxX']
                },
                y: {
                    ...prevOptions.scales.y,
                    min: limits['monza']['minY'],
                    max: limits['monza']['maxY']
                }
            }
        }));
    };

    const imageBackgroundPlugin = {
        id: 'customCanvasBackgroundImage',
        beforeDatasetDraw: (chart) => {
            if (image && imageLoaded) {
                const ctx = chart.ctx;
                const { top, left, width, height } = chart.chartArea;
                ctx.drawImage(image, left, top, width, height);
            } else {
                console.log('Image not loaded or not available');
            }
        }
    };

    return (
        <div>
            {imageLoaded && trackLimits ? (
                <>
                    <p>Track: {trackName}</p>
                    <Line options={{ ...chartOptions }} data={data} plugins={[imageBackgroundPlugin]}/>
                </>
            ) : (
                <p>Loading image and track limits...</p>
            )}
        </div>
    );
};
