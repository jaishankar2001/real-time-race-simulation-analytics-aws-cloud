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
          display: false
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

  // Update chart data
  if (chart) {
    chart.data.datasets[0].data.push({
      x: ((dataPoint['tyreContactPointFLX'] + dataPoint['tyreContactPointFRX'] + dataPoint['tyreContactPointRLX'] + dataPoint['tyreContactPointRRX']) / 4),
      y: ((dataPoint['tyreContactPointFLY'] + dataPoint['tyreContactPointFRY'] + dataPoint['tyreContactPointRLY'] + dataPoint['tyreContactPointRRY']) / 4)
    });

    // Optionally limit the number of data points displayed
    if (chart.data.datasets[0].data.length > 1) { // Example limit
      chart.data.datasets[0].data.shift();
    }

    // Update the chart
    chart.update();
  }
}