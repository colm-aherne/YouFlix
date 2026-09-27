import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NetTube Cinema - Netflix for YouTube',
  description: 'A Netflix-style YouTube streaming cinema with cross-device synchronized category playlists, continue watching progress, custom playlists, and multi-profile sync.',
  openGraph: {
    title: 'NetTube Cinema - Netflix for YouTube',
    description: 'A Netflix-style YouTube streaming cinema with cross-device synchronized category playlists, continue watching progress, custom playlists, and multi-profile sync.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NetTube Cinema - Netflix for YouTube',
    description: 'A Netflix-style YouTube streaming cinema with cross-device synchronized category playlists, continue watching progress, custom playlists, and multi-profile sync.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-neutral-950">
      <body className="bg-neutral-950 text-neutral-100 antialiased min-h-screen selection:bg-red-600 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
