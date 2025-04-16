// layout.js
"use client";
import { SessionProvider } from "next-auth/react";
import Navbar from "../components/Navbar";
import "./globals.css"; // ⬅️ This line is essential
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
