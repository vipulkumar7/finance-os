export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-[100dvh] overflow-hidden px-4 bg-[var(--bg-primary)]">
      {children}
    </div>
  );
}
