const ctx = document.getElementById('myChart').getContext('2d');

// Load the image
const image = new Image();
let trackLimits = {}; // To store track limits

//image.src = 'Images/Monza.png'; // Ensure this path is correct

// Flag to indicate if the image is loaded
let imageLoaded = false;
let playerName = "";
// Handle image loading
image.onload = () => {
  console.log('Image loaded successfully');
  imageLoaded = true;
  if (chart) {
    chart.update(); // Force a redraw after the image is loaded
  }
};

image.onerror = () => {
  console.error('Failed to load image');
};

// Custom plugin for drawing the image
const imageBackgroundPlugin = {
  id: 'imageBackground',
  beforeDatasetsDraw: (chart) => {
    //console.log('beforeDatasetsDraw called');
    if (imageLoaded) {
      const ctx = chart.ctx;
      const { top, left, width, height } = chart.chartArea;
      ctx.drawImage(image, left, top, width, height);
      //console.log('Image drawn on chart');
    }
  }
};

// Initialize the chart
let chart;
let dataPoints = [];
let animationStartTime = null;
const animationDuration = 500; // Animation duration in milliseconds

const initializeChart = () => {
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: playerName,
        data: [], // Array to hold { x, y } data points
        borderColor: 'rgba(255, 0, 0, 1)', // Red border color
        backgroundColor: 'rgba(255, 0, 0, 1)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(255, 0, 0, 1)', // Solid red points
        pointBorderColor: 'rgba(255, 0, 0, 1)', // Solid red point borders
        pointRadius: 5,
        fill: false // Set to false to avoid filling under the line
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0 // Disable animations
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          display: false,
          title: {
            display: false,
            text: 'X Axis'
          },
          min: -735, // Set to your desired minimum value
          max: 820,
          ticks: {
            autoSkip: true,
            maxTicksLimit: 20, // Adjust based on your needs
          }
        },
        y: {
          beginAtZero: true,
          display: false,
          title: {
            display: false,
            text: 'Y Axis'
          },
          min: -655,
          max: 655,
          ticks: {
            autoSkip: true,
            maxTicksLimit: 20,
          }
        }
      },
      plugins: {
        imageBackground: true, // Enable the custom plugin
        legend: {
          display: true
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `X: ${context.raw.x}, Y: ${context.raw.y}`;
            }
          }
        }
      }
    },
    plugins: [imageBackgroundPlugin] // Register the custom plugin
  });
};
const updateChartAxisLimits = (trackName) => {
    if (trackLimits[trackName]) {
    console.log(trackLimits[trackName])
      const { maxX, minX, maxY, minY } = trackLimits[trackName];
      chart.options.scales.x.max = maxX;
      chart.options.scales.x.min = minX;
      chart.options.scales.y.max = maxY;
      chart.options.scales.y.min = minY;
      chart.update(); // Redraw the chart with new axis limits
    } else {
      console.warn('Track not found in data:', trackName);
    }
  };
  const loadTrackLimits = async () => {
    const fileName = 'track coordinates.json'; // Adjust the path as needed
    try {
      const response = await fetch(fileName);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      trackLimits = await response.json();
      console.log('Track limits loaded:', trackLimits);
    } catch (error) {
      console.error('Error fetching or parsing JSON:', error);
    }
  };
// Function to interpolate between two points
const interpolate = (start, end, factor) => {
  return {
    x: start.x + factor * (end.x - start.x),
    y: start.y + factor * (end.y - start.y)
  };
};

// Function to animate the chart
const animateChart = () => {
  if (dataPoints.length === 2) {
    const now = Date.now();
    if (!animationStartTime) {
      animationStartTime = now;
    }

    const elapsedTime = now - animationStartTime;
    const factor = Math.min(elapsedTime / animationDuration, 1);

    const startPoint = dataPoints[0];
    const endPoint = dataPoints[1];
    const interpolatedPoint = interpolate(startPoint, endPoint, factor);

    chart.data.datasets[0].data = [interpolatedPoint];
    chart.update();

    if (factor < 1) {
      // Continue animation
      requestAnimationFrame(animateChart);
    } else {
      // Reset animation
      animationStartTime = null;
      setTimeout(() => {
        // Wait for the next data point to animate to
      }, 500); // Delay before the next animation starts
    }
  }
};


// Initialize the chart when the image is loaded or on page load
window.onload = async () => {
  await loadTrackLimits();
  if (image.complete) {
    initializeChart();
  } else {
    image.onload = initializeChart;
  }
};

// Handle WebSocket connection events
const ws = new WebSocket('ws://localhost:8080'); // Make sure this matches your server port

ws.onopen = () => {
  console.log('WebSocket connection established.');
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed.');
};

let trackLoaded = false;
let trackImageSrc = '';
let isTrackDataReceived = false;
// Handle incoming WebSocket messages
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    //console.log(data['track'])
    if (data['track']) {
        playerName = data['playerName'];
        console.log(isTrackDataReceived)
        // Handle track data
        trackImageSrc = `Images/${data['track']}.png`; // Adjust path as needed
        image.src = trackImageSrc;
        isTrackDataReceived = true;
        
        if (chart) {
          chart.data.datasets[0].label = playerName;
          updateChartAxisLimits(data['track']);
          chart.update(); // Force a redraw after the track image is loaded
    }
    } else if (data.tyreContactPointFLX) {
        // Handle coordinate data only if track is loaded
        if (!isTrackDataReceived || !imageLoaded) {
        console.warn('Track image not loaded yet');
        return; // Exit if track is not loaded
        }

        dataPoints.push({
        x: ((data.tyreContactPointFLX + data.tyreContactPointFRX + data.tyreContactPointRLX + data.tyreContactPointRRX) / 4),
        y: ((data.tyreContactPointFLY + data.tyreContactPointFRY + data.tyreContactPointRLY + data.tyreContactPointRRY) / 4)
        });

        if (dataPoints.length > 2) {
        dataPoints.shift(); // Remove the oldest point if more than 2 points
        }

        // Start the animation loop if not already running
        if (dataPoints.length === 2 && !animationStartTime) {
        animateChart();
        }
    }
};
