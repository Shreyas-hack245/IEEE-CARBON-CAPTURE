import { useState, useEffect, useCallback, useRef } from "react";

// ... Keep your interfaces (SensorData, SensorSnapshot, HistoryPoint) exactly as they are

const ZONES = ["Downtown", "Industrial", "Residential North", "Commercial", "University", "Parklands", "Harbor"];

export function useSensorData() {
  const [data, setData] = useState<SensorSnapshot | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  // We keep one ref for the dummy second sensor, but we'll fetch S1 from your server
  const prevS2 = useRef<number>(395);

  const fetchData = useCallback(async () => {
    let esp32Value = 400; // Default fallback value

    try {
      // 1. FETCH REAL DATA FROM YOUR NODE SERVER
      const response = await fetch("http://localhost:3001/api/sensor");
      const backendData = await response.json();
      if (backendData && backendData.value) {
        esp32Value = Number(backendData.value);
      }
    } catch (error) {
      console.error("Backend not reached, using default value", error);
    }

    const r2 = Math.round(Math.max(350, Math.min(520, prevS2.current + (Math.random() - 0.5) * 10)));
    prevS2.current = r2;

    // 2. INJECT ESP32 VALUE INTO SENSOR S1
    const sensors: SensorData[] = [
      { id: "S1 (ESP32)", co2: esp32Value, type: "REAL", lastUpdate: new Date(), zone: ZONES[0] },
      { id: "S2 (SIM)", co2: r2, type: "REAL", lastUpdate: new Date(), zone: ZONES[1] },
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `S${i + 3}`,
        co2: Math.round(350 + Math.random() * 170),
        type: "DUMMY" as const,
        lastUpdate: new Date(),
        zone: ZONES[i + 2],
      })),
    ];

    const snapshot: SensorSnapshot = { timestamp: new Date(), sensors };
    setData(snapshot);

    // 3. UPDATE CHART HISTORY
    const avg = Math.round(sensors.reduce((s, x) => s + x.co2, 0) / sensors.length);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setHistory((prev) => {
      const next = [...prev, { time: timeStr, avg, s1: esp32Value, s2: r2 }];
      return next.length > 50 ? next.slice(-50) : next;
    });

    const critical = sensors.filter((s) => s.co2 > 480);
    setAlerts(critical.map((s) => `${s.id} (${s.zone}): ${s.co2} ppm — CRITICAL`));
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Poll every 2 seconds for faster updates
    return () => clearInterval(interval);
  }, [fetchData]);

  const avgCO2 = data ? Math.round(data.sensors.reduce((s, x) => s + x.co2, 0) / data.sensors.length) : 0;
  const warningCount = data ? data.sensors.filter((s) => s.co2 >= 420 && s.co2 <= 480).length : 0;
  const criticalCount = data ? data.sensors.filter((s) => s.co2 > 480).length : 0;

  return { data, history, alerts, avgCO2, warningCount, criticalCount };
}

// ... Keep your getStatusColor and getStatusClass functions at the bottom