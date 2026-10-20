import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlaceMate — Campus Placement Management Platform",
  description: "Enterprise campus placement portal with eligibility engine, multi-role access control, and automated DevOps CI/CD."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
