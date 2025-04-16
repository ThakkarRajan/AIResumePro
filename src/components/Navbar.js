"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-lg font-semibold text-gray-800 hover:text-blue-600"
        >
          Home
        </Link>

        {status === "authenticated" && (
          <>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600"
            >
              Dashboard
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">
              Contact Us
            </Link>
          </>
        )}
      </div>

      <div>
        {status === "authenticated" ? (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        ) : (
          <span className="text-sm text-gray-400">Not signed in</span>
        )}
      </div>
    </nav>
  );
}
