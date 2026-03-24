import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "tippy.js/dist/tippy.css";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import GlobalAIChatButton from "@/components/ai-chat/GlobalAIChatButton";
import { CookieBanner } from "@/components/ui/cookie-banner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlogX - Premium Publishing Platform",
  description: "A rich-text blog platform for developers and writers.",
  icons: [
    {
      url: "/favicon.jpg",
      href: "/favicon.jpg",
    },
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <GlobalAIChatButton />
            <CookieBanner />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
