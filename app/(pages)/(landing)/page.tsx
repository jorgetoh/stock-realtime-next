import { AnimatedGridPattern } from "@/components/landing/animated-grid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChartBarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AuthButton } from "@/components/landing/auth-button";
import { AnimatedHeader } from "@/components/landing/animated-header";

export default function Home() {
  return (
    <>
      <main className="relative flex min-h-screen flex-col items-center justify-center p-8 overflow-hidden drop-shadow-xl">
        <AnimatedGridPattern
          numLines={6}
          lineColors={[
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#ec4899",
          ]}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
          )}
        />

        <div className=" z-10 flex flex-col items-center space-y-12 max-w-4xl mx-auto">
          <AnimatedHeader
            title="Trading Simulator"
            subtitle="Experience real-time cryptocurrency trading with live market data"
          />

          <section className="flex flex-col items-center space-y-8">
            <AuthButton />
          </section>
        </div>

        <footer className="absolute bottom-0 left-0 right-0 text-center space-y-4 p-4">
          <p className="text-sm text-muted-foreground">
            A personal project by{" "}
            <a
              href="https://jorgetoh.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              @jorgetoh
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js, TypeScript, and WebSockets
          </p>
        </footer>
      </main>
    </>
  );
}
