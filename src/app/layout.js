"use client";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import "./globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const showNavbar = pathname !== "/"; // Hide Navbar only on home page

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {showNavbar && <Navbar />}
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
