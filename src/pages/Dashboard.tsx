import { useSensorData, getStatusColor } from "@/hooks/useSensorData";
import { Activity, AlertTriangle, Gauge, Radio, TrendingUp, Thermometer, Droplets, Wind } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { data, history, alerts, avgCO2, avgAQI } = useSensorData();

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-xl animate-pulse h-28 bg-white/5" />
        ))}
      </div>
    );
  }

  const statCards = [
    { label: "Avg CO₂ Level", value: `${avgCO2} ppm`, icon: Gauge, accent: avgCO2 > 480 ? "text-destructive" : avgCO2 > 420 ? "text-warning" : "text-success" },
    { label: "Current AQI", value: avgAQI, icon: Wind, accent: avgAQI > 150 ? "text-destructive" : avgAQI > 100 ? "text-warning" : "text-amber-400" },
    { label: "Current Temp", value: `${(data.temp ?? 25).toFixed(1)}°C`, icon: Thermometer, accent: "text-orange-400" },
    { label: "Humidity", value: `${(data.hum ?? 50).toFixed(0)}%`, icon: Droplets, accent: "text-blue-400" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 p-6">
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
                <p className="text-sm font-semibold text-destructive uppercase tracking-widest">⚠ Air Quality Alert</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  {alerts.slice(0, 3).map((alert, idx) => (
                    <p key={idx} className="text-[11px] text-destructive/80 font-mono">{alert}</p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold neon-text">Mission Control</h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-tighter opacity-70">Urban Analytics Interface // Terminal v4.0.2</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] text-primary/50 font-mono tracking-widest uppercase">System Status: Nominal</p>
          <p className="text-[10px] text-muted-foreground font-mono">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <motion.div key={s.label} variants={item} className="glass-card-hover p-5 rounded-xl border border-white/5 bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.accent}`} />
            </div>
            <p className={`text-2xl font-bold font-mono ${s.accent}`}>{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. CO2 Tracking - UPDATED TO AREA CHART (Matches Target Look) */}
        <motion.div variants={item} className="glass-card p-6 rounded-xl border border-white/10 bg-black/20 col-span-1 lg:col-span-1">
          <h2 className="font-display text-xs font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-widest">
            <Activity className="w-4 h-4 text-primary" /> CO₂ Trend — Live
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorS1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e676" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00e676" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorS2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00bcd4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(160, 15%, 20%, 0.1)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  interval={12} 
                  tick={{ fill: "gray", fontSize: 10 }} 
                  dy={10}
                />
                <YAxis domain={[340, 530]} tick={{ fill: "gray", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#050a08", border: "1px solid #1a1a1a", borderRadius: "8px", fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                
                <Area 
                  type="monotone" 
                  dataKey="s1" 
                  stroke="#00e676" 
                  fill="url(#colorS1)" 
                  strokeWidth={2} 
                  name="S1 (ESP32)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="s2" 
                  stroke="#00bcd4" 
                  fill="url(#colorS2)" 
                  strokeWidth={2} 
                  name="S2 (SIM)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 2. Regional AQI Index */}
        <motion.div variants={item} className="glass-card p-6 rounded-xl border border-white/10 bg-black/20">
          <h2 className="font-display text-xs font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-widest">
            <TrendingUp className="w-4 h-4 text-amber-400" /> Regional AQI Index
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(160, 15%, 20%, 0.1)" vertical={false} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} interval={12} tick={{ fill: "gray", fontSize: 10 }} dy={10} />
                <YAxis domain={[0, 300]} tick={{ fill: "gray", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#050a08", border: "1px solid #1a1a1a", borderRadius: "8px", fontSize: '12px' }} />
                <Area type="monotone" dataKey="aqi" stroke="#fbbf24" fill="url(#aqiGrad)" strokeWidth={2} name="Avg AQI" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 3. Climate Metrics */}
        <motion.div variants={item} className="glass-card p-6 rounded-xl border border-white/10 bg-black/20">
          <h2 className="font-display text-xs font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-widest">
            <Thermometer className="w-4 h-4 text-orange-400" /> Climate Metrics
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(160, 15%, 20%, 0.1)" vertical={false} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} interval={12} tick={{ fill: "gray", fontSize: 10 }} dy={10} />
                <YAxis yAxisId="left" domain={[10, 50]} tick={{ fill: "#fb923c", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: "#60a5fa", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#050a08", border: "1px solid #1a1a1a", borderRadius: "8px", fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                
                <Area yAxisId="left" type="monotone" dataKey="temp" stroke="#fb923c" fill="url(#tempGrad)" strokeWidth={2} name="Temp (°C)" />
                <Area yAxisId="right" type="monotone" dataKey="hum" stroke="#60a5fa" fill="url(#humGrad)" strokeWidth={2} name="Hum (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Sensor Mesh Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" /> Active Mesh Nodes
          </h2>
          <span className="text-[10px] text-muted-foreground font-mono">Nodes Online: {data.sensors.length}</span>
        </div>
        
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.sensors.map((sensor) => {
            const status = getStatusColor(sensor.co2);
            const isCritical = status === "red";
            
            return (
              <motion.div
                key={sensor.id}
                variants={item}
                className={`glass-card-hover p-5 rounded-xl border transition-all duration-300 ${
                  isCritical ? "border-destructive/40 bg-destructive/5" : "border-white/5 bg-white/5"
                } ${sensor.type === "REAL" ? "ring-1 ring-primary/20" : ""}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-foreground tracking-tight">{sensor.id}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-tighter uppercase ${
                      sensor.type === "REAL" ? "bg-primary text-black" : "bg-white/10 text-muted-foreground"
                    }`}>
                      {sensor.type}
                    </span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    status === "green" ? "bg-success shadow-[0_0_8px_#10b981]" : 
                    status === "yellow" ? "bg-warning shadow-[0_0_8px_#fbbf24]" : 
                    "bg-destructive shadow-[0_0_8px_#ef4444] animate-pulse"
                  }`} />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className={`text-2xl font-bold font-mono tracking-tighter ${
                      status === "green" ? "text-success" : status === "yellow" ? "text-warning" : "text-destructive"
                    }`}>
                      {sensor.co2}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">PPM CO₂</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white/90 font-mono">{sensor.aqi}</p>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">AQI</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-mono">
                  <div className="flex items-center gap-2 text-orange-400/80">
                    <Thermometer className="w-3 h-3" />
                    <span>{(sensor.temp ?? 25).toFixed(1)}°</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400/80">
                    <Droplets className="w-3 h-3" />
                    <span>{(sensor.hum ?? 50).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="mt-2 text-[9px] text-muted-foreground/40 italic flex justify-between uppercase">
                  <span>{sensor.zone}</span>
                  <span>{sensor.type === "REAL" ? "Live Feed" : "Simulated"}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}