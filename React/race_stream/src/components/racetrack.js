import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, plugins } from 'chart.js';
import { useEffect, useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, plugins);

export const RaceTrack = () => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [image, setImage] = useState(null);
    const [trackLimits, setTrackLimits] = useState({});

    useEffect(() => {
        const img = new Image();
        img.src = '/TrackMaps/monza.png'; // Adjust path if needed
        img.onload = () => {
            setImage(img);
            setImageLoaded(true);
            console.log('Image loaded successfully');
        };
        img.onerror = (error) => {
            console.error('Failed to load image', error);
        };
        setImage(img);
        const loadTrackLimits = async () => {
            const fileName = '/track coordinates.json'; // Adjust the path as needed
            try {
              const response = await fetch(fileName);
              if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
              }
              setTrackLimits(await response.json());
              console.log('Track limits loaded:', trackLimits);
            } catch (error) {
              console.error('Error fetching or parsing JSON:', error);
            }
          };
    }, []);

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

    const options = {
        scales: {
            x: {
                display: false,
                type: 'linear',
                position: 'bottom',
                min: -735, // Set to your desired minimum value
                max: 820,
            },
            y: {
                display: false,
                min: -655,
                max: 655,
            }
        },
        responsive: true,
        maintainAspectRatio: true,
        animation: {
            duration: 0 // Disable animations
        },
        plugins: [imageBackgroundPlugin]
    };

    const data = {
        datasets: [
            {
                data: [{x: 10, y:10}]
            }
        ]
    };

    return (
        <div>
            {imageLoaded ? (
                <Line options={options} data={data} plugins={[imageBackgroundPlugin]} />
            ) : (
                <p>Loading image...</p>
            )}
        </div>
    );
};
