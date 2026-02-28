const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3001; // Your backend port

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 1. ESP32 Sends data here
app.post('/api/sensor', (req, res) => {
    const sensorData = {
        value: req.body.value, // This matches what ESP32 sends
        timestamp: new Date().toLocaleString()
    };
    
    // Save to data.json
    fs.writeFileSync('data.json', JSON.stringify(sensorData));
    
    console.log("ESP32 Data Received:", sensorData);
    res.status(200).send("Success");
});

// 2. Your Website gets data from here
app.get('/api/sensor', (req, res) => {
    if (fs.existsSync('data.json')) {
        const data = fs.readFileSync('data.json');
        res.json(JSON.parse(data));
    } else {
        res.json({ value: 0 });
    }
});

app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});