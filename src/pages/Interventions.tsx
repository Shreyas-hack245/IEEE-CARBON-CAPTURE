import { Leaf, DollarSign, TrendingDown, Zap, TreePine, Wind, Building2, Sprout } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const INTERVENTIONS = [
  {
    name: "Biofilter System",
    icon: Sprout,
    cost: "$45,000",
    efficiency: 72,
    reduction: "35 ppm",
    description: "Advanced biological air filtration using engineered microbial colonies.",
  },
  {
    name: "Vertical Gardens",
    icon: TreePine,
    cost: "$28,000",
    efficiency: 58,
    reduction: "22 ppm",
    description: "Living wall installations on high-rise buildings for natural CO₂ absorption.",
  },
  {
    name: "Smart Traffic Management",
    icon: Zap,
    cost: "$120,000",
    efficiency: 85,
    reduction: "48 ppm",
    description: "AI-optimized traffic flow reducing vehicle idle emissions by 40%.",
  },
  {
    name: "Green Roof Installation",
    icon: Leaf,
    cost: "$65,000",
    efficiency: 63,
    reduction: "28 ppm",
    description: "Rooftop vegetation systems providing insulation and carbon capture.",
  },
  {
    name: "Air Purification Towers",
    icon: Wind,
    cost: "$180,000",
    efficiency: 91,
    reduction: "55 ppm",
    description: "Industrial-scale HEPA + activated carbon towers for urban air cleaning.",
  },
];

export default function Interventions() {
  const [simulating, setSimulating] = useState<string | null>(null);
  const [deployed, setDeployed] = useState<Set<string>>(new Set());

  const handleSimulate = (name: string) => {
    setSimulating(name);
    setTimeout(() => {
      setSimulating(null);
      setDeployed((prev) => new Set([...prev, name]));
    }, 2000);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold neon-text flex items-center gap-3">
          <Leaf className="w-7 h-7" /> Carbon Interventions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Recommended actions for urban carbon reduction</p>
      </div>

      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {INTERVENTIONS.map((intv) => {
          const isDeployed = deployed.has(intv.name);
          const isSimulating = simulating === intv.name;

          return (
            <motion.div
              key={intv.name}
              variants={item}
              className={`glass-card-hover p-6 rounded-xl flex flex-col ${isDeployed ? "ring-1 ring-primary/30" : ""}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <intv.icon className="w-5 h-5 text-primary" />
                </div>
                {isDeployed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                    DEPLOYED
                  </span>
                )}
              </div>

              <h3 className="font-display text-sm font-semibold text-foreground mb-2">{intv.name}</h3>
              <p className="text-xs text-muted-foreground mb-4 flex-1">{intv.description}</p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Cost</span>
                  </div>
                  <p className="text-sm font-mono font-bold text-foreground">{intv.cost}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Zap className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Efficiency</span>
                  </div>
                  <p className="text-sm font-mono font-bold text-primary">{intv.efficiency}%</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingDown className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Reduction</span>
                  </div>
                  <p className="text-sm font-mono font-bold text-success">{intv.reduction}</p>
                </div>
              </div>

              {/* Efficiency bar */}
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${intv.efficiency}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-primary"
                />
              </div>

              <button
                onClick={() => handleSimulate(intv.name)}
                disabled={isDeployed || isSimulating}
                className={`w-full py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                  isDeployed
                    ? "bg-primary/10 text-primary cursor-default"
                    : isSimulating
                    ? "bg-primary/20 text-primary animate-pulse"
                    : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground neon-border"
                }`}
              >
                {isDeployed ? "✓ Simulation Complete" : isSimulating ? "Simulating..." : "Simulate Deployment"}
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
