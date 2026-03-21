import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import { useSensorData, getStatusColor } from "@/hooks/useSensorData";
import { motion } from "framer-motion";
import { Box, Maximize2 } from "lucide-react";
import { useState, useRef, useMemo } from "react";
import * as THREE from "three";

// Safe Building Component: Handles missing data and standard fonts
function Building({ position, height, co2, aqi, label }: { position: [number, number, number]; height: number; co2: number; aqi: number; label: string }) {
  // Use safe fallbacks to prevent crashes
  const safeCO2 = co2 ?? 400;
  const safeAQI = aqi ?? 0;
  const safeHeight = height ?? 2;

  const status = getStatusColor(safeCO2); 
  
  const color = safeAQI <= 50 ? "#00e676" : safeAQI <= 100 ? "#ffca28" : "#ff5252";
  const emissive = safeAQI <= 50 ? "#003d1a" : safeAQI <= 100 ? "#3d3200" : "#3d0000";

  return (
    <group position={position}>
      <mesh position={[0, safeHeight / 2, 0]} castShadow>
        <boxGeometry args={[1.2, safeHeight, 1.2]} />
        <meshStandardMaterial 
          color={color} 
          emissive={emissive} 
          emissiveIntensity={0.8} 
          transparent 
          opacity={0.85} 
        />
      </mesh>
      
      <mesh position={[0, safeHeight / 2, 0]}>
        <boxGeometry args={[1.25, safeHeight + 0.05, 1.25]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.15} />
      </mesh>

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group position={[0, safeHeight + 1.2, 0]}>
          {/* FONT REMOVED: Using standard Three.js font to prevent blank screen crash */}
          <Text fontSize={0.4} color="white" anchorX="center" anchorY="bottom">
            {label || "Node"}
          </Text>
          <Text position={[0, -0.4, 0]} fontSize={0.28} color={color} anchorX="center" anchorY="bottom">
            {safeCO2} PPM
          </Text>
          <Text position={[0, -0.7, 0]} fontSize={0.22} color="#ffffff" opacity={0.6} anchorX="center" anchorY="bottom">
            AQI: {safeAQI}
          </Text>
        </group>
      </Float>
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#050a08" roughness={0.8} metalness={0.2} />
    </mesh>
  );
}

function GridLines() {
  const points = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    for (let i = -20; i <= 20; i += 4) {
      lines.push([new THREE.Vector3(i, 0, -20), new THREE.Vector3(i, 0, 20)]);
      lines.push([new THREE.Vector3(-20, 0, i), new THREE.Vector3(20, 0, i)]);
    }
    return lines;
  }, []);

  return (
    <>
      {points.map((pts, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])), 3]}
              count={2}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00ff88" transparent opacity={0.15} />
        </line>
      ))}
    </>
  );
}

const BUILDING_POSITIONS: [number, number, number][] = [
  [-6, 0, -5], [4, 0, -6], [-3, 0, 4], [7, 0, 3], [0, 0, -1], [-8, 0, 2], [5, 0, 7],
];

export default function DigitalTwin() {
  const { data } = useSensorData();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const sensors = data?.sensors ?? [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold neon-text flex items-center gap-3">
            <Box className="w-7 h-7" /> 3D Urban Digital Twin
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Interactive city model • Live environment mapping</p>
        </div>
        <button 
          onClick={toggleFullscreen} 
          className="glass-card p-2 rounded-lg hover:neon-border transition-all bg-white/5 border border-white/10"
        >
          <Maximize2 className="w-5 h-5 text-primary" />
        </button>
      </div>

      <div className="flex gap-6 flex-wrap glass-card p-4 rounded-xl border border-white/5 bg-black/40">
        {[
          { label: "Healthy (AQI < 50)", cls: "bg-success shadow-[0_0_10px_#10b981]" },
          { label: "Moderate (AQI 51-100)", cls: "bg-warning shadow-[0_0_10px_#f59e0b]" },
          { label: "Polluted (AQI > 100)", cls: "bg-destructive shadow-[0_0_10px_#ef4444]" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            <span className={`w-3 h-3 rounded-full ${l.cls}`} />
            {l.label}
          </div>
        ))}
      </div>

      <div ref={containerRef} className="glass-card rounded-2xl overflow-hidden border border-white/10 relative" style={{ height: isFullscreen ? "100vh" : "600px" }}>
        <Canvas camera={{ position: [18, 15, 18], fov: 40 }} shadows>
          <color attach="background" args={["#050a08"]} />
          <ambientLight intensity={0.3} />
          <directionalLight position={[15, 25, 15]} intensity={1.2} castShadow />
          <pointLight position={[0, 15, 0]} intensity={0.8} color="#00ff88" />
          <fog attach="fog" args={["#050a08", 12, 45]} />

          <Ground />
          <GridLines />

          {sensors.map((sensor, i) => (
            <Building
              key={sensor.id}
              position={BUILDING_POSITIONS[i] || [0, 0, 0]}
              height={2 + ((sensor.aqi ?? 0) / 10)} 
              co2={sensor.co2 ?? 400}
              aqi={sensor.aqi ?? 0}
              label={sensor.id}
            />
          ))}

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={10}
            maxDistance={35}
            autoRotate={!isFullscreen}
            autoRotateSpeed={0.4}
          />
        </Canvas>
        
        <div className="absolute bottom-6 right-6 text-[10px] text-primary/30 font-mono pointer-events-none tracking-widest">
          NODE_PROTOCOL_V4 // URBAN_METRIC_ENGINE
        </div>
      </div>
    </motion.div>
  );
}