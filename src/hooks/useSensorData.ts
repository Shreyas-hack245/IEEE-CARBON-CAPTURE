import { useState, useEffect, useCallback, useRef } from "react";

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

const ZONES = ["Downtown", "Industrial", "Residential North", "Commercial", "University", "Parklands", "Harbor"];

const generateDummyCO2 = () => Math.round(350 + Math.random() * 170);

const generateRealCO2 = (prev: number) => {
  const drift = (Math.random() - 0.5) * 20;
  return Math.round(Math.max(350, Math.min(520, prev + drift)));
};

export interface HistoryPoint {
  time: string;
  avg: number;
  s1: number;
  s2: number;
}

export function useSensorData() {
  const [data, setData] = useState<SensorSnapshot | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const prevReal = useRef<[number, number]>([410, 395]);

  const fetchData = useCallback(() => {
    const r1 = generateRealCO2(prevReal.current[0]);
    const r2 = generateRealCO2(prevReal.current[1]);
    prevReal.current = [r1, r2];

    const sensors: SensorData[] = [
      { id: "S1", co2: r1, type: "REAL", lastUpdate: new Date(), zone: ZONES[0] },
      { id: "S2", co2: r2, type: "REAL", lastUpdate: new Date(), zone: ZONES[1] },
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `S${i + 3}`,
        co2: generateDummyCO2(),
        type: "DUMMY" as const,
        lastUpdate: new Date(),
        zone: ZONES[i + 2],
      })),
    ];

    const snapshot: SensorSnapshot = { timestamp: new Date(), sensors };
    setData(snapshot);

    const avg = Math.round(sensors.reduce((s, x) => s + x.co2, 0) / sensors.length);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

    setHistory((prev) => {
      const next = [...prev, { time: timeStr, avg, s1: r1, s2: r2 }];
      return next.length > 50 ? next.slice(-50) : next;
    });

    const critical = sensors.filter((s) => s.co2 > 480);
    setAlerts(critical.map((s) => `${s.id} (${s.zone}): ${s.co2} ppm — CRITICAL`));
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

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
