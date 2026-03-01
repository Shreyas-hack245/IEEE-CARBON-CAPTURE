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

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://YOUR_SERVER_IP:3000/data";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi Connected");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    StaticJsonDocument<200> doc;
    doc["sensor1"] = analogRead(34);
    doc["sensor2"] = analogRead(35);

    String jsonStr;
    serializeJson(doc, jsonStr);

    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.POST(jsonStr);
    http.end();
  }
  delay(5000);
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

   
