"use client";

import { SessionProvider } from "next-auth/react";
import NavbarWrapper from "../components/NavbarWrapper";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>I Love Resume - AI-Powered Resume Builder</title>
        <meta name="description" content="Transform your resume with AI-powered insights. Get personalized suggestions, optimize structure, and align keywords with job descriptions—all in seconds." />
        <meta name="keywords" content="resume builder, AI resume, job application, resume optimization, career tools" />
        <meta name="author" content="I Love Resume" />
        <meta property="og:title" content="I Love Resume - AI-Powered Resume Builder" />
        <meta property="og:description" content="Transform your resume with AI-powered insights. Get personalized suggestions, optimize structure, and align keywords with job descriptions—all in seconds." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="I Love Resume - AI-Powered Resume Builder" />
        <meta name="twitter:description" content="Transform your resume with AI-powered insights. Get personalized suggestions, optimize structure, and align keywords with job descriptions—all in seconds." />
      </head>
      <body>
        <SessionProvider>
          <NavbarWrapper />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
