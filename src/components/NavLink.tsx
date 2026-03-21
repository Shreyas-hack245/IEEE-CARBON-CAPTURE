import { LayoutDashboard, Network, Box, Wind, Zap, Map } from "lucide-react";

export const navigation = [
  { 
    name: "Mission Control", 
    to: "/", 
    icon: LayoutDashboard 
  },
  { 
    name: "Sensor Network", 
    to: "/network", 
    icon: Network 
  },
  { 
    name: "Urban Digital Twin", 
    to: "/twin", 
    icon: Box 
  },
  { 
    name: "Emission Analysis", 
    to: "/analysis", 
    icon: Wind 
  },
  {
    name: "Emission Hotspots",
    to: "/hotspots",
    icon: Map
  },
  { 
    name: "Interventions", 
    to: "/interventions", 
    icon: Zap 
  },
];