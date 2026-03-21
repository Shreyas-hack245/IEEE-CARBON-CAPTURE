import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Radio, Activity, Wind, Crosshair, Cpu } from 'lucide-react';

const SENSOR_DATA = [
  { id: "NODE_01", x: 30, y: 40, label: "Industrial Sector Alpha", value: 614, aqi: 185, status: 'critical' },
  { id: "NODE_02", x: 65, y: 30, label: "Highway Interchange 04", value: 574, aqi: 142, status: 'warning' },
  { id: "NODE_03", x: 45, y: 75, label: "Residential Cluster B", value: 397, aqi: 45, status: 'stable' },
  { id: "NODE_04", x: 82, y: 65, label: "Logistics Hub", value: 516, aqi: 110, status: 'warning' },
];

export default function EmissionHotspots() {
  const [viewMode, setViewMode] = useState('heatmap');
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewMode !== 'heatmap') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'screen';
      SENSOR_DATA.forEach(point => {
        const screenX = (point.x / 100) * canvas.width;
        const screenY = (point.y / 100) * canvas.height;
        const intensity = Math.min((point.value - 300) / 400, 1);
        const radius = 220 * intensity;
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
        if (point.value > 600) {
          gradient.addColorStop(0, 'rgba(255, 30, 60, 0.6)');
          gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.1)');
          gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(0, 255, 136, 0.25)');
          gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        }
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(screenX, screenY, radius, 0, Math.PI * 2); ctx.fill();
      });
    };
    draw();
  }, [viewMode]);

  return (
    <div className="space-y-6 p-2 md:p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white neon-text">
            Hotspot <span className="text-[#00ff88]">Matrix</span>
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] mt-2 opacity-60">
            {viewMode === 'heatmap' ? 'Atmospheric Dispersion Model' : 'Logical Sensor Mesh Topology'}
          </p>
        </div>

        <div className="flex p-1 bg-black/60 border border-white/10 rounded-xl backdrop-blur-xl">
          <button onClick={() => setViewMode('heatmap')} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'heatmap' ? 'bg-[#00ff88] text-black' : 'text-muted-foreground'}`}>
            <Layers className="w-3.5 h-3.5" /> Heatmap
          </button>
          <button onClick={() => setViewMode('raw')} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'raw' ? 'bg-[#00ff88] text-black' : 'text-muted-foreground'}`}>
            <Cpu className="w-3.5 h-3.5" /> Raw Mesh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className={`lg:col-span-3 relative aspect-video glass-card overflow-hidden transition-all duration-700 ${viewMode === 'raw' ? 'bg-black' : 'bg-[#050807]'}`}>
          
          <AnimatePresence mode="wait">
            {viewMode === 'heatmap' ? (
              <motion.div key="h-bg" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }} className="absolute inset-0">
                <svg width="100%" height="100%"><pattern id="topo" width="150" height="150" patternUnits="userSpaceOnUse"><path d="M0 75 Q 75 0 150 75" fill="none" stroke="#00ff88" strokeWidth="0.5"/></pattern><rect width="100%" height="100%" fill="url(#topo)" /></svg>
              </motion.div>
            ) : (
              <motion.div key="r-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                <div className="absolute inset-0 opacity-20 grid-bg" />
                <svg width="100%" height="100%" className="opacity-30">
                  <defs>
                    <pattern id="mesh-lines" width="100" height="100" patternUnits="userSpaceOnUse">
                      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#00ff88" strokeWidth="1"/>
                      <circle cx="0" cy="0" r="2" fill="#00ff88"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#mesh-lines)" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {viewMode === 'heatmap' ? (
            <canvas ref={canvasRef} width={1200} height={675} className="absolute inset-0 w-full h-full z-10" />
          ) : (
            <svg className="absolute inset-0 w-full h-full z-10 opacity-40">
              {SENSOR_DATA.map((s, i) => i < SENSOR_DATA.length - 1 && (
                <line key={i} x1={`${s.x}%`} y1={`${s.y}%`} x2={`${SENSOR_DATA[i+1].x}%`} y2={`${SENSOR_DATA[i+1].y}%`} stroke="#00ff88" strokeWidth="1" strokeDasharray="5,5" />
              ))}
            </svg>
          )}

          <div className="absolute inset-0 z-20">
            {SENSOR_DATA.map((s) => (
              <div key={s.id} onMouseEnter={() => setHoveredPoint(s)} onMouseLeave={() => setHoveredPoint(null)} style={{ left: `${s.x}%`, top: `${s.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 p-4 group cursor-crosshair">
                {viewMode === 'heatmap' ? (
                  <div className={`w-2 h-2 rounded-full ${s.status === 'critical' ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-[#00ff88] shadow-[0_0_10px_#00ff88]'}`} />
                ) : (
                  <div className="relative flex items-center justify-center">
                    <div className="w-8 h-8 border border-[#00ff88]/50 rotate-45 animate-[spin_10s_linear_infinite]" />
                    <div className="absolute w-1 h-1 bg-[#00ff88]" />
                    <div className="absolute top-6 left-6 font-mono text-[7px] text-[#00ff88] bg-black/80 px-1 border border-[#00ff88]/20">
                      ID:{s.id} <br/> X:{s.x} Y:{s.y}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <AnimatePresence>
            {hoveredPoint && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.y - 12}%` }} className="absolute z-50 -translate-x-1/2 pointer-events-none">
                <div className={`glass-card p-4 min-w-[180px] border-l-4 ${hoveredPoint.status === 'critical' ? 'border-l-red-500' : 'border-l-[#00ff88]'}`}>
                  <p className="text-[8px] font-black text-white/50 uppercase mb-2">{hoveredPoint.label}</p>
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-black font-mono text-white">{hoveredPoint.value}<span className="text-[9px] ml-1 opacity-40">PPM</span></span>
                    <span className={`text-[10px] font-mono ${hoveredPoint.aqi > 150 ? 'text-red-500' : 'text-[#00ff88]'}`}>AQI {hoveredPoint.aqi}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-6 border-[#00ff88]/10">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00ff88] mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> {viewMode === 'raw' ? 'Packet Stream' : 'Live Plumes'}
            </h3>
            <div className="space-y-3">
              {SENSOR_DATA.map(s => (
                <div key={s.id} className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[9px] font-bold text-white/60 truncate max-w-[100px]">{s.label}</span>
                  <div className="text-right font-mono">
                    <span className={`text-[11px] font-black ${s.status === 'critical' ? 'text-red-500' : 'text-white'}`}>{s.value}</span>
                    <span className="text-[8px] text-[#00ff88]/50 ml-2">DATA_OK</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}