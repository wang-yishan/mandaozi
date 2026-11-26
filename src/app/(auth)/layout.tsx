export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-theme min-h-[100dvh] bg-[var(--bg)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <div className="hanzi text-[40px] font-black leading-none text-[var(--primary)]">
            你
          </div>
          <div className="mt-2 text-sm font-bold tracking-[0.22em] text-[var(--muted)]">
            MANDAOZI
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}