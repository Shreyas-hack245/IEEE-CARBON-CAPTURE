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

// In-memory cache for ultra-fast access
let lastKnownData = {
    value: 400,    // Sensor 1 (ESP32)
    value2: 400,   // Sensor 2 (SIM/Second ESP)
    temp: 25.0,
    hum: 50.0,
    timestamp: new Date().toISOString()
};

// Load existing data from disk on startup so we don't lose history
if (fs.existsSync(DATA_FILE)) {
    try {
        const fileContent = fs.readFileSync(DATA_FILE);
        const parsed = JSON.parse(fileContent);
        // Merge with defaults to ensure all keys (like value2) exist
        lastKnownData = { ...lastKnownData, ...parsed }; 
        console.log("📂 [System] Previous session data restored from disk.");
    } catch (e) {
        console.log("⚠️ [Warning] data.json is corrupted. Starting with defaults.");
    }
}

/**
 * Robust parser for hardware data. 
 * Prevents "0", "null", or strings from crashing the frontend.
 */
const parseValue = (val, currentStored) => {
    if (val === undefined || val === null || val === "") return currentStored;
    const n = parseFloat(val);
    // Ignore invalid readings (NaN or zero/negative which might be sensor errors)
    return (Number.isNaN(n) || n <= 0) ? currentStored : n;
};

// --- ROUTES ---

/**
 * 1. POST: Receiver for ESP32 / Simulation
 * Supports JSON Body OR URL Query Parameters
 */
app.post('/api/sensor', (req, res) => {
    // Check both req.body and req.query for maximum hardware compatibility
    const source = Object.keys(req.body).length > 0 ? req.body : req.query;

    lastKnownData = {
        value: parseValue(source.value, lastKnownData.value),
        value2: parseValue(source.value2, lastKnownData.value2),
        temp: parseValue(source.temp, lastKnownData.temp),
        hum: parseValue(source.hum, lastKnownData.hum),
        timestamp: new Date().toISOString()
    };

    // Save to disk asynchronously so we don't slow down the response
    fs.writeFile(DATA_FILE, JSON.stringify(lastKnownData, null, 2), (err) => {
        if (err) console.error("❌ Disk Write Error:", err);
    });
    
    console.log(`🚀 [UPLOAD] S1: ${lastKnownData.value} | S2: ${lastKnownData.value2} | T: ${lastKnownData.temp}°C | H: ${lastKnownData.hum}%`);
    res.status(200).send({ status: "success", received: lastKnownData });
});

/**
 * 2. GET: Provider for the React Frontend
 */
app.get('/api/sensor', (req, res) => {
    res.json(lastKnownData);
});

// --- UTILITIES ---

/**
 * Automatically finds your computer's IP on the local network.
 * Essential for pointing the ESP32 to the correct server address.
 */
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}

// Bind to 0.0.0.0 to allow external devices (ESP32) on the network to connect
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`\n=========================================`);
    console.log(`✅ ECO TWIN BACKEND: ONLINE`);
    console.log(`🖥️  FRONTEND URL:  http://localhost:${PORT}`);
    console.log(`📡 ESP32 ENDPOINT: http://${localIP}:${PORT}/api/sensor`);
    console.log(`=========================================\n`);
});