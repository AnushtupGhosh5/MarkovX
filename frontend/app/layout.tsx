import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MusePilot",
  description: "AI-powered music generation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
