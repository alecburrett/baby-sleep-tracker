import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baby Sleep Tracker",
  description: "AI-powered baby sleep tracking app with personalized insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
