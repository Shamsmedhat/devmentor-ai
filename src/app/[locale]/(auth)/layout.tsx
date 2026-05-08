import { AuthToaster } from "@/components/features/auth/auth-toaster";

type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#050505]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 dot-grid opacity-50"
      />
      <div className="relative z-10 w-full">{children}</div>
      <AuthToaster />
    </div>
  );
}
