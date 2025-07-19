// app/api/auth/[...nextauth]/route.js or route.ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../../utils/firebase";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
    newUser: "/dashboard",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user already exists in Firebase
          const userRef = doc(db, "users", user.email);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            // User doesn't exist, add them to Firebase
            await setDoc(userRef, {
              uid: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              provider: account.provider,
              createdAt: new Date(),
              lastLogin: new Date(),
              isActive: true,
            });
          } else {
            // User exists, update last login
            await setDoc(userRef, {
              lastLogin: new Date(),
              isActive: true,
            }, { merge: true });
          }
        } catch (error) {
          // Log error but don't prevent sign in
          console.error("Error saving user to Firebase:", error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Add user ID to session if needed
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
