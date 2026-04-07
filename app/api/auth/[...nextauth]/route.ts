import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

// Get the base URL dynamically - works for both localhost and preview domains
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectToDatabase();

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        }).select('+password');

        if (!user) {
          return null;
        }

        const isPasswordValid = await user.comparePassword(credentials.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            async profile(profile) {
              await connectToDatabase();

              // Upsert user in MongoDB
              let user = await User.findOne({
                email: profile.email?.toLowerCase(),
              });

              if (!user) {
                user = await User.create({
                  email: profile.email?.toLowerCase(),
                  name: profile.name || 'User',
                  // No password for Google-only users
                });
              }

              return {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                image: profile.picture,
              };
            },
          }),
        ]
      : []),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
      }
      return session;
    },
    async redirect({ url }: any) {
      // Allow relative URLs
      if (url.startsWith('/')) return url;
      // Allow URLs on the same origin
      try {
        const urlObj = new URL(url);
        const baseUrl = getBaseUrl();
        const baseUrlObj = new URL(baseUrl);
        if (urlObj.origin === baseUrlObj.origin) return url;
      } catch {
        // Invalid URL, redirect to dashboard
      }
      return '/dashboard';
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
