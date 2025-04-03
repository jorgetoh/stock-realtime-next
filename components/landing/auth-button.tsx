"use client";

import { Button } from "@/components/ui/button";
import { ChartBarIcon } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/hooks/use-auth-hooks";
import { motion, AnimatePresence } from "framer-motion";

export function AuthButton() {
  const { data: session, isLoading } = useSession();
  const isLoggedIn = !!session;

  return (
    <div className="relative h-[40px] flex items-center justify-center">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute"
          />
        ) : isLoggedIn ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24,
            }}
            className="absolute"
          >
            <Link href="/dashboard">
              <Button size="lg">
                <ChartBarIcon className="mr-2" />
                Go to your dashboard
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute"
          >
            <Link href="/auth/sign-up">
              <Button size="lg">
                <ChartBarIcon className="mr-2" />
                Get started
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
