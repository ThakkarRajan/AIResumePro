"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  LogOut, 
  Home, 
  MessageSquare, 
  Settings,
  ChevronDown,
  Sparkles,
  Mail,
  Crown
} from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  const handleLogout = () => {
    localStorage.removeItem("tailoredResume");
    setShowModal(false);
    setShowMenu(false);
    signOut({ callbackUrl: "/" });
  };



  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`w-full px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
            : 'bg-white/95 backdrop-blur-sm shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Side: Logo & Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  width={48} 
                  height={48} 
                  className="rounded-xl shadow-sm"
                  style={{ width: "auto", height: "auto" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
              <div className="hidden sm:block">
                <Image
                  src="/Iloveresumelogotext.png"
                  alt="I Love Resume Logo"
                  width={200}
                  height={40}
                  className="h-8 object-contain"
                  style={{ width: "auto", height: "auto" }}
                />
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Sparkles className="w-3 h-3" />
                  <span>AI-Powered Resumes</span>
                </div>
              </div>
                          </Link>

                        {/* Mobile Branding */}
            {status === "authenticated" && (
              <div className="flex flex-direction-row sm:hidden items-center gap-3">
                <div className="flex flex-col  gap-2">
                  <Image
                    src="/Iloveresumelogotext.png"
                    alt="I Love Resume Logo"
                    width={150}
                    height={30}
                    className="h-6 object-contain"
                    style={{ width: "auto", height: "auto" }}
                  />
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    <span className="text-xs text-gray-500 font-medium">AI-Powered</span>
                  </div>
                </div>
              </div>
            )}
            </div>

          {/* Right Side: Profile Button */}
          <div className="relative" ref={menuRef}>
            {status === "authenticated" ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 sm:px-5 py-2 sm:py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg border border-purple-500/20"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="font-semibold text-sm">
                      {session?.user?.name?.split(' ')[0] || 'Profile'}
                    </div>
                    <div className="text-xs text-white/80">Premium User</div>
                  </div>
                  <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-80 sm:w-72 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden"
                    >
                      {/* Profile Header */}
                      <div className="p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {session?.user?.image ? (
                              <Image
                                src={session.user.image}
                                alt="Profile"
                                width={56}
                                height={56}
                                className="rounded-2xl border-2 border-white shadow-lg"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <User className="w-7 h-7 text-white" />
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg truncate">
                              {session?.user?.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{session?.user?.email}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Crown className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs font-medium text-yellow-700">Premium Member</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="p-2 sm:p-3">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 sm:gap-4 w-full px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all duration-200 group"
                          onClick={() => setShowMenu(false)}
                        >
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm sm:text-base">Dashboard</div>
                            <div className="text-xs text-gray-500">Manage your resumes</div>
                          </div>
                        </Link>

                        <Link
                          href="/myprofile"
                          className="flex items-center gap-3 sm:gap-4 w-full px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all duration-200 group"
                          onClick={() => setShowMenu(false)}
                        >
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm sm:text-base">My Profile</div>
                            <div className="text-xs text-gray-500">View submissions & settings</div>
                          </div>
                        </Link>

                        <Link
                          href="/contact"
                          className="flex items-center gap-3 sm:gap-4 w-full px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all duration-200 group"
                          onClick={() => setShowMenu(false)}
                        >
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm sm:text-base">Contact Us</div>
                            <div className="text-xs text-gray-500">Get help & support</div>
                          </div>
                        </Link>

                        <div className="border-t border-gray-100 my-2"></div>

                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowModal(true);
                          }}
                          className="flex items-center gap-3 sm:gap-4 w-full px-3 sm:px-4 py-2.5 sm:py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm sm:text-base">Logout</div>
                            <div className="text-xs text-red-500">Sign out of your account</div>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-gray-500"
              >
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                <span className="hidden sm:inline">Not signed in</span>
              </motion.div>
            )}
          </div>


        </div>


      </motion.nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md border border-gray-200/50"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                  <LogOut className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Confirm Logout
                  </h2>
                  <p className="text-sm text-gray-500">Sign out of your account</p>
                </div>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to logout? Any unsaved changes will be lost and you'll need to sign in again to access your account.
              </p>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg"
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
