// 인증 — Google OAuth + 이메일 인증코드(OTP, 구글 차단 지역용). 비밀번호 가입 없음.
// 자격증명은 .env.local 의 AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET / AUTH_SECRET 사용
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { verifyLoginCode, isValidEmail } from "./otp";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    // 이메일 인증코드 로그인 — 중국 등 구글 접속 불가 지역용 (JWT 세션이라 어댑터 불필요)
    Credentials({
      id: "email-otp",
      name: "Email code",
      credentials: { email: {}, code: {} },
      async authorize(creds) {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        const code = String(creds?.code ?? "").trim();
        if (!isValidEmail(email) || !/^\d{6}$/.test(code)) return null;
        const ok = await verifyLoginCode(email, code);
        return ok ? { id: email, email, name: email.split("@")[0] } : null;
      },
    }),
  ],
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
