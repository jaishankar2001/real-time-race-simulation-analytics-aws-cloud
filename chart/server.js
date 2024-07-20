const fs = require('fs');
const http = require('http');
const mqtt = require('mqtt');
const WebSocket = require('ws');
const path = require('path');

// Paths to your x.509 certificates
const CERT_PATH = '../connect_device_package/trail-laptop.cert.pem';
const KEY_PATH = '../connect_device_package/trail-laptop.private.key';
const CA_PATH = '../connect_device_package/root-CA.crt';

// AWS IoT Endpoint and Topic
const AWS_IOT_ENDPOINT = 'a2f67lk3o0rml9-ats.iot.us-east-1.amazonaws.com'; // replace with your AWS IoT endpoint
const TOPIC = 'telemetry/disconnector12'; // replace with your topic

// MQTT Client Options for MQTT 5
const options = {
  host: AWS_IOT_ENDPOINT,
  port: 8883,
  protocol: 'mqtts',
  key: fs.readFileSync(KEY_PATH),
  cert: fs.readFileSync(CERT_PATH),
  ca: fs.readFileSync(CA_PATH),
  clientId: 'mqtt-client-' + Math.floor((Math.random() * 100000) + 1),
  keepalive: 60,
  reconnectPeriod: 1000,
  protocolVersion: 5, // Specify MQTT 5
  clean: true,
  encoding: 'utf8'
};

// Create MQTT client and connect
const client = mqtt.connect(options);

// Create HTTP server to serve HTML and JS files
const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (req.url === '/') {
      fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading index.html');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    } else if (req.url === '/app.js') {
      fs.readFile(path.join(__dirname, 'app.js'), (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading app.js');
        } else {
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(data);
        }
      });
    } else if (req.url === './Monza.png') {
      fs.readFile(path.join(__dirname, './Monza.png'), (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading background image');
        } else {
          res.writeHead(200, { 'Content-Type': 'image/png' });
          res.end(data);
        }
      });
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  } else {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Handle MQTT messages
client.on('connect', () => {
  console.log('Connected to AWS IoT');
  client.subscribe(TOPIC, (err) => {
    if (err) {
      console.error('Subscription error:', err);
    }
  });
});

client.on('message', (topic, message) => {
  console.log('Received message:', message.toString());
  // Broadcast message to all connected WebSocket clients
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message.toString());
    }
  });
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
});

wss.on('close', () => {
  console.log('WebSocket client disconnected');
});

// Start the HTTP server on port 8080
server.listen(8080, () => {
  console.log('HTTP server listening on port 8080');
});
