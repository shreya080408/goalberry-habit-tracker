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
    <div className="min-h-screen">
      <div className="animate-pop-in mx-auto w-full max-w-2xl px-4 pb-28 pt-4 sm:py-12 md:pb-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {subtitle}
            <h1 className="font-display heading-shadow mt-1 text-3xl tracking-tight text-main-dark">
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
