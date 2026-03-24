const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const os = require('os'); 

const app = express();
const PORT = 3001; 

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const DATA_FILE = 'data.json';

let lastKnownData = {
    value: 400,
    value2: 400,
    temp: 25.0,
    hum: 50.0,
    timestamp: new Date().toISOString()
};

if (fs.existsSync(DATA_FILE)) {
    try {
        const fileContent = fs.readFileSync(DATA_FILE);
        lastKnownData = { ...lastKnownData, ...JSON.parse(fileContent) }; 
        console.log("📂 [System] Previous session data restored.");
    } catch (e) {
        console.log("⚠️ [Warning] data.json corrupted.");
    }
}

const parseValue = (val, currentStored) => {
    if (val === undefined || val === null || val === "") return currentStored;
    const n = parseFloat(val);
    return (Number.isNaN(n) || n <= 0) ? currentStored : n;
};

// --- ROUTES ---

app.post('/api/sensor', (req, res) => {
    const source = Object.keys(req.body).length > 0 ? req.body : req.query;

    lastKnownData = {
        value: parseValue(source.value, lastKnownData.value),
        value2: parseValue(source.value2, lastKnownData.value2),
        temp: parseValue(source.temp, lastKnownData.temp),
        hum: parseValue(source.hum, lastKnownData.hum),
        timestamp: new Date().toISOString()
    };

    fs.writeFile(DATA_FILE, JSON.stringify(lastKnownData, null, 2), (err) => {
        if (err) console.error("❌ Write Error:", err);
    });
    
    console.log(`🚀 [DATA RECEIVED] CO2: ${lastKnownData.value} | Temp: ${lastKnownData.temp}°C | Hum: ${lastKnownData.hum}%`);
    res.status(200).send({ status: "success" });
});

app.get('/api/sensor', (req, res) => {
    res.json(lastKnownData);
});

// --- IMPROVED IP DETECTION ---
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    let preferredIP = '127.0.0.1';
    
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            // Ignore IPv6, internal, and VirtualBox (192.168.56.x) addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                if (!iface.address.startsWith('192.168.56')) {
                    preferredIP = iface.address;
                }
            }
        }
    }
    return preferredIP;
}

app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`\n=========================================`);
    console.log(`✅ BACKEND LIVE ON PORT ${PORT}`);
    console.log(`📡 USE THIS IN ARDUINO: http://${localIP}:${PORT}/api/sensor`);
    console.log(`=========================================\n`);
});