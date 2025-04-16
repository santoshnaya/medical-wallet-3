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
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        
        // Add role to session
        const role = token.role as string || 'user';
        session.user.role = role;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // If this is the first sign in, set the role
      if (account && user) {
        // Default to user role
        token.role = 'user';
        
        // You could check the user's email against a list of admin/doctor emails
        // to assign the appropriate role
        if (user.email) {
          if (user.email.includes('admin')) {
            token.role = 'admin';
          } else if (user.email.includes('doctor')) {
            token.role = 'doctor';
          }
        }
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Always allow callback URLs
      if (url.startsWith('/api/auth/callback')) {
        return url;
      }

      // Get role from the URL if present
      const urlObj = new URL(url, baseUrl);
      const role = urlObj.searchParams.get('role') || 'user';

      // Determine redirect based on role
      switch (role) {
        case 'admin':
          return `${baseUrl}/admin/dashboard`;
        case 'doctor':
          return `${baseUrl}/doctor/dashboard`;
        default:
          return `${baseUrl}/user/fields`;
      }
    }
  },
});

export { handler as GET, handler as POST };