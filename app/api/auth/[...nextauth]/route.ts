import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

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
            allowDangerousEmailAccountLinking: true,
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
              } else {
                // Update existing user with Google info if not already set
                if (!user.name || user.name === 'User') {
                  user.name = profile.name || user.name;
                }
                await user.save();
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
    async redirect({ url, baseUrl }: any) {
      console.log('[NextAuth] Redirect - URL:', url, 'BaseUrl:', baseUrl);
      // Allow relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allow URLs on the same origin
      try {
        const urlObj = new URL(url);
        if (new URL(baseUrl).origin === urlObj.origin) return url;
      } catch (error) {
        console.log('[NextAuth] Redirect error parsing URL:', error);
      }
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
