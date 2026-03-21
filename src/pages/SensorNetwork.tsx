import { useSensorData, getStatusColor } from "@/hooks/useSensorData";
import { Network, Wifi, AlertTriangle, CheckCircle, Wind, Thermometer, Droplets } from "lucide-react";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } };

export default function SensorNetwork() {
  const { data, avgAQI, criticalCount } = useSensorData();

  // 1. Safety Guard: If data is loading or backend is unreachable
  if (!data || !data.sensors) {
    return (
      <div className="flex flex-col items-center justify-center h-96 glass-card rounded-xl border border-white/5">
        <div className="w-12 h-12 border-4 border-t-primary border-white/10 rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-mono text-sm animate-pulse">SYNCHRONIZING MESH NODES...</p>
      </div>
    );
  }

  const activeCount = data.sensors.length;
  const accuracy = activeCount > 0 
    ? Math.round((data.sensors.filter((s) => s.type === "REAL").length / activeCount) * 100) 
    : 0;

  const netStats = [
    { label: "Active Nodes", value: activeCount, icon: Wifi, color: "text-primary" },
    { label: "Avg AQI", value: avgAQI ?? 0, icon: Wind, color: "text-amber-400" },
    { label: "Network Health", value: `${accuracy}%`, icon: CheckCircle, color: "text-success" },
    { label: "Alerts Active", value: criticalCount ?? 0, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold neon-text flex items-center gap-3">
            <Network className="w-7 h-7" /> Sensor Network
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-mono uppercase tracking-tighter">IoT Mesh Architecture // V4.0.2</p>
        </div>
      </div>

      {/* Network Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {netStats.map((s) => (
          <div key={s.label} className="glass-card p-5 rounded-xl border border-white/5 bg-white/5 relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold font-mono relative z-10 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sensor Mesh Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.sensors.map((sensor) => {
          // 2. Safety Guard: Fallback for values to prevent .toFixed() crashes
          const co2 = sensor.co2 ?? 400;
          const aqi = sensor.aqi ?? 0;
          const temp = sensor.temp ?? 25;
          const hum = sensor.hum ?? 50;
          const status = getStatusColor(co2);
          
          return (
            <motion.div
              key={sensor.id}
              variants={item}
              className={`glass-card-hover p-5 rounded-xl border transition-all duration-300 ${
                sensor.type === "REAL" ? "border-primary/40 bg-primary/5 shadow-[0_0_15px_rgba(0,230,118,0.05)]" : "border-white/10 bg-black/20"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-display text-base font-bold text-foreground leading-tight">{sensor.id}</p>
                  <p className="text-[10px] text-muted-foreground italic">{sensor.zone}</p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter ${
                  sensor.type === "REAL" ? "bg-primary text-black" : "bg-white/10 text-muted-foreground"
                }`}>
                  {sensor.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 pt-2 border-t border-white/5">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold font-mono ${status === "green" ? "text-success" : status === "yellow" ? "text-warning" : "text-destructive"}`}>
                      {co2}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase font-mono">PPM</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wide">Carbon</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-2xl font-bold font-mono text-white/90">{aqi}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase font-mono">AQI</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wide">Air Quality</p>
                </div>
              </div>

              {/* Climate Data with Safety Guards */}
              <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-black/40 border border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-3 h-3 text-amber-500" />
                  <span className="text-xs font-mono text-white/70">
                    {Number(temp).toFixed(1)}°C
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Droplets className="w-3 h-3 text-blue-400" />
                  <span className="text-xs font-mono text-white/70">
                    {Number(hum).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                   <span className={`w-1.5 h-1.5 rounded-full ${status === "green" ? "bg-success" : status === "yellow" ? "bg-warning" : "bg-destructive animate-pulse"}`} />
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${status === "green" ? "text-success" : status === "yellow" ? "text-warning" : "text-destructive"}`}>
                    {status === "green" ? "Safe" : status === "yellow" ? "Elevated" : "Danger"}
                  </span>
                </div>
                <span className="text-[9px] text-muted-foreground/50 font-mono">
                  {sensor.lastUpdate ? sensor.lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}