import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import SensorNetwork from "@/pages/SensorNetwork";
import DigitalTwin from "@/pages/DigitalTwin";
import EmissionAnalysis from "@/pages/EmissionAnalysis";
import EmissionHotspots from "@/pages/EmissionHotspots"; // Added this import
import Interventions from "@/pages/Interventions";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Global Notifications */}
      <Toaster />
      <Sonner position="top-right" closeButton />
      
      <BrowserRouter>
        <Routes>
          {/* Main Application Shell */}
          <Route element={<Layout />}>
            {/* 1. Mission Control (Home) */}
            <Route path="/" element={<Dashboard />} />
            
            {/* 2. IoT Mesh Management (Path: /network) */}
            <Route path="/network" element={<SensorNetwork />} /> 
            
            {/* 3. Urban Digital Twin (Path: /twin) */}
            <Route path="/twin" element={<DigitalTwin />} />
            
            {/* 4. Analytics & AQI Trends (Path: /analysis) */}
            <Route path="/analysis" element={<EmissionAnalysis />} />

            {/* 5. Spatial Heatmap (Path: /hotspots) */}
            <Route path="/hotspots" element={<EmissionHotspots />} /> 
            
            {/* 6. Actionable Insights & Interventions */}
            <Route path="/interventions" element={<Interventions />} />
          </Route>
          
          {/* Global Fallback for 404s */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;