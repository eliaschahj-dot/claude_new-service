import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "이용약관" };

const S = {
  h2: { fontSize: "1rem", fontWeight: 700, borderBottom: "2px solid var(--line)", paddingBottom: 6, margin: "26px 0 12px" } as const,
  p: { fontSize: ".88rem", lineHeight: 1.8, color: "var(--ink)", margin: "0 0 12px" } as const,
  ul: { fontSize: ".88rem", lineHeight: 1.9, paddingLeft: 20, margin: "0 0 12px" } as const,
  note: { fontSize: ".8rem", color: "var(--ink-soft)" } as const,
};

export default function TermsPage() {
  return (
    <>
      <header className="appbar">
        <Link className="back" href="/profile" aria-label="back">‹</Link>
        <span className="title">이용약관</span>
      </header>
      <main>
        <div className="card" style={{ padding: "22px 20px" }}>
          <p style={S.note}>
            시행일: 2026년 7월 28일 · 본 약관은 국문본을 기준으로 하며, 번역본은 참고용입니다.<br />
            The Korean version of these terms is authoritative; translations are for reference only.
          </p>

          <h2 style={S.h2}>제1조 (목적)</h2>
          <p style={S.p}>
            이 약관은 [사무소명] (이하 &quot;사무소&quot;)가 운영하는 K-Visa Assist 서비스(visa-korean.com, 이하
            &quot;서비스&quot;)의 이용 조건 및 절차, 사무소와 이용자의 권리·의무·책임 사항을 정함을 목적으로 합니다.
          </p>

          <h2 style={S.h2}>제2조 (서비스의 내용)</h2>
          <ul style={S.ul}>
            <li>AI 챗봇을 통한 한국 비자·체류자격 관련 정보 안내 (무료)</li>
            <li>변호사·행정사의 케이스 검토 (무료)</li>
            <li>비자 신청 등 출입국 민원 대행 (유료 — 별도 위임계약 체결 후 진행되며, 보수는 계약 시 안내)</li>
            <li>신청 진행 상태 확인, 서류 제출, 담당자 메시지 기능</li>
          </ul>

          <h2 style={S.h2}>제3조 (AI 상담의 성격과 한계)</h2>
          <p style={S.p}>
            서비스의 AI 챗봇 안내는 하이코리아(hikorea.go.kr) 등 공개 정보에 기반한 <b>일반적·참고용 정보 제공</b>이며,
            개별 사안에 대한 법률 자문이나 결과의 보증이 아닙니다. 구체적인 사안에 대한 판단은 위임계약에 따라
            변호사·행정사가 실제 서류를 검토한 후 이루어지며, 비자 발급 여부는 최종적으로 출입국·외국인청의 재량에 따릅니다.
          </p>

          <h2 style={S.h2}>제4조 (회원 및 계정)</h2>
          <ul style={S.ul}>
            <li>회원 가입은 구글 계정 또는 이메일 인증을 통해 이루어집니다.</li>
            <li>계정은 본인만 사용할 수 있으며, 계정 정보의 관리 책임은 이용자에게 있습니다.</li>
            <li>이용자는 언제든지 탈퇴(계정 삭제)를 요청할 수 있습니다.</li>
          </ul>

          <h2 style={S.h2}>제5조 (이용자의 의무)</h2>
          <ul style={S.ul}>
            <li>상담·신청 과정에서 정확하고 진실한 정보를 제공해야 합니다. 허위 정보 제공으로 인한 불이익은 이용자가 부담합니다.</li>
            <li>타인의 정보를 도용하거나 서비스를 부정한 목적으로 이용해서는 안 됩니다.</li>
            <li>서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.</li>
          </ul>

          <h2 style={S.h2}>제6조 (대행 업무의 수임)</h2>
          <p style={S.p}>
            서비스 내 &quot;신청 시작&quot;은 대행 업무의 예약·준비 절차이며, 실제 대행 업무는 위임장 작성 및
            보수 안내에 대한 동의(별도 위임계약)가 완료된 때부터 개시됩니다. 사무소는 사안의 내용이
            법령에 위반되거나 수행이 곤란한 경우 수임을 거절할 수 있습니다.
          </p>

          <h2 style={S.h2}>제7조 (면책)</h2>
          <p style={S.p}>다음 사유로 인한 결과에 대하여 사무소는 책임을 지지 않습니다.</p>
          <ul style={S.ul}>
            <li>출입국 당국의 재량에 따른 비자 불허·취소 등 처분 (다만 위임계약에 따른 불복 절차 지원은 별도로 안내)</li>
            <li>이용자가 제공한 허위·부정확한 정보 또는 서류 미비로 인한 결과</li>
            <li>법령·고시 개정에 따른 요건 변경</li>
            <li>천재지변, 통신 장애 등 불가항력적 사유로 인한 서비스 중단</li>
          </ul>

          <h2 style={S.h2}>제8조 (저작권)</h2>
          <p style={S.p}>
            서비스 내 콘텐츠의 저작권은 사무소에 귀속되며, 사전 서면 동의 없이 복제·배포·전송할 수 없습니다.
            이용자가 업로드한 서류의 권리는 이용자에게 있으며, 사무소는 대행 업무 수행 목적으로만 이를 이용합니다.
          </p>

          <h2 style={S.h2}>제9조 (약관의 변경)</h2>
          <p style={S.p}>
            사무소는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 시행 7일 전부터
            서비스 내 공지합니다. 이용자에게 불리한 변경은 30일 전에 공지합니다.
          </p>

          <h2 style={S.h2}>제10조 (준거법 및 관할)</h2>
          <p style={S.p}>
            이 약관은 대한민국 법률에 따라 해석되며, 서비스 이용과 관련한 분쟁은 민사소송법에 따른 관할법원에 제기합니다.
          </p>

          <h2 style={S.h2}>제11조 (문의)</h2>
          <p style={S.p}>
            [사무소명] · 대표 [대표자명] (변호사·행정사)<br />
            [사무소 주소]<br />
            [대표 이메일] / [대표 전화]
          </p>

          <p style={S.note}>본 약관은 2026년 7월 28일부터 적용됩니다.</p>
        </div>
      </main>
    </>
  );
}
