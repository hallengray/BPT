import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'Blood Pressure Tracker',
    template: '%s | Blood Pressure Tracker',
  },
  description:
    'Track your blood pressure, diet, and exercise to maintain a healthy lifestyle.',
  keywords: ['blood pressure', 'health', 'tracking', 'diet', 'exercise', 'wellness'],
  authors: [{ name: 'Blood Pressure Tracker Team' }],
  creator: 'Blood Pressure Tracker',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bpt.example.com',
    title: 'Blood Pressure Tracker',
    description: 'Track your blood pressure, diet, and exercise to maintain a healthy lifestyle.',
    siteName: 'Blood Pressure Tracker',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blood Pressure Tracker',
    description: 'Track your blood pressure, diet, and exercise to maintain a healthy lifestyle.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
