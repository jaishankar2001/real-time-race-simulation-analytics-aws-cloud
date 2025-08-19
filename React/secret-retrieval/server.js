// server.js (Node.js/Express backend)

const express = require('express');
const AWS = require('aws-sdk');

const app = express();
const port = process.env.PORT || 3001;

// Configure AWS SDK
AWS.config.update({
  region: 'us-west-2', // Replace with your region
  credentials: new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })
});

const secretsManager = new AWS.SecretsManager();

app.get('/api/secrets', async (req, res) => {
  try {
    const secretName = 'your-secret-id'; // Replace with your secret ID
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    const secret = JSON.parse(data.SecretString);
    res.json(secret);
  } catch (err) {
    console.error('Error retrieving secret:', err);
    res.status(500).send('Error retrieving secret');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
