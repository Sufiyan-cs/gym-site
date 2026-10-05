import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "AM-Tippu Athletic Serenity",
  description: "AM-Tippu Fitness – Athletic Serenity & High-Performance Vault",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="dark" lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-surface-container-lowest text-on-surface antialiased min-h-screen font-body-md text-body-md overflow-x-hidden">
        <AuthProvider>
          <div className="w-full max-w-md mx-auto min-h-screen relative">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
