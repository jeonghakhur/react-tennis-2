import { addUser } from '@/service/user';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';
import NaverProvider from 'next-auth/providers/naver';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_ID || '',
      clientSecret: process.env.GOOGLE_OAUTH_SECRET || '',
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || '',
      clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID || '',
      clientSecret: process.env.NAVER_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user: { id, name, email, image } }) {
      if (!email || !name) {
        return false;
      }
      addUser({
        id,
        name,
        email,
        image,
        username: email.split('@')[0],
      });
      return true;
    },
    async jwt({ token, user }) {
      const newToken = { ...token };
      if (user) {
        newToken.id = user.id;
      }
      return newToken;
    },
    async session({ session, token }) {
      const newSession = { ...session };
      const user = newSession?.user;
      if (user) {
        newSession.user = {
          ...user,
          id: token.id,
          userName: user.email?.split('@')[0] || '',
        };
      }

      return newSession;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

export default NextAuth(authOptions);
