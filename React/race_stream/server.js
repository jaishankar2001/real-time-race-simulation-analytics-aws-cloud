const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
const mqtt = require('mqtt');
const fs = require('fs');

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
const existingPlayers = {};

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

const getRandomColor = () => {
  let r, g, b;
  do {
    r = Math.floor(Math.random() * 256);
    g = Math.floor(Math.random() * 256);
    b = Math.floor(Math.random() * 256);
  } while ((r + g + b) > 600);
  return `rgb(${r}, ${g}, ${b})`;
};

mqttClient.on('message', (topic, message) => {
  if (topic === initialTopic) {
    const dataPoint = JSON.parse(message.toString());
    const playerName = dataPoint['playerName'];

    if (!existingPlayers[playerName]) {
      const playerColor = getRandomColor();
      existingPlayers[playerName] = playerColor;
      dataPoint['color'] = playerColor;
      console.log(`Assigned new color to ${playerName}: ${playerColor}`);
    } else {
      dataPoint['color'] = existingPlayers[playerName];
      console.log(`Player ${playerName} already has color: ${existingPlayers[playerName]}`);
    }
    const newTopicPhysics = 'data/'+dataPoint['playerName']+'/telemetry';
    const newTopicGraphics = 'data/'+dataPoint['playerName']+'/graphics'; 

    // Broadcast the message with the player color to all WebSocket clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(dataPoint));
      }
    });
    
    // Additional code for subscribing to new topics
    if (newTopicPhysics) {
      mqttClient.subscribe(newTopicPhysics, (err) => {
        if (!err) {
          console.log(`Subscribed to new topic: ${newTopicPhysics}`);
        } else {
          console.error('Subscription error:', err);
        }
      });
    }

    if (newTopicGraphics) {
      mqttClient.subscribe(newTopicGraphics, (err) => {
        if (!err) {
          console.log(`Subscribed to new topic: ${newTopicGraphics}`);
        } else {
          console.error('Subscription error:', err);
        }
      });
    }
  } else {
    try {
      const dataPoint = JSON.parse(message.toString());
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(dataPoint));
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
    }
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

server.on('connection', (connection, request) => {
  console.log('New connection requested');
});
