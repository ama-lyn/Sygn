export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-zinc-50">
      <div className="mx-auto flex min-h-full w-full max-w-[1200px] items-stretch px-4 py-6">
        {children}
      </div>
    </div>
  );
}

