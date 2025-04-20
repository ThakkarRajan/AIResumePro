"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";

export default function MyProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">
        You must be signed in to view this page.
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 p-8">
      <div className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">My Profile</h1>
        <div className="flex flex-col items-center gap-4">
          {user?.image && (
            <Image
              src={user.image}
              alt="Profile picture"
              width={100}
              height={100}
              className="rounded-full border"
            />
          )}
          <p className="text-lg font-semibold text-gray-700">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
