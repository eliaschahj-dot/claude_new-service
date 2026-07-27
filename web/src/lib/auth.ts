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
    // isAdmin: 클라이언트에서 관리자 메뉴 노출용 (실제 권한 검사는 서버 API에서 별도 수행)
    session({ session, token }) {
      if (session.user && token.email) session.user.email = token.email;
      const admins = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      (session as { isAdmin?: boolean }).isAdmin = !!token.email && admins.includes(token.email.toLowerCase());
      return session;
    },
  },
});
