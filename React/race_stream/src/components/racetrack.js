import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import React, { useEffect, useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const RaceTrack = () => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [image, setImage] = useState(null);
    const [trackLimits, setTrackLimits] = useState(null);
    const [trackName, setTrackName] = useState('');
    const [existingPlayers, setExistingPlayers] = useState([]);
    const [chartOptions, setChartOptions] = useState({
        scales: {
            x: {
                display: false,
                type: 'linear',
                position: 'bottom',
                min: 0, 
                max: 100, 
                ticks: {
                    beginAtZero: true,
                    max: 1
                }
            },
            y: {
                display: false,
                min: 0, 
                max: 100, 
                ticks: {
                    beginAtZero: true,
                    max: 1
                }
            }
        },
        legend: {
            display: false
        },
        tooltips: {
            callbacks: {
               label: function(tooltipItem) {
                      return tooltipItem.yLabel;
               }
            }
        },
        responsive: true,
        maintainAspectRatio: true,
        animation: {
            duration: 0 
        },
        plugins: {
            legend: {
                display: false
            }
        }
    });
    const [data, setData] = useState({
        datasets: []
    });

    useEffect(() => {
        const img = new Image();
        img.src = `/TrackMaps/${trackName}.png`; 
        img.onload = () => {
            setImage(img);
            setImageLoaded(true);
            console.log('Image loaded successfully');
        };
        img.onerror = (error) => {
            console.error('Failed to load image', error);
        };

        const loadTrackLimits = async () => {
            const fileName = '/track coordinates.json'; 
            try {
                const response = await fetch(fileName);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                const data = await response.json();
                setTrackLimits(data);
                console.log('Track limits loaded:', data);
                updateChartOptions(data); 
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
        // Connect to WebSocket API Gateway
        const ws = new WebSocket(`${process.env.REACT_APP_BACKEND_SERVER}`);

        ws.onopen = () => {
            console.log('WebSocket connection established');
            // fetch('https://4gwu8bevw2.execute-api.us-east-1.amazonaws.com/production/@connections', {
            //     method: 'POST',
            //     body: JSON.stringify({ connectionId: ws.connectionId })
            // });
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message['track']) {
                console.log("New track and player data received");
                setTrackName(message['track']);
                console.log("Player color:", message['color']);
                handleNewPlayer(message['playerName'], message['color']);
            } else if (message['tyreContactPointFLY']) {
                updateExistingDataSource(message['playerName'], message);
                console.log('Telemetry data received:', message);
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

    const handleNewPlayer = (carPlayerName, color) => {
        if (existingPlayers.includes(carPlayerName)) {
            console.log("Existing player");
        } else {
            setExistingPlayers((prevPlayers) => [...prevPlayers, carPlayerName]);
            createNewDataSource(carPlayerName, color);
        }
    };

    const createNewDataSource = (carPlayerName, color) => {
        setData((prevData) => {
            const playerExists = prevData.datasets.some(dataset => dataset.label === carPlayerName);
            if (playerExists) {
                console.log('Player already exists.');
                return prevData;
            }
            return {
                datasets: [
                    ...prevData.datasets,
                    {
                        label: carPlayerName,
                        data: [],
                        borderColor: color,
                        backgroundColor: color,
                        borderWidth: 1,
                        pointBackgroundColor: color,
                        pointBorderColor: color,
                        pointRadius: 5,
                        fill: false
                    }
                ]
            };
        });
    };

    const updateExistingDataSource = (playerName, newData) => {
        setData(prevData => {
            const updatedDatasets = prevData.datasets.map(dataset => {
                if (dataset.label === playerName) {
                    return {
                        ...dataset,
                        data: [{
                            x: (newData['tyreContactPointFRX'] + newData['tyreContactPointFLX'] + newData['tyreContactPointRRX'] + newData['tyreContactPointRLX']) / 4,
                            y: (newData['tyreContactPointFRY'] + newData['tyreContactPointFLY'] + newData['tyreContactPointRRY'] + newData['tyreContactPointRLY']) / 4
                        }]
                    };
                }
                return dataset;
            });
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
                <Line options={{ ...chartOptions }} data={data} plugins={[imageBackgroundPlugin]} />
            ) : (
                <p>Loading image and track limits...</p>
            )}
        </div>
    );
};
