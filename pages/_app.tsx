import type { AppProps } from 'next/app';
import { inter } from '@/lib/fonts';
import '@/styles/globals.css';
import { DayPickerProvider } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DayPickerProvider initialProps={{ mode: 'single' }}>
      <Component {...pageProps} />
    </DayPickerProvider>
  );
}

export default MyApp;
