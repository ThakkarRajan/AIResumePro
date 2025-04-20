"use client";

import { SessionProvider } from "next-auth/react";
import NavbarWrapper from "../components/NavbarWrapper";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <NavbarWrapper />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
