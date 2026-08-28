import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-areia text-cinza-claro">
        {icon}
      </span>
      <p className="text-[16px] font-semibold text-tinta">{title}</p>
      {description ? <p className="mt-1 max-w-[36ch] text-[14px] text-cinza">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-suave bg-areia ${className}`} aria-hidden />;
}
