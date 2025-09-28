import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brand Visibility Analyzer",
  description: "Analyze transcripts to understand provider visibility"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
