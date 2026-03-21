import { useSensorData } from "@/hooks/useSensorData";
import { BarChart3, Brain, Factory, Car, Home, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const EMISSION_SOURCES = [
  { name: "Traffic", value: 42, icon: Car, color: "#00ff88" },
  { name: "Industrial", value: 31, icon: Factory, color: "hsl(45, 100%, 55%)" },
  { name: "Residential", value: 27, icon: Home, color: "hsl(0, 85%, 60%)" },
];

export default function EmissionAnalysis() {
  const { avgCO2 } = useSensorData();

  const predictions = [
    { label: "Next Hour", value: Math.round(avgCO2 + (Math.random() - 0.3) * 15), hours: 1 },
    { label: "6 Hours", value: Math.round(avgCO2 + (Math.random() - 0.4) * 30), hours: 6 },
    { label: "12 Hours", value: Math.round(avgCO2 + (Math.random() - 0.5) * 40), hours: 12 },
    { label: "24 Hours", value: Math.round(avgCO2 + (Math.random() - 0.5) * 50), hours: 24 },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="font-sans text-3xl lg:text-4xl font-black tracking-tighter flex items-center gap-3 uppercase text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">
          <BarChart3 className="w-8 h-8" /> Emission Analysis
        </h1>
        <p className="text-sm font-medium text-muted-foreground/80 tracking-tight">
          Interactive city model • Live environment mapping
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart Card */}
        <motion.div variants={item} className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/5 bg-[#0a0f0d]/60 backdrop-blur-xl">
          <h2 className="text-[11px] font-black tracking-[0.2em] uppercase text-muted-foreground/60 mb-6">Emission Sources</h2>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={EMISSION_SOURCES} 
                  cx="50%" cy="50%" 
                  innerRadius={75} 
                  outerRadius={95} 
                  paddingAngle={5}
                  dataKey="value" 
                  stroke="none"
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  {EMISSION_SOURCES.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    background: "#161b19", // Solid high-contrast background
                    border: "1px solid rgba(0, 255, 136, 0.2)",
                    borderRadius: "12px",
                    padding: "8px 12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                  }}
                  itemStyle={{
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}
                  labelStyle={{ display: "none" }} // Hides the default label for a cleaner look
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{avgCO2}</span>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">PPM</span>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            {EMISSION_SOURCES.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}66` }} />
                {s.name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Breakdown Card */}
        <motion.div variants={item} className="lg:col-span-5 glass-card p-6 rounded-2xl border border-white/5 bg-[#0a0f0d]/60">
          <h2 className="text-[11px] font-black tracking-[0.2em] uppercase text-muted-foreground/60 mb-6">Contribution Breakdown</h2>
          <div className="space-y-6">
            {EMISSION_SOURCES.map((src) => (
              <div key={src.name} className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <src.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-black tracking-tighter uppercase text-foreground/90">{src.name}</span>
                  </div>
                  <span className="text-sm font-black tracking-tighter" style={{ color: src.color }}>{src.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${src.value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: src.color, boxShadow: `0 0 10px ${src.color}44` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Predictions */}
      <div className="space-y-4">
        <h2 className="text-[11px] font-black tracking-[0.3em] uppercase text-[#00ff88]/70 flex items-center gap-2">
          <Brain className="w-4 h-4" /> AI CO₂ Predictions
        </h2>
        <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {predictions.map((p) => {
            const statusColor = p.value < 420 ? "text-[#00ff88]" : p.value <= 480 ? "text-amber-400" : "text-rose-500";
            return (
              <motion.div 
                key={p.label} 
                variants={item} 
                whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.02)" }}
                className="glass-card p-5 rounded-2xl border border-white/5 bg-[#0a0f0d]/40 text-center transition-colors"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">{p.label}</p>
                <p className={`text-4xl font-black tracking-tighter ${statusColor} drop-shadow-[0_0_8px_rgba(0,255,136,0.2)]`}>
                  {p.value}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">ppm CO₂</p>
                <div className="flex items-center justify-center gap-1 mt-4 pt-4 border-t border-white/5">
                  <TrendingUp className="w-3 h-3 text-muted-foreground/40" />
                  <span className="text-[10px] font-black tracking-tighter text-muted-foreground/40 uppercase">+{p.hours}h Forecast</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}