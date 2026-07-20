// 인증 — Google OAuth 단일 프로바이더 (이메일/비밀번호 가입 없음)
// 자격증명은 .env.local 의 AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET / AUTH_SECRET 사용
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  callbacks: {
    // 세션에 안정적인 사용자 식별자(email) 노출 — 케이스 귀속에 사용
    session({ session, token }) {
      if (session.user && token.email) session.user.email = token.email;
      return session;
    },
  },
});
