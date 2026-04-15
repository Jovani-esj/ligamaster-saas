import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import SimpleNavigation from "@/components/SimpleNavigation";
import { SimpleAuthProvider } from "@/components/auth/SimpleAuthenticationSystem";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LigaMaster - Plataforma de Gestión de Ligas",
  description: "Sistema SaaS para la gestión completa de ligas deportivas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SimpleAuthProvider>
          <SimpleNavigation />
          <main className="flex-1">{children}</main>
          <Toaster />
        </SimpleAuthProvider>
      </body>
    </html>
  );
}
