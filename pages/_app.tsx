import { AppProps } from "next/app";
import Maintenance from "./maintenance";
import "../styles/globals.css";
import { inter } from '@/lib/fonts';
import '@/styles/globals.css';
import { DayPickerProvider } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

// Check if the app is in maintenance mode based on environment variable
function MyApp({ Component, pageProps }: AppProps) {
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  
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
