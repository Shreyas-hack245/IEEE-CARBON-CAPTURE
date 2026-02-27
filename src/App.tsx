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
import Interventions from "@/pages/Interventions";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sensors" element={<SensorNetwork />} />
            <Route path="/digital-twin" element={<DigitalTwin />} />
            <Route path="/emissions" element={<EmissionAnalysis />} />
            <Route path="/interventions" element={<Interventions />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
