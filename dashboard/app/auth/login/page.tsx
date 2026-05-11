import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  return (
    <div className="flex w-full flex-1 overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm">
      <section className="relative hidden w-[45%] flex-col justify-between bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <Icon name="logo" className="h-10 w-10" />
          <div className="text-lg font-semibold">Sygn</div>
        </div>

        <div className="max-w-sm">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Empower your teaching experience.
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Manage classes, track attendance, and streamline your academic
            workflow all in one intuitive dashboard.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/10 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-black/20 ring-1 ring-white/10">
              <Icon name="dashboard" className="h-5 w-5 text-orange-300" />
            </span>
            <div>
              <div className="text-sm font-semibold">Smart Analytics</div>
              <div className="text-xs text-white/70">
                Real-time attendance tracking
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-white/60">
          <Link href="#" className="hover:text-white">
            Help Center
          </Link>
          <Link href="#" className="hover:text-white">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-white">
            Terms of Service
          </Link>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <Icon name="logo" className="h-10 w-10" />
            <div className="text-lg font-semibold text-zinc-900">Sygn</div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Please enter your lecturer credentials to access your dashboard.
          </p>

          <div className="mt-8 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">
                Email or Lecturer ID
              </label>
              <Input placeholder="Enter your email or ID" left={<span>@</span>} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs font-medium text-orange-600 hover:text-orange-700"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                placeholder="Enter your password"
                type="password"
                left={<span>●</span>}
                right={<Icon name="search" className="h-4 w-4 opacity-0" />}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 text-orange-600 focus:ring-orange-400"
                defaultChecked
              />
              Keep me signed in
            </label>

            <Button href="/dashboard" className="w-full" size="md">
              Sign in to Dashboard
            </Button>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-100" />
              <div className="text-xs text-zinc-400">Or continue with</div>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="md" className="justify-center">
                Google
              </Button>
              <Button variant="outline" size="md" className="justify-center">
                Microsoft
              </Button>
            </div>

            <div className="pt-2 text-center text-xs text-zinc-500">
              Having trouble signing in?{" "}
              <Link
                href="#"
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                Contact IT Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

