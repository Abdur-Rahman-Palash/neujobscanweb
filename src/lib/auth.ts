import NextAuth, { DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthUser } from '@/types';

declare module 'next-auth' {
  interface Session {
    user: AuthUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends AuthUser {}
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('=== AUTH AUTHORIZE CALLED ===');
        console.log('Credentials received:', {
          email: credentials?.email,
          passwordPresent: !!credentials?.password,
          passwordLength: credentials?.password?.length,
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('AUTH REJECTED: Missing credentials');
          return null;
        }

        try {
          // In production, this would connect to your database
          // For now, we'll simulate authentication
          const user: AuthUser = {
            id: '1',
            email: credentials.email,
            name: 'Demo User',
            role: 'user',
            subscription: 'free',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Validate password (in production, use bcrypt)
          if (credentials.password === 'demo123') {
            console.log('AUTH SUCCESS: Valid credentials for', credentials.email);
            console.log('Returning user:', user);
            return user;
          }

          console.log('AUTH FAILED: Invalid password for', credentials.email);
          return null;
        } catch (error) {
          console.error('AUTH ERROR:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subscription = user.subscription;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.subscription = token.subscription;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  secret: process.env.NEXTAUTH_SECRET || 'temp-secret-key-for-development-only',
};

export default NextAuth(authOptions);
