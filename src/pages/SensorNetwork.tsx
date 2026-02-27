import { useSensorData, getStatusColor } from "@/hooks/useSensorData";
import { Network, Wifi, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } };

export default function SensorNetwork() {
  const { data, avgCO2, warningCount, criticalCount } = useSensorData();

  if (!data) return <div className="glass-card p-10 rounded-xl animate-pulse h-96" />;

  const activeCount = data.sensors.length;
  const accuracy = Math.round((data.sensors.filter((s) => s.type === "REAL").length / activeCount) * 100);

  const netStats = [
    { label: "Active Sensors", value: activeCount, icon: Wifi, color: "text-primary" },
    { label: "Warning", value: warningCount, icon: AlertTriangle, color: "text-warning" },
    { label: "Critical", value: criticalCount, icon: XCircle, color: "text-destructive" },
    { label: "Data Accuracy", value: `${accuracy}%`, icon: CheckCircle, color: "text-accent" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold neon-text flex items-center gap-3">
          <Network className="w-7 h-7" /> Sensor Network
        </h1>
        <p className="text-sm text-muted-foreground mt-1">IoT sensor mesh — 7 nodes active</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {netStats.map((s) => (
          <div key={s.label} className="glass-card p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sensor Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.sensors.map((sensor) => {
          const status = getStatusColor(sensor.co2);
          return (
            <motion.div
              key={sensor.id}
              variants={item}
              className={`glass-card-hover p-5 rounded-xl ${sensor.type === "REAL" ? "ring-1 ring-primary/20" : ""}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-display text-base font-bold text-foreground">{sensor.id}</p>
                  <p className="text-xs text-muted-foreground">{sensor.zone}</p>
                </div>
                <span
                  className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                    sensor.type === "REAL" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {sensor.type}
                </span>
              </div>

              <div className="flex items-end gap-2 mb-3">
                <span className={`text-3xl font-bold font-mono ${status === "green" ? "status-green" : status === "yellow" ? "status-yellow" : "status-red"}`}>
                  {sensor.co2}
                </span>
                <span className="text-xs text-muted-foreground mb-1">ppm</span>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    status === "green"
                      ? "bg-success/15 text-success"
                      : status === "yellow"
                      ? "bg-warning/15 text-warning"
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {status === "green" ? "Normal" : status === "yellow" ? "Warning" : "Critical"}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {sensor.lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
