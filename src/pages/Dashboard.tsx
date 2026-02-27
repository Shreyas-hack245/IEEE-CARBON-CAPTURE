import { useSensorData, getStatusColor } from "@/hooks/useSensorData";
import { Activity, AlertTriangle, Gauge, Radio, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { data, history, alerts, avgCO2, warningCount, criticalCount } = useSensorData();

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-xl animate-pulse h-28" />
        ))}
      </div>
    );
  }

  const statCards = [
    { label: "Total Sensors", value: data.sensors.length, icon: Radio, accent: "text-primary" },
    { label: "Avg CO₂ Level", value: `${avgCO2} ppm`, icon: Gauge, accent: avgCO2 > 480 ? "text-destructive" : avgCO2 > 420 ? "text-warning" : "text-success" },
    { label: "Warnings", value: warningCount, icon: TrendingUp, accent: "text-warning" },
    { label: "Critical Alerts", value: criticalCount, icon: AlertTriangle, accent: criticalCount > 0 ? "text-destructive" : "text-success" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Alert Banner */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pulse-alert rounded-xl border border-destructive/50 bg-destructive/10 p-4"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-destructive">⚠ AIR QUALITY ALERT</p>
                <p className="text-xs text-destructive/80 mt-1">{alerts.join(" | ")}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold neon-text">Mission Control</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time urban carbon monitoring • Auto-refresh 5s</p>
      </div>

      {/* Stats */}
      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <motion.div key={s.label} variants={item} className="glass-card-hover p-5 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.accent}`} />
            </div>
            <p className={`text-2xl font-bold font-mono ${s.accent}`}>{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CO2 Trend Chart */}
      <motion.div variants={item} className="glass-card p-6 rounded-xl">
        <h2 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> CO₂ Trend — Live
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(155, 100%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(155, 100%, 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="s1Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(180, 100%, 50%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(180, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(160, 15%, 20%, 0.5)" />
              <XAxis dataKey="time" tick={{ fill: "hsl(155,10%,55%)", fontSize: 10 }} />
              <YAxis domain={[340, 530]} tick={{ fill: "hsl(155,10%,55%)", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(160, 20%, 7%)",
                  border: "1px solid hsl(160, 15%, 20%)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                labelStyle={{ color: "hsl(155, 20%, 90%)" }}
              />
              <Area type="monotone" dataKey="avg" stroke="hsl(155, 100%, 45%)" fill="url(#avgGrad)" strokeWidth={2} name="Average" />
              <Area type="monotone" dataKey="s1" stroke="hsl(180, 100%, 50%)" fill="url(#s1Grad)" strokeWidth={1} name="Sensor 1 (REAL)" />
              <Area type="monotone" dataKey="s2" stroke="hsl(45, 100%, 55%)" fill="none" strokeWidth={1} strokeDasharray="4 4" name="Sensor 2 (REAL)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Sensor Cards */}
      <div>
        <h2 className="font-display text-sm font-semibold text-foreground mb-4">Live Sensor Readings</h2>
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.sensors.map((sensor) => {
            const status = getStatusColor(sensor.co2);
            const borderClass =
              status === "red" ? "border-destructive/50 pulse-alert" : status === "yellow" ? "border-warning/30" : "border-border";
            return (
              <motion.div
                key={sensor.id}
                variants={item}
                className={`glass-card-hover p-5 rounded-xl border ${borderClass} ${sensor.type === "REAL" ? "ring-1 ring-primary/20" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-foreground">{sensor.id}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wider ${
                        sensor.type === "REAL" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {sensor.type}
                    </span>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${status === "green" ? "bg-success" : status === "yellow" ? "bg-warning" : "bg-destructive"} ${status === "red" ? "animate-pulse" : ""}`} />
                </div>
                <p className={`text-3xl font-bold font-mono ${status === "green" ? "status-green" : status === "yellow" ? "status-yellow" : "status-red"}`}>
                  {sensor.co2}
                </p>
                <p className="text-xs text-muted-foreground mt-1">ppm CO₂</p>
                <p className="text-xs text-muted-foreground mt-2">{sensor.zone}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}
