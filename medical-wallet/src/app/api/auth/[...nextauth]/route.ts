import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// import { FirestoreAdapter } from "@next-auth/firebase-adapter";
// import { adminDb } from "@/lib/firebase-admin";

// For now, we'll use JWT strategy without the Firestore adapter
// This allows testing the Google sign-in without needing Firebase Admin credentials
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  // We'll comment out the adapter for now
  // adapter: adminDb ? FirestoreAdapter(adminDb) : undefined,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST }; 