import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TanstackQueryProvider } from "@/components/providers/tanstack-query-provider";
import { AuthProvider } from "@/components/providers/session-provider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TaskApp",
  description: "Collaborative task management with Kanban boards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <TanstackQueryProvider>{children}</TanstackQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}