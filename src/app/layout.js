// src/app/layout.js
// src/components/NavbarWrapper.js
"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import NavbarWrapper from "../components/NavbarWrapper";

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
