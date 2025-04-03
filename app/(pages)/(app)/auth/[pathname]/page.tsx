import { AuthCard } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return Object.values(authViewPaths).map((pathname) => ({ pathname }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ pathname: string }>;
}) {
  const { pathname } = await params;

  return (
    <main className="flex min-h-screen grow flex-col items-center justify-center gap-3 p-4">
      <AuthCard pathname={pathname} />
      <p
        className={cn(
          ["callback", "settings", "sign-out"].includes(pathname) && "hidden",
          "text-muted-foreground text-xs flex items-center gap-1"
        )}
      >
        Press <kbd className="rounded border px-1 py-0.5 text-xs">⌘</kbd> +{" "}
        <kbd className="rounded border px-1 py-0.5 text-xs">K</kbd> to navigate
      </p>
    </main>
  );
}
