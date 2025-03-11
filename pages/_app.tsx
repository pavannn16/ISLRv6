import { AppProps } from "next/app";
import Maintenance from "./maintenance";
import "../styles/globals.css";
import { inter } from '@/lib/fonts';
import '@/styles/globals.css';
import { DayPickerProvider } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useEffect, useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  // Server-side initial check
  const initialMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  
  // Use state for client-side rendering with initial server value
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(initialMaintenanceMode);
  
  // Recheck on client-side to ensure consistency
  useEffect(() => {
    console.log("Maintenance mode value:", process.env.NEXT_PUBLIC_MAINTENANCE_MODE);
    setIsMaintenanceMode(process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true");
    
    // Force all navigation to maintenance page if mode is active
    if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") {
      // Don't allow route changes when in maintenance mode
      const preventRouteChange = () => {
        window.location.href = "/maintenance";
        return false;
      };
      
      // Clean up event listener
      return () => {
        // Clean up if needed
      };
    }
  }, []);
  
  // Always show maintenance page when in maintenance mode, regardless of route
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

// Add getInitialProps to handle server-side rendering correctly
MyApp.getInitialProps = async ({ Component, ctx }: any) => {
  let pageProps = {};
  
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }
  
  return { pageProps };
};

export default MyApp;
