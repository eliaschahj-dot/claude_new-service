import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "개인정보처리방침" };

// 법적 문서는 국문본을 기준으로 함 — 상단에 외국인 이용자용 안내 표기
const S = {
  h2: { fontSize: "1rem", fontWeight: 700, borderBottom: "2px solid var(--line)", paddingBottom: 6, margin: "26px 0 12px" } as const,
  p: { fontSize: ".88rem", lineHeight: 1.8, color: "var(--ink)", margin: "0 0 12px" } as const,
  ul: { fontSize: ".88rem", lineHeight: 1.9, paddingLeft: 20, margin: "0 0 12px" } as const,
  note: { fontSize: ".8rem", color: "var(--ink-soft)" } as const,
};

export default function PrivacyPage() {
  return (
    <>
      <header className="appbar">
        <Link className="back" href="/profile" aria-label="back">‹</Link>
        <span className="title">개인정보처리방침</span>
      </header>
      <main>
        <div className="card" style={{ padding: "22px 20px" }}>
          <p style={S.note}>
            시행일: 2026년 7월 28일 · 본 방침은 국문본을 기준으로 하며, 번역본은 참고용입니다.<br />
            The Korean version of this policy is authoritative; translations are for reference only.
          </p>

          <h2 style={S.h2}>제1조 (총칙)</h2>
          <p style={S.p}>
            [사무소명] (이하 &quot;사무소&quot;)는 K-Visa Assist 서비스(visa-korean.com, 이하 &quot;서비스&quot;)를 운영하며,
            「개인정보 보호법」 등 관련 법령에 따라 이용자의 개인정보를 적법하게 처리하고 안전하게 관리합니다.
            본 방침은 서비스 이용 과정에서 처리되는 개인정보의 항목·목적·보유기간과 정보주체의 권리를 안내합니다.
          </p>

          <h2 style={S.h2}>제2조 (수집하는 개인정보 항목 및 수집 방법)</h2>
          <ul style={S.ul}>
            <li><b>회원 정보</b>: 이메일 주소, 이름·프로필 사진(구글 로그인 시 구글 계정으로부터 제공받는 범위)</li>
            <li><b>상담 정보</b>: AI 챗봇 상담 대화 내용(이용자가 입력한 국적, 체류자격, 학력, 경력, 소득, 가족관계 등 상담에 필요한 정보 포함)</li>
            <li><b>신청 정보</b>: 비자 유형, 신청 종류, 서류 제출 상태, 담당자와 주고받은 메시지</li>
            <li><b>제출 서류</b>: 이용자가 업로드하는 서류 파일(여권 사본, 증명서 등 — 파일에 포함된 정보 일체)</li>
            <li><b>자동 수집 정보</b>: 접속 기록(익명 방문자 식별자, 접속 일시, 페이지 이용 기록, 브라우저 정보)</li>
          </ul>
          <p style={S.p}>개인정보는 이용자가 서비스 화면에서 직접 입력·업로드하거나, 구글 로그인 연동을 통해 수집됩니다.</p>

          <h2 style={S.h2}>제3조 (개인정보의 처리 목적)</h2>
          <ul style={S.ul}>
            <li>비자·체류자격 관련 AI 상담 및 전문가(변호사·행정사) 검토 제공</li>
            <li>출입국 민원 대행 업무의 수임·수행(서류 검토, 신청서 작성·접수 대행)</li>
            <li>회원 식별, 신청 진행 상태 안내, 담당자 메시지·이메일 알림 발송</li>
            <li>서비스 품질 개선을 위한 이용 통계 분석(익명화된 방문 기록)</li>
          </ul>

          <h2 style={S.h2}>제4조 (개인정보의 보유 및 이용 기간)</h2>
          <ul style={S.ul}>
            <li>회원 정보·상담 기록: 회원 탈퇴 또는 삭제 요청 시까지 (요청 후 지체 없이 파기)</li>
            <li>대행 업무 관련 기록(신청 정보·제출 서류): 위임 사무 종료 후 3년 (행정사법 등 관련 법령상 장부·서류 보존 의무 기간)</li>
            <li>접속 기록: 3개월 (통신비밀보호법)</li>
            <li>그 밖에 법령에서 보존을 요구하는 경우 해당 기간</li>
          </ul>

          <h2 style={S.h2}>제5조 (개인정보의 제3자 제공)</h2>
          <p style={S.p}>
            사무소는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 다음의 경우는 예외로 합니다.
          </p>
          <ul style={S.ul}>
            <li>비자 신청 대행을 위해 이용자의 동의(위임)를 받아 법무부 출입국·외국인청 등 관계 기관에 제출하는 경우</li>
            <li>이용자가 별도로 동의한 경우 또는 법령에 근거가 있는 경우</li>
          </ul>

          <h2 style={S.h2}>제6조 (개인정보 처리의 위탁 및 국외 이전)</h2>
          <p style={S.p}>서비스 운영을 위해 다음 업무를 위탁하고 있으며, 일부 수탁자는 국외(미국)에서 정보를 처리합니다.</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: ".8rem" }}>
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  <th style={{ border: "1px solid var(--line)", padding: "8px 10px", textAlign: "left" }}>수탁자</th>
                  <th style={{ border: "1px solid var(--line)", padding: "8px 10px", textAlign: "left" }}>위탁 업무</th>
                  <th style={{ border: "1px solid var(--line)", padding: "8px 10px", textAlign: "left" }}>처리 국가</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ border: "1px solid var(--line)", padding: "8px 10px" }}>Vercel Inc.</td><td style={{ border: "1px solid var(--line)", padding: "8px 10px" }}>웹 서비스 호스팅</td><td style={{ border: "1px solid var(--line)", padding: "8px 10px" }}>미국</td></tr>
                <tr><td style={{ border: "1px solid var(--line)", padding: "8px 10px" }}>Neon Inc.</td><td style={{ border: "1px solid var(--line)", padding: "8px 10px" }}>데이터베이스 보관</td><td style={{ border: "1px solid var(--line)", padding: "8px 10px" }}>싱가포르/미국</td></tr>
                <tr><td style={{ border: "1px solid var(--line)", padding: "8px 10px" }}>Anthropic PBC</td><td style={{ border: "1px solid var(--line)", padding: "8px 10px" }}>AI 상담 응답 생성(대화 내용 처리)</td><td style={{ border: "1px solid var(--line)", padding: "8px 10px" }}>미국</td></tr>
                <tr><td style={{ border: "1px solid var(--line)", padding: "8px 10px" }}>Google LLC</td><td style={{ border: "1px solid var(--line)", padding: "8px 10px" }}>로그인 인증, 알림 메일 발송</td><td style={{ border: "1px solid var(--line)", padding: "8px 10px" }}>미국</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ ...S.p, marginTop: 12 }}>
            수탁자는 위탁 업무 수행에 필요한 범위에서만 개인정보를 처리하며, 사무소는 관련 법령에 따라 수탁자를 관리·감독합니다.
          </p>

          <h2 style={S.h2}>제7조 (정보주체의 권리와 행사 방법)</h2>
          <p style={S.p}>
            이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요구할 수 있습니다.
            아래 연락처로 요청하시면 지체 없이 조치하며, 삭제 요청 시 법령상 보존 의무가 있는 정보를 제외하고 파기합니다.
          </p>

          <h2 style={S.h2}>제8조 (개인정보의 안전성 확보 조치)</h2>
          <ul style={S.ul}>
            <li>전송 구간 암호화(HTTPS) 및 접근 권한 관리(케이스별 소유자 검증)</li>
            <li>제출 서류·상담 기록에 대한 관리자 접근 최소화</li>
            <li>인증 정보의 암호화 저장</li>
          </ul>

          <h2 style={S.h2}>제9조 (개인정보 보호책임자)</h2>
          <p style={S.p}>
            성명: [대표자명] (변호사·행정사)<br />
            소속: [사무소명]<br />
            연락처: [대표 이메일] / [대표 전화]<br />
          </p>

          <h2 style={S.h2}>제10조 (방침의 변경)</h2>
          <p style={S.p}>
            본 방침의 내용이 변경되는 경우 시행 7일 전부터 서비스 내 공지사항을 통해 안내합니다.
          </p>

          <p style={S.note}>본 방침은 2026년 7월 28일부터 적용됩니다.</p>
        </div>
      </main>
    </>
  );
}
