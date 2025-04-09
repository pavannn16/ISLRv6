import localFont from '@next/font/local'

export const systemFont = localFont({
  src: [
    {
      path: '../public/fonts/inter-var.woff2',
      style: 'normal',
    }
  ],
  variable: '--font-system',
})
