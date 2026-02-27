import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useSensorData, getStatusColor } from "@/hooks/useSensorData";
import { motion } from "framer-motion";
import { Box, Maximize2 } from "lucide-react";
import { useState, useRef, useMemo } from "react";
import * as THREE from "three";

function Building({ position, height, co2, label }: { position: [number, number, number]; height: number; co2: number; label: string }) {
  const status = getStatusColor(co2);
  const color = status === "green" ? "#00e676" : status === "yellow" ? "#ffca28" : "#ff5252";
  const emissive = status === "green" ? "#003d1a" : status === "yellow" ? "#3d3200" : "#3d0000";

  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[1.2, height, 1.2]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.4} transparent opacity={0.85} />
      </mesh>
      {/* Wireframe overlay */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[1.22, height + 0.02, 1.22]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
      </mesh>
      <Text position={[0, height + 0.5, 0]} fontSize={0.3} color={color} anchorX="center" anchorY="bottom">
        {label}
      </Text>
      <Text position={[0, height + 0.15, 0]} fontSize={0.2} color="#aaa" anchorX="center" anchorY="bottom">
        {co2} ppm
      </Text>
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#0a1a12" />
    </mesh>
  );
}

function GridLines() {
  const points = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    for (let i = -15; i <= 15; i += 3) {
      lines.push([new THREE.Vector3(i, 0, -15), new THREE.Vector3(i, 0, 15)]);
      lines.push([new THREE.Vector3(-15, 0, i), new THREE.Vector3(15, 0, i)]);
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
          <lineBasicMaterial color="#1a3a2a" transparent opacity={0.4} />
        </line>
      ))}
    </>
  );
}

const BUILDING_POSITIONS: [number, number, number][] = [
  [-4, 0, -3],
  [3, 0, -4],
  [-2, 0, 3],
  [5, 0, 2],
  [0, 0, -1],
  [-5, 0, -6],
  [4, 0, 6],
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
          <p className="text-sm text-muted-foreground mt-1">Interactive city model — CO₂ zone visualization</p>
        </div>
        <button onClick={toggleFullscreen} className="glass-card p-2 rounded-lg hover:neon-border transition-all">
          <Maximize2 className="w-4 h-4 text-primary" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: "Clean (<420)", cls: "bg-success" },
          { label: "Moderate (420-480)", cls: "bg-warning" },
          { label: "Polluted (>480)", cls: "bg-destructive" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`w-3 h-3 rounded-sm ${l.cls}`} />
            {l.label}
          </div>
        ))}
      </div>

      <div ref={containerRef} className="glass-card rounded-xl overflow-hidden" style={{ height: isFullscreen ? "100vh" : "500px" }}>
        <Canvas camera={{ position: [12, 10, 12], fov: 50 }} shadows>
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 15, 10]} intensity={0.6} castShadow />
          <pointLight position={[0, 8, 0]} intensity={0.4} color="#00e676" />
          <fog attach="fog" args={["#050f0a", 15, 35]} />

          <Ground />
          <GridLines />

          {sensors.map((sensor, i) => (
            <Building
              key={sensor.id}
              position={BUILDING_POSITIONS[i] || [0, 0, 0]}
              height={1.5 + (sensor.co2 - 350) / 50}
              co2={sensor.co2}
              label={sensor.id}
            />
          ))}

          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            maxPolarAngle={Math.PI / 2.2}
            minDistance={5}
            maxDistance={25}
          />
        </Canvas>
      </div>
    </motion.div>
  );
}
