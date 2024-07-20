// Ensure the LightningChart library is correctly referenced
//const lcjs = window.lcjs;
const { lightningChart, SolidFill, ColorRGBA, PatternFill, PatternFillLayouts } = lcjs;

// Connect to the WebSocket server
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('Connected to WebSocket server');
};

ws.onmessage = (event) => {
  console.log('Received message:', event.data);
  const data = JSON.parse(event.data);
  addDataToChart(data);
};

// LightningChart.js configuration
const chart = lightningChart().ChartXY({
  container: 'chart-container'
});

const lineSeries = chart.addLineSeries();

const backgroundImage = new Image();
backgroundImage.src = 'Monza.png'; // replace with your PNG file path

backgroundImage.onload = () => {
  chart.setBackgroundFillStyle(new SolidFill({
    color: new ColorRGBA(255, 255, 255, 255),
    pattern: new PatternFill({
      width: chart.getDefaultAxisX().getPixelWidth(),
      height: chart.getDefaultAxisY().getPixelHeight(),
      image: backgroundImage,
      layout: PatternFillLayouts.Stretch
    })
  }));
};

// Function to add data to the chart
function addDataToChart(data) {
  lineSeries.add({ x: ((data['tyreContactPointFLX']+data['tyreContactPointFRX']+data['tyreContactPointRLX']+data['tyreContactPointRRX'])/4), y: ((data['tyreContactPointFLY']+data['tyreContactPointFRY']+data['tyreContactPointRLY']+data['tyreContactPointRRY'])/4) }); // assuming data object has 'time' and 'value' properties
}
