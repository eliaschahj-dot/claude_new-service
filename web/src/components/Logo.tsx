// K-Visa Assist 로고 — 여권 도장(스탬프) 모티프의 K 마크.
// favicon(src/app/icon.svg)과 동일한 도안을 공유한다.
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="58" height="58" rx="15" fill="#1a56db" />
      <rect x="8.5" y="8.5" width="47" height="47" rx="10.5" fill="none" stroke="#ffffff" strokeOpacity=".35" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
      <path d="M23 19v26" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
      <path d="M42 19 27.5 32 42 45" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46 13.5l7.5 3.2-9.3 2.4 1.8-5.6z" fill="#9db9f2" />
    </svg>
  );
}

export function LogoWordmark({ size = 26 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Logo size={size} />
      <span>K-Visa Assist</span>
    </span>
  );
}
