import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scheduly",
  description: "Schedule meetings easily",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}