import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pramana | Chandigarh Police Forensic Evidence Platform",
  description:
    "Chandigarh Police Hackathon'26 (PS4) — investigator console for AI-generated media detection and origin tracing.",
};

// Deliberately no Sidebar/Topbar here — those belong to the authenticated
// shell only (see (app)/layout.tsx). This root layout has to work for
// /login too, which must render with zero case-navigation chrome around it.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-text-primary font-sans">
        <TooltipProvider delay={200}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
