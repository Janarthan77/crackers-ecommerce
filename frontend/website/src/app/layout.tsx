import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlobalEffects from "@/components/GlobalEffects";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RRV Crackers — Biggest Diwali Sale",
  description: "Buy premium quality RRV Crackers and fireworks at the best prices. Shop sparklers, rockets, flower pots and more — with fast delivery.",
  keywords: ["RRV Crackers", "buy crackers online", "diwali fireworks", "wholesale crackers sivakasi"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" style={{ background: "var(--bg-page)" }} suppressHydrationWarning>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        <Toaster position="top-center" />
        <GlobalEffects />
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
