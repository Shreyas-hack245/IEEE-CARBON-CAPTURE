# 🌍 Carbon Capture Monitoring System

A High-fidelity IoT solution using an ESP32, MQ135, and DHT11 sensors to track air quality and environmental data, visualized through a tactical real-time "Hotspot Matrix" dashboard.

---

## 🏗 Project Architecture
Hardware: ESP32 micro-controller reading analog data from Dual MQ135 gas sensors (CO2/Air Quality) and a DHT11 (Temperature/Humidity) sensor.

* Connectivity: Data is transmitted via WiFi as JSON payloads using HTTP POST requests.

* Backend: Node.js server utilizing Express to receive data and Socket.io to stream live updates to the dashboard.

* Frontend: A tactical React/Tailwind dashboard featuring:

* Hotspot Matrix: Real-time atmospheric dispersion model using HTML5 Canvas.

* Multi-Node Monitoring: Independent tracking for multiple industrial and residential sectors.
---

## 🔌 Hardware Setup

### **Wiring Diagram**

| Component | Pin | ESP32 Pin | Description |
| :--- | :--- | :--- | :--- |
| **MQ135 (S1)** | **VCC** | **VIN (5V)** | Powers the internal sensor heater |
| **MQ135 (S1)** | **GND** | **GND** | Common ground |
| **MQ135 (S1)** | **AOUT** | **GPIO 34** | Analog data for Sensor 1 |
| **MQ135 (S2)** | **VCC** | **VIN (5V)** | Powers the internal sensor heater |
| **MQ135 (S2)** | **GND** | **GND** | Common ground |
| **MQ135 (S2)** | **AOUT** | **GPIO 35** | Analog data for Sensor 2 |
| **DHT11** | **VCC** | **3.3V / VIN** | Power supply for humidity/temp sensor |
| **DHT11** | **DATA** | **GPIO 13** | Digital environmental data signal |
| **DHT11** | **GND** | **GND** | Common ground |
---

## 💻 ESP32 Firmware

This code handles WiFi connection and transmits sensor data every 5 seconds.

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"

// --- WIFI CONFIGURATION ---
const char* ssid = "YOUR_WIFI_NAME"; 
const char* password = "YOUR_WIFI_PASSWORD";

// --- BACKEND CONFIGURATION ---
// IMPORTANT: Put your Laptop's IPv4 address here (e.g., 192.168.1.15)
const char* serverUrl =  "http://192.168.x.xx:3001/api/sensor";

// --- SENSOR PINS ---
const int MQ135_PIN = 34; // MQ135 connected to G34
#define DHTPIN 13         // DHT11 "Out" connected to G13
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin(); // Initialize the DHT11
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Connected! IP: " + WiFi.localIP().toString());
  
  analogReadResolution(12); // Ensure 12-bit for ESP32 (0-4095)
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    
    // 1. Read DHT11 (Digital Data)
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    // 2. Read MQ135 (Analog Data) - Averaging 10 times for stability
    long rawMQ = 0;
    for(int i=0; i<10; i++) { 
      rawMQ += analogRead(MQ135_PIN);
      delay(10);
    }
    rawMQ /= 10;

    // Convert to approximate PPM
    float co2Ppm = map(rawMQ, 0, 4095, 400, 2000);

    // 3. Prepare JSON (Matching your Dashboard's keys)
    StaticJsonDocument<256> doc; 
    
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("❌ DHT11 Read Error! Check wiring on G13.");
      doc["temp"] = 25.0; // Fallback so dashboard doesn't break
      doc["hum"] = 50.0;
    } else {
      doc["temp"] = temperature; 
      doc["hum"] = humidity;
    }

    doc["value"] = co2Ppm;      // Primary CO2 Gauge
    doc["value2"] = co2Ppm + 3; // Simulated secondary line for the "Wave" effect

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    // 4. Send POST Request
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.printf("Sent -> PPM: %.1f | Temp: %.1f | Hum: %.1f | Code: %d\n", 
                    co2Ppm, temperature, humidity, httpResponseCode);
    } else {
      Serial.println("Error: " + http.errorToString(httpResponseCode));
    }
    http.end();
  }
  delay(2000); // Send data every 2 seconds
}
```
the sensors default value is set to 400ppm
## 🚀 Running the Application

To run the system, you must start the backend server first so it is ready to receive data from the ESP32.

### **1. Launch the Backend (Node.js)**
1. Open your terminal or command prompt.
2. Navigate to the server directory:
   ```bash
   cd path/to/your/project/server
   ```
3.Install the necessary packages:
```bash
 npm install express cors body-parser
```
4.Start the server:
```bash
node server.cjs
```
The terminal should display: Server running on port 3000.

2. Launch the Frontend (Dashboard)
Keep the backend terminal running.

Locate the index.html file in your project folder.

Open it directly in your web browser (Chrome, Edge, or Firefox).

You should see the dashboard interface waiting for data.

3. Start the ESP32
Power the ESP32 via USB or an external power supply.

Ensure the ESP32 is within range of your WiFi.

Once connected, the ESP32 will start sending POST requests, and the dashboard will update automatically.

   
