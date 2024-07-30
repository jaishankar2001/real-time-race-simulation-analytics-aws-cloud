// server.js
const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
const mqtt = require('mqtt');
const fs = require('fs');
//const chart = require('chart');

const app = express();
const port = 8080;

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Paths to your certificate files
const CERT_PATH = './connect_device_package/trail-laptop.cert.pem';
const KEY_PATH = './connect_device_package/trail-laptop.private.key';
const CA_PATH = './connect_device_package/root-CA.crt';

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
const initialTopic = 'cars/information';
const mqttClient = mqtt.connect(options);
mqttClient.on('connect', () => {
  console.log('Connected to AWS IoT Core');

  // Subscribe to your topic
  mqttClient.subscribe(initialTopic, (err) => {
    if (!err) {
      console.log(`Subscribed to initial topic: ${initialTopic}`);
    } else {
      console.error('Subscription error:', err);
    }
  });
});
mqttClient.on('message', (topic, message) => {
  // Broadcast message to all WebSocket clients
  if (topic === initialTopic) {
    console.log("data")
    const dataPoint = JSON.parse(message.toString());
    const playerName = dataPoint['playerName'];
    const newTopic = "telemetry/"+playerName;
    if (newTopic) {
        // Subscribe to the new topic
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(dataPoint));
            }
        });
        mqttClient.subscribe(newTopic, (err) => {
          if (!err) {
            console.log(`Subscribed to new topic: ${newTopic}`);
          } else {
            console.error('Subscription error:', err);
          }
        });
    }
  }else{
    const dataPoint = JSON.parse(message.toString());
    //console.log('Received message:', dataPoint);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(dataPoint));
        }
    });
}
});

// Serve static files from the "public" directory
// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
server.on("connection", (connection, request) => {
  console.log("new connection requested")
});
