import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Maintenance from './maintenance';

// If maintenance mode is true, this ensures even the homepage shows maintenance
export default function Home(props: any) {
  const router = useRouter();
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  useEffect(() => {
    if (isMaintenanceMode) {
      // Force maintenance page
      router.replace('/maintenance');
    }
  }, [isMaintenanceMode, router]);

  if (isMaintenanceMode) {
    return <Maintenance />;
  }
  
  // Return your actual homepage component
  // This assumes you have a component for your homepage
  return props.children || <>Your regular homepage content</>;
}

// Add this to ensure we check maintenance mode on server-side
export async function getServerSideProps() {
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  
  if (isMaintenanceMode) {
    return {
      props: { maintenance: true }
    };
  }
  
  return { props: {} };
}
