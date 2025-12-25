import './globals.css'

export const metadata = {
  title: 'Boobs Trap',
  description: 'Anti-Productivity Turing Test',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}