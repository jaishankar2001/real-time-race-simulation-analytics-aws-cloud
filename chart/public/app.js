const ctx = document.getElementById('myChart').getContext('2d');

// Load the image
const image = new Image();
image.src = 'Monza.png'; // Ensure this path is correct

// Flag to indicate if the image is loaded
let imageLoaded = false;

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
    console.log('beforeDatasetsDraw called');
    if (imageLoaded) {
      const ctx = chart.ctx;
      const { top, left, width, height } = chart.chartArea;
      ctx.drawImage(image, left, top, width, height);
      console.log('Image drawn on chart');
    }
  }
};

// Initialize the chart
let chart;
let dataPoints = [];
let animationStartTime = null;
const animationDuration = 200; // Animation duration in milliseconds

const initializeChart = () => {
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'MQTT Data',
        data: [], // Array to hold { x, y } data points
        borderColor: 'rgba(255, 0, 0, 1)', // Red border color
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
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
          min: -975, // Set to your desired minimum value
          max: 680,
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
          min: -230,
          max: 1060,
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
      }, 300); // Delay before the next animation starts
    }
  }
};

// Initialize the chart when the image is loaded or on page load
window.onload = () => {
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

// Handle incoming WebSocket messages
ws.onmessage = (event) => {
  const dataPoint = JSON.parse(event.data);

  // Add the new data point to the array, maintaining a maximum of 2 points
  dataPoints.push({
    x: ((dataPoint['tyreContactPointFLX'] + dataPoint['tyreContactPointFRX'] + dataPoint['tyreContactPointRLX'] + dataPoint['tyreContactPointRRX']) / 4),
    y: ((dataPoint['tyreContactPointFLY'] + dataPoint['tyreContactPointFRY'] + dataPoint['tyreContactPointRLY'] + dataPoint['tyreContactPointRRY']) / 4)
  });

  if (dataPoints.length > 2) {
    dataPoints.shift(); // Remove the oldest point if more than 2 points
  }

  // Start the animation loop if not already running
  if (dataPoints.length === 2 && !animationStartTime) {
    animateChart();
  }
};
