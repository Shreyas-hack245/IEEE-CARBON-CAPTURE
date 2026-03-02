# 🌍 Carbon Capture Monitoring System

A complete IoT solution using an **ESP32** and **MQ135** sensors to track air quality and visualize data on a live web dashboard.

---

## 🏗 Project Architecture
* **Hardware:** ESP32 reads analog data from dual MQ135 sensors.
* **Connectivity:** Data is transmitted via WiFi as JSON payloads.
* **Backend:** Node.js server receives data and serves the frontend.
* **Frontend:** HTML/JavaScript dashboard for real-time visualization.

---

## 🔌 Hardware Setup

### **Wiring Diagram**
| MQ135 Pin | ESP32 Pin | Description |
| :--- | :--- | :--- |
| **VCC** | **VIN (5V)** | Powers the internal sensor heater |
| **GND** | **GND** | Common ground |
| **AOUT (S1)** | **GPIO 34** | Analog data for Sensor 1 |
| **AOUT (S2)** | **GPIO 35** | Analog data for Sensor 2 |



---

## 💻 ESP32 Firmware

This code handles WiFi connection and transmits sensor data every 5 seconds.

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- WIFI CONFIGURATION ---
const char* ssid = "YOUR_WIFI_NAME"; 
const char* password = "YOUR_WIFI_PASSWORD";

// --- BACKEND CONFIGURATION ---
// Replace 192.168.1.6 with your Laptop's actual IPv4 address
const char* serverUrl = "http://192.168.1.6:3001/api/sensor";

const int SENSOR1_PIN = 34; 
const int SENSOR2_PIN = 35;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n Connected! IP: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // 1. Read & Average for stability
    long raw1 = 0, raw2 = 0;
    for(int i=0; i<10; i++) { 
      raw1 += analogRead(SENSOR1_PIN);
      raw2 += analogRead(SENSOR2_PIN);
      delay(50);
    }
    raw1 /= 10; raw2 /= 10;

    // 2. Convert to approximate PPM
    float ppm1 = map(raw1, 0, 4095, 400, 2000); 
    float ppm2 = map(raw2, 0, 4095, 400, 2000);

    // 3. Prepare JSON (Matching Backend Keys)
    JsonDocument doc; 
    doc["value"] = ppm1;   // Must be "value"
    doc["value2"] = ppm2;  // Must be "value2"

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    // 4. Send POST Request
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.printf("Data Sent: [%.1f, %.1f] | Response: %d\n", ppm1, ppm2, httpResponseCode);
    } else {
      Serial.println("Error: " + http.errorToString(httpResponseCode));
    }
    http.end();
  }
  delay(2000); 
}
```
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

   
