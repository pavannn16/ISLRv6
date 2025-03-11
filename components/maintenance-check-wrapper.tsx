"use client";

import { useEffect, useState } from "react";
import AppMaintenance from "./app-maintenance";

export default function MaintenanceCheckWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    console.log("App Router - Maintenance mode value:", process.env.NEXT_PUBLIC_MAINTENANCE_MODE);
    setIsMaintenanceMode(process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true");
    setIsLoaded(true);
  }, []);

  // Show a minimal loading state before client-side code runs
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (isMaintenanceMode) {
    return <AppMaintenance />;
  }
  
  return <>{children}</>;
}
