import { useState, useEffect, useRef } from "react";

export interface SensorData {
  id: string;
  co2: number;
  aqi: number;
  temp: number;
  hum: number;
  type: "REAL" | "DUMMY";
  lastUpdate: Date;
  zone: string;
}

export interface SensorSnapshot {
  timestamp: Date;
  sensors: SensorData[];
  temp: number;
  hum: number;
}

export interface HistoryPoint {
  time: string;
  s1: number;    // CO2 Sensor 1
  s2: number;    // CO2 Sensor 2
  aqi: number;   // Average AQI
  temp: number;  // Temperature
  hum: number;   // Humidity
}

const ZONES = ["Downtown", "Industrial", "Residential North", "Commercial", "University", "Parklands", "Harbor"];

export function calculateAQI(co2: number): number {
  if (co2 <= 400) return Math.round((co2 / 400) * 50);
  if (co2 <= 600) return Math.round(50 + ((co2 - 400) / 200) * 50);
  if (co2 <= 1000) return Math.round(100 + ((co2 - 600) / 400) * 100);
  return Math.min(500, Math.round(200 + ((co2 - 1000) / 1000) * 300));
}

export function useSensorData() {
  const [data, setData] = useState<SensorSnapshot | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  // Use refs to persist values between intervals
  const prev = useRef({ s1: 400, s2: 400, temp: 25, hum: 50 });

  useEffect(() => {
    const performFetch = async () => {
      let s1Value = prev.current.s1;
      let s2Value = prev.current.s2;
      let currentTemp = prev.current.temp;
      let currentHum = prev.current.hum;

      try {
        const response = await fetch("http://localhost:3001/api/sensor");
        if (response.ok) {
          const backendData = await response.json();
          
          // Improved Safety Parsing
          if (backendData.value !== undefined) s1Value = Number(backendData.value);
          if (backendData.value2 !== undefined) s2Value = Number(backendData.value2);
          if (backendData.temp !== undefined) currentTemp = Number(backendData.temp) || 25;
          if (backendData.hum !== undefined) currentHum = Number(backendData.hum) || 50;
        }
      } catch (error) {
        console.warn("Backend unreachable, using last known/jittered values.");
      }

      // Live Jitter for the "Wavy" effect on charts
      const jitter = () => (Math.random() - 0.5) * 2;
      s1Value = Math.max(300, s1Value + jitter());
      s2Value = Math.max(300, s2Value + jitter());

      prev.current = { s1: s1Value, s2: s2Value, temp: currentTemp, hum: currentHum };

      // Build the active sensor list
      const sensors: SensorData[] = [
        { 
          id: "S1 (ESP32)", 
          co2: Math.round(s1Value), 
          aqi: calculateAQI(s1Value), 
          temp: currentTemp,
          hum: currentHum,
          type: "REAL", 
          lastUpdate: new Date(), 
          zone: ZONES[0] 
        },
        { 
          id: "S2 (SIM)", 
          co2: Math.round(s2Value), 
          aqi: calculateAQI(s2Value), 
          temp: currentTemp + 0.5,
          hum: currentHum - 2,
          type: "REAL", 
          lastUpdate: new Date(), 
          zone: ZONES[1] 
        },
        ...Array.from({ length: 5 }, (_, i) => {
          const seed = i + 3;
          const dummyCO2 = 400 + (seed * 10) + (Math.random() * 15);
          return {
            id: `S${seed}`,
            co2: Math.round(dummyCO2),
            aqi: calculateAQI(dummyCO2),
            temp: 22 + (seed % 3) + Math.random(),
            hum: 45 + (seed % 5) + Math.random(),
            type: "DUMMY" as const,
            lastUpdate: new Date(),
            zone: ZONES[i + 2],
          };
        }),
      ];

      setData({ timestamp: new Date(), sensors, temp: currentTemp, hum: currentHum });

      // Update History for the Trends
      const avgAQIVal = Math.round(sensors.reduce((acc, s) => acc + s.aqi, 0) / sensors.length);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setHistory((prevHistory) => {
        const nextPoint: HistoryPoint = { 
          time: timeStr, 
          s1: Number(s1Value.toFixed(1)), 
          s2: Number(s2Value.toFixed(1)), 
          aqi: avgAQIVal,
          temp: Number(currentTemp.toFixed(1)), 
          hum: Number(currentHum.toFixed(1)) 
        };
        return [...prevHistory, nextPoint].slice(-30); 
      });

      // Simple Alert Logic
      const critical = sensors.filter((s) => s.co2 > 480);
      setAlerts(critical.map((s) => `${s.id}: ${s.co2} ppm — High Concentration`));
    };

    performFetch();
    const interval = setInterval(performFetch, 2000);
    return () => clearInterval(interval);
  }, []);

  const avgCO2 = data ? Math.round(data.sensors.reduce((s, x) => s + x.co2, 0) / data.sensors.length) : 0;
  const avgAQI = data ? Math.round(data.sensors.reduce((s, x) => s + x.aqi, 0) / data.sensors.length) : 0;

  // Added criticalCount so SensorNetwork.tsx works correctly
  return { data, history, alerts, avgCO2, avgAQI, criticalCount: alerts.length };
}

export function getStatusColor(co2: number): "green" | "yellow" | "red" {
  if (co2 < 420) return "green";
  if (co2 <= 480) return "yellow";
  return "red";
}