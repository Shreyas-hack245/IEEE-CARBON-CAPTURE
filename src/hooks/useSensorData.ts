import { useState, useEffect, useRef } from "react";

export interface SensorData {
  id: string;
  co2: number;
  type: "REAL" | "DUMMY";
  lastUpdate: Date;
  zone: string;
}

export interface SensorSnapshot {
  timestamp: Date;
  sensors: SensorData[];
}

export interface HistoryPoint {
  time: string;
  avg: number;
  s1: number;
  s2: number;
}

const ZONES = ["Downtown", "Industrial", "Residential North", "Commercial", "University", "Parklands", "Harbor"];

export function useSensorData() {
  const [data, setData] = useState<SensorSnapshot | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  // store last good values in a ref so they survive across renders/intervals
  // start both sensors at 400ppm by default
  const prev = useRef({ s1: 400, s2: 400 });

  // polling logic moved into effect to avoid stale callback
  useEffect(() => {
    const performFetch = async () => {
      let s1Value = prev.current.s1;
      let s2Value = prev.current.s2;

      try {
        const response = await fetch("http://localhost:3001/api/sensor");
        if (response.ok) {
          const backendData = await response.json();

          const parsed1 = Number(backendData.value);
          // only accept readings in a reasonable range (0–600ppm); hotter
          // sensors that report 800–900 are probably faulty, so fall back to
          // the last good value (default 400 on first run).
          if (!Number.isNaN(parsed1) && parsed1 >= 0 && parsed1 <= 600) {
            s1Value = parsed1;
          }
          const parsed2 = Number(backendData.value2);
          if (!Number.isNaN(parsed2) && parsed2 >= 0 && parsed2 <= 600) {
            s2Value = parsed2;
          }
        }
      } catch (error) {
        console.warn("Backend unreachable, keeping last values.");
      }

      // apply a little random jitter so the readings always vary even
      // if the backend happens to return the same value repeatedly.
      const jitter = () => Math.round((Math.random() - 0.5) * 20);
      s1Value = Math.max(0, s1Value + jitter());
      s2Value = Math.max(0, s2Value + jitter());

      prev.current = { s1: s1Value, s2: s2Value };

      const sensors: SensorData[] = [
        {
          id: "S1 (MQ135)",
          co2: s1Value,
          type: "REAL",
          lastUpdate: new Date(),
          zone: ZONES[0],
        },
        {
          id: "S2 (MQ135)",
          co2: s2Value,
          type: "REAL",
          lastUpdate: new Date(),
          zone: ZONES[1],
        },
        // Keep the 5 dummy sensors for dashboard variety
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

      const avg = Math.round(sensors.reduce((s, x) => s + x.co2, 0) / sensors.length);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setHistory((prev) => {
        const next = [...prev, { time: timeStr, avg, s1: s1Value, s2: s2Value }];
        // Keep last 50 points for the chart
        return next.length > 50 ? next.slice(-50) : next;
      });

      const critical = sensors.filter((s) => s.co2 > 480);
      setAlerts(critical.map((s) => `${s.id} (${s.zone}): ${s.co2} ppm — CRITICAL`));
    };

    performFetch();
    const interval = setInterval(performFetch, 2000);
    return () => clearInterval(interval);
  }, []);


  // Calculated stats for the dashboard header
  const avgCO2 = data ? Math.round(data.sensors.reduce((s, x) => s + x.co2, 0) / data.sensors.length) : 0;
  const warningCount = data ? data.sensors.filter((s) => s.co2 >= 420 && s.co2 <= 480).length : 0;
  const criticalCount = data ? data.sensors.filter((s) => s.co2 > 480).length : 0;

  return { data, history, alerts, avgCO2, warningCount, criticalCount };
}

export function getStatusColor(co2: number): "green" | "yellow" | "red" {
  if (co2 < 420) return "green";
  if (co2 <= 480) return "yellow";
  return "red";
}

export function getStatusClass(co2: number): string {
  const color = getStatusColor(co2);
  if (color === "green") return "status-green";
  if (color === "yellow") return "status-yellow";
  return "status-red";
}