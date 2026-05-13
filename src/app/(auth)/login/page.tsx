import type { Metadata } from "next";
import { LoginButton } from "@/components/auth/login-button";

export const metadata: Metadata = {
  title: "Sign In — TaskApp",
  description: "Sign in to TaskApp with your Google account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg shadow-primary/20">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink">TaskApp</h1>
          <p className="text-ink/60 mt-1">
            Manage tasks. Move work forward.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-center mb-6">
            Sign in to your account
          </h2>

          <LoginButton />

          <div className="mt-6 text-center">
            <p className="text-xs text-ink/40">
              By signing in, you agree to our
              <br />
              <a href="#" className="text-primary hover:underline cursor-pointer">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline cursor-pointer">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-ink/30 mt-6">
          No email/password signup available.
        </p>
      </div>
    </div>
  );
}