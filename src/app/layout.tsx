import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/layout/footer";
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
  title: "nukk.nl - Check nu.nl artikelen op feiten",
  description: "Ontdek waar mening als feit wordt gepresenteerd met onze AI-powered fact-checker voor Nederlandse nieuws",
  keywords: "fact-check, nieuws, nu.nl, AI, objectiviteit, mening, feiten",
  authors: [{ name: "nukk.nl team" }],
  openGraph: {
    title: "nukk.nl - Check nu.nl artikelen op feiten",
    description: "Ontdek waar mening als feit wordt gepresenteerd met onze AI-powered fact-checker",
    url: "https://nukk.nl",
    siteName: "nukk.nl",
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "nukk.nl - Check nu.nl artikelen op feiten",
    description: "AI-powered fact-checker voor Nederlandse nieuws",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
