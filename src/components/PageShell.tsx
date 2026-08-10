import type { ReactNode } from "react";

export function PageShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-strawberry-pattern min-h-screen">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {subtitle}
            <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-main-dark">
              {title}
            </h1>
          </div>
          {action}
        </header>
        {children}
      </div>
    </div>
  );
}
