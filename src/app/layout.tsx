import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/ui/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CampusNest — Find Student Housing Near Nigerian Universities",
  description:
    "Discover rooms, lodges, and apartments near your Nigerian university campus. Browse listings, read reviews, find roommates, and chat with verified landlords — all in one social feed.",
  keywords: [
    "student housing Nigeria",
    "UNILAG accommodation",
    "university lodge",
    "Nigerian student rooms",
    "campus accommodation",
    "roommate finder Nigeria",
  ],
  openGraph: {
    title: "CampusNest — Student Housing Made Social",
    description:
      "Scroll, discover, and find your perfect lodge near campus. Like Instagram, but for student housing.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#f8f9fc" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <div className="flex-1 md:pl-64">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
