"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type IconMenuProps = {
  label: string;
  icon: ReactNode;
  /** 디자인 캔버스의 패널 폭. 언어 136px, 화면 모드 158px. */
  panelWidth: number;
  children: (close: () => void) => ReactNode;
};

/**
 * 원형 아이콘 버튼 + 드롭다운 패널. 디자인 캔버스의 상단 네비 우측
 * 컨트롤(언어·화면 모드)이 공유하는 형태다 — 36px 원형 버튼에
 * var(--c-line) 테두리, 패널은 top 46px / radius 14px / padding 6px.
 */
export function IconMenu({ label, icon, panelWidth, children }: IconMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // 바깥 클릭과 Esc로 닫는다 — 네이티브 메뉴와 같은 기대를 맞춘다.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="border-line text-ink flex size-9 items-center justify-center rounded-full border bg-[var(--surface-60)] transition-colors hover:bg-[var(--surface-90)]"
      >
        {icon}
      </button>

      {open && (
        <div
          id={panelId}
          role="menu"
          aria-label={label}
          style={{ minWidth: panelWidth }}
          className="border-line bg-paper animate-stagger-in absolute top-[46px] right-0 z-30 rounded-[14px] border p-1.5 shadow-[0_18px_40px_oklch(23%_0.055_250/0.16)]"
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

type IconMenuItemProps = {
  active?: boolean;
  disabled?: boolean;
  note?: string;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
};

export function IconMenuItem({
  active = false,
  disabled = false,
  note,
  icon,
  children,
  onClick,
}: IconMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={active}
      disabled={disabled}
      onClick={onClick}
      className={
        active
          ? "bg-sand text-ink flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[13px] font-bold"
          : "text-muted hover:bg-sand hover:text-ink flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[13px] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
      }
    >
      {icon}
      <span className="flex-1">{children}</span>
      {note !== undefined && (
        <span className="text-muted text-[10.5px]">{note}</span>
      )}
    </button>
  );
}
