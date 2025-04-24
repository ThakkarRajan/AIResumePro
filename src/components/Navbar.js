"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tailoredResume"); // ✅ Only remove tailored resume
    setShowModal(false);
    setShowMenu(false);
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <nav className="w-full px-6 py-4 bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left Side: Logo & Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-blue-700 hover:text-blue-800 transition"
            >
              <Image src="/logo.png" alt="Logo" width={52} height={52} />
              <span className="hidden sm:inline-block">AIResumePro</span>
            </Link>

            {status === "authenticated" && (
              <div className="hidden sm:flex items-center gap-4 ml-6">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-blue-600 font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-blue-600 font-medium transition"
                >
                  Contact Us
                </Link>
              </div>
            )}
          </div>

          {/* Right Side: Profile Button */}
          <div className="relative" ref={menuRef}>
            {status === "authenticated" ? (
              <>
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition"
                >
                  Profile
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <Link
                      href="/myprofile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowModal(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-500 italic">
                Not signed in
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-black">
              Confirm Logout
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
