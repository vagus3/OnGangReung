import Link from "next/link";
import type { ReactNode } from "react";

/** 로그인·가입이 공유하는 틀. 디자인 파일이 없어 앱의 시각 언어로 짰다. */
export function AuthShell({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-[480px] px-4 pt-10 pb-24 sm:px-6 md:pb-16">
      <Link href="/" className="text-muted hover:text-ink text-[12.5px]">
        ← 돌아가기
      </Link>

      <p className="text-muted mt-8 text-[10.5px] font-bold tracking-[0.2em]">
        {eyebrow}
      </p>
      <h1 className="font-display text-ink mt-2 text-[28px] leading-tight">
        {title}
      </h1>
      <p className="text-muted mt-3 text-[13px] leading-relaxed">{lead}</p>

      <div className="mt-8">{children}</div>
    </main>
  );
}
