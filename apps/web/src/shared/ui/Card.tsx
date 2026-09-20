import type { ElementType, ReactNode } from "react";

type CardProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
};

// DESIGN.md 6절: 반경 20px, 패딩 16-24, 그림자는 최소로만
export function Card({ as: Tag = "div", children, className = "" }: CardProps) {
  return (
    <Tag
      className={`border-line bg-paper rounded-[20px] border p-5 ${className}`}
    >
      {children}
    </Tag>
  );
}
