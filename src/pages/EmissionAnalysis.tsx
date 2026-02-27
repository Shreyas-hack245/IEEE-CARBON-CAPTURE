import { useSensorData } from "@/hooks/useSensorData";
import { BarChart3, Brain, Factory, Car, Home, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const EMISSION_SOURCES = [
  { name: "Traffic", value: 42, icon: Car, color: "hsl(0, 85%, 55%)" },
  { name: "Industrial", value: 31, icon: Factory, color: "hsl(45, 100%, 55%)" },
  { name: "Residential", value: 27, icon: Home, color: "hsl(155, 100%, 45%)" },
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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold neon-text flex items-center gap-3">
          <BarChart3 className="w-7 h-7" /> Emission Analysis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Source breakdown & AI-powered forecasting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div variants={item} className="glass-card p-6 rounded-xl">
          <h2 className="font-display text-sm font-semibold text-foreground mb-4">Emission Sources</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={EMISSION_SOURCES} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                  {EMISSION_SOURCES.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(160, 20%, 7%)",
                    border: "1px solid hsl(160, 15%, 20%)",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {EMISSION_SOURCES.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
                {s.name} ({s.value}%)
              </div>
            ))}
          </div>
        </motion.div>

        {/* Source Breakdown */}
        <motion.div variants={item} className="glass-card p-6 rounded-xl space-y-4">
          <h2 className="font-display text-sm font-semibold text-foreground">Contribution Breakdown</h2>
          {EMISSION_SOURCES.map((src) => (
            <div key={src.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <src.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{src.name}</span>
                </div>
                <span className="text-sm font-mono font-bold" style={{ color: src.color }}>{src.value}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${src.value}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: src.color }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* AI Predictions */}
      <div>
        <h2 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-accent" /> AI CO₂ Predictions
        </h2>
        <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {predictions.map((p) => {
            const status = p.value < 420 ? "status-green" : p.value <= 480 ? "status-yellow" : "status-red";
            return (
              <motion.div key={p.label} variants={item} className="glass-card-hover p-5 rounded-xl text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{p.label}</p>
                <p className={`text-3xl font-bold font-mono ${status}`}>{p.value}</p>
                <p className="text-xs text-muted-foreground mt-1">ppm CO₂</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">+{p.hours}h forecast</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}
