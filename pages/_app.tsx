import { AppProps } from "next/app";
import Maintenance from "./maintenance";
import "../styles/globals.css";
import { inter } from '@/lib/fonts';
import '@/styles/globals.css';
import { DayPickerProvider } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useEffect, useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  // Use state for client-side rendering compatibility
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  
  // Check maintenance mode after component mounts to ensure client-side value is used
  useEffect(() => {
    // Log for debugging
    console.log("Maintenance mode value:", process.env.NEXT_PUBLIC_MAINTENANCE_MODE);
    setIsMaintenanceMode(process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true");
  }, []);
  
  // If maintenance mode is active, show maintenance page
  if (isMaintenanceMode) {
    return <Maintenance />;
  }
  
  // Otherwise, render the app normally
  return (
    <DayPickerProvider initialProps={{ mode: 'single' }}>
      <Component {...pageProps} />
    </DayPickerProvider>
  );
}

export default MyApp;
