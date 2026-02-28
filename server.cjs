const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3001; 

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Path to store the data
const DATA_FILE = 'data.json';

// 1. ESP32 Sends data here
app.post('/api/sensor', (req, res) => {
    const sensorData = {
        value: req.body.value || 0,
        timestamp: new Date().toISOString()
    };
    
    // Save to data.json
    fs.writeFileSync(DATA_FILE, JSON.stringify(sensorData));
    
    console.log("ESP32 Data Received and Saved:", sensorData);
    res.status(200).send({ message: "Data stored successfully" });
});

// 2. Your Website gets data from here
app.get('/api/sensor', (req, res) => {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE);
        res.json(JSON.parse(data));
    } else {
        res.json({ value: 400, message: "No real data yet" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Backend is running on http://localhost:${PORT}`);
    console.log(`📡 ESP32 should target: http://192.168.1.6:${PORT}/api/sensor`);
});