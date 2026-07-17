"use client";
import Link from "next/link";
import { Appbar, Tabbar } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  const { ui } = useI18n();

  return (
    <>
      <Appbar home />
      <main className="home-main">
        <section className="hero hero-solo">
          <h1 style={{ whiteSpace: "pre-line" }}>{ui("heroTitle")}</h1>
          <p>{ui("heroDesc")}</p>
          <Link className="btn" href="/chat">{ui("heroCta")}</Link>
        </section>

        <p className="disclaimer">{ui("homeDisclaimer")}</p>
      </main>
      <Tabbar />
    </>
  );
}
