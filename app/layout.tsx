import "./globals.css";
import AuthProvider from "@/providers/SessionProvider";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "FinanceOS — Personal Finance Dashboard",
  description:
    "Track expenses, investments, net worth, and financial goals with a premium personal finance dashboard.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-[100dvh]" style={{ background: "#0a0a0f" }}>
        <AuthProvider>
          <div className="min-h-[100dvh] flex flex-col">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
