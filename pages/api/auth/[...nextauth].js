import { addUser, existingUser, getUserByEmail } from '@/service/user';
import NextAuth from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';
import NaverProvider from 'next-auth/providers/naver';

export const authOptions = {
  debug: true, // 디버깅 활성화
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_OAUTH_ID || '',
    //   clientSecret: process.env.GOOGLE_OAUTH_SECRET || '',
    // }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID || '',
      clientSecret: process.env.NAVER_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user: { id, name, email, image }, account, profile }) {
      if (!email || !name) {
        return false;
      }

      const provider = account.provider;
      let gender = null;
      let phone_number = null;
      let birthday = null;
      let birthyear = null;

      const isUser = await existingUser(email);

      if (isUser) {
        if (isUser.provider !== account.provider) {
          return `/auth/signin?error=ALREADY_REGISTERED`;
        }
      }

      if (provider === 'naver') {
        const response = profile.response || {};
        gender =
          response.gender === 'M'
            ? '남성'
            : response.gender === 'F'
              ? '여성'
              : null;
        phone_number = response.mobile || null;
        birthday = response.birthday || null;
        birthyear = response.birthyear || null;
      }

      if (provider === 'kakao') {
        const response = profile.kakao_account || {};
        gender = response.gender || null; // null로 설정
        phone_number = response.phone_number || null;
        birthday = response.birthday || null;
        birthyear = response.birthyear || null;
      }

      // 새 사용자 추가
      try {
        await addUser({
          id,
          name,
          email,
          image,
          username: email.split('@')[0],
          level: 0,
          gender,
          phone_number,
          birthday,
          birthyear,
          provider: account.provider,
        });
        return true;
      } catch (error) {
        console.error('사용자 등록 중 오류 발생:', error);
        return false; // 로그인 실패
      }
    },
    async jwt({ token, user }) {
      const newToken = { ...token };
      if (user) {
        newToken.id = user.id;
      }

      const dbUser = await getUserByEmail(token.email);

      if (dbUser) {
        newToken.level = dbUser.level;
        newToken.gender = dbUser.gender;
      }

      return newToken;
    },
    async session({ session, token }) {
      // console.log(session, token);
      const newSession = { ...session };
      const user = newSession?.user;
      if (user) {
        newSession.user = {
          ...user,
          id: token.id,
          level: token.level,
          gender: token.gender,
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
