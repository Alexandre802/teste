import type { ReactNode } from "react";

/** Cartão branco, borda discreta e sombra quase invisível — a base de tudo. */
export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag
      className={`rounded-card border border-borda bg-branco shadow-card ${className}`}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2">
      <h2 className="text-[15px] font-semibold text-tinta">{title}</h2>
      {action}
    </div>
  );
}

/** Linha clicável de lista dentro de um cartão. */
export function CardRow({
  children,
  className = "",
  divider = true,
}: {
  children: ReactNode;
  className?: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 ${divider ? "border-b border-borda last:border-b-0" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
