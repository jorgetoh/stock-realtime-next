"use client";

import { motion } from "framer-motion";

interface AnimatedHeaderProps {
  title: string;
  subtitle: string;
}

export function AnimatedHeader({ title, subtitle }: AnimatedHeaderProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        mass: 1,
      },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.8,
      },
    },
  };

  return (
    <motion.header
      className="text-center space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl leading-tight"
        variants={titleVariants}
      >
        {title}
      </motion.h1>

      <motion.p
        className="text-xl text-muted-foreground"
        variants={subtitleVariants}
      >
        {subtitle}
      </motion.p>

      <motion.p
        variants={subtitleVariants}
        className="text-muted-foreground mt-[-1em]"
      >
        Press{" "}
        <kbd className="rounded border px-1 py-0.5 text-xs text-muted-foreground">
          ⌘
        </kbd>{" "}
        +{" "}
        <kbd className="rounded border px-1 py-0.5 text-xs text-muted-foreground">
          K
        </kbd>{" "}
        to navigate
      </motion.p>
    </motion.header>
  );
}
