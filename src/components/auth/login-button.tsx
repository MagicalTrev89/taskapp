"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginButton() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", { password, redirect: false });

    if (result?.error) {
      setError("Incorrect password");
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        required
        autoFocus
      />
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white rounded-xl px-4 py-3 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
